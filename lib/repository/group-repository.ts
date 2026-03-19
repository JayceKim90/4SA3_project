import { randomUUID } from "crypto";
import type { Document, Filter } from "mongodb";
import { getMongoDb, COLLECTIONS, byId } from "@/lib/mongo";
import type {
  Hobby,
  HobbyFilters,
  HobbySearchResult,
  User,
} from "@/lib/types";
import type { BaseRepository } from "./base-repository";

export interface IHobbyRepository extends BaseRepository<Hobby> {
  findByFilters(filters: HobbyFilters): Promise<HobbySearchResult[]>;
  findByHostId(hostId: string): Promise<Hobby[]>;
  findUpcoming(): Promise<Hobby[]>;
}

function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function haversineKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function startOfTodayUtc(): Date {
  const d = new Date();
  d.setUTCHours(0, 0, 0, 0);
  return d;
}

type HobbyDoc = {
  _id: string;
  hostId: string;
  title: string;
  category: string;
  tags: string[];
  date: Date;
  startTime: string;
  endTime: string;
  capacity: number;
  address: string;
  latitude: number;
  longitude: number;
  placeId?: string | null;
  description?: string | null;
  createdAt: Date;
  updatedAt: Date;
  location: { type: "Point"; coordinates: [number, number] };
};

export class MongoHobbyRepository implements IHobbyRepository {
  private mapDoc(row: HobbyDoc, host?: User | null): Hobby {
    const g: Hobby = {
      id: row._id,
      hostId: row.hostId,
      title: row.title,
      category: row.category || "general",
      tags: row.tags || [],
      date: row.date instanceof Date ? row.date : new Date(row.date),
      startTime: row.startTime,
      endTime: row.endTime,
      capacity: row.capacity,
      location: {
        address: row.address,
        latitude: row.latitude,
        longitude: row.longitude,
        placeId: row.placeId || undefined,
      },
      description: row.description || undefined,
      createdAt:
        row.createdAt instanceof Date ? row.createdAt : new Date(row.createdAt),
      updatedAt:
        row.updatedAt instanceof Date ? row.updatedAt : new Date(row.updatedAt),
    };
    if (host) g.host = host;
    return g;
  }

  private async loadHost(hostId: string): Promise<User | null> {
    const db = await getMongoDb();
    const u = await db
      .collection(COLLECTIONS.users)
      .findOne(byId(hostId));
    if (!u) return null;
    return {
      id: String(u._id),
      email: u.email as string,
      name: u.name as string,
      createdAt: new Date(u.createdAt as Date),
    };
  }

  async findById(id: string): Promise<Hobby | null> {
    const db = await getMongoDb();
    const row = (await db
      .collection(COLLECTIONS.hobbies)
      .findOne(byId(id))) as HobbyDoc | null;
    if (!row) return null;
    const host = await this.loadHost(row.hostId);
    return this.mapDoc(row, host);
  }

  async findAll(): Promise<Hobby[]> {
    const db = await getMongoDb();
    const rows = (await db
      .collection(COLLECTIONS.hobbies)
      .find({} as unknown as Filter<Document>)
      .sort({ date: 1, startTime: 1 })
      .toArray()) as unknown as HobbyDoc[];
    const out: Hobby[] = [];
    for (const row of rows) {
      const host = await this.loadHost(row.hostId);
      out.push(this.mapDoc(row, host));
    }
    return out;
  }

  async create(
    data: Omit<Hobby, "id" | "createdAt" | "updatedAt">
  ): Promise<Hobby> {
    const db = await getMongoDb();
    const id = randomUUID();
    const now = new Date();
    const lat = data.location.latitude;
    const lng = data.location.longitude;
    const doc: HobbyDoc = {
      _id: id,
      hostId: data.hostId,
      title: data.title,
      category: data.category,
      tags: data.tags,
      date: data.date,
      startTime: data.startTime,
      endTime: data.endTime,
      capacity: data.capacity,
      address: data.location.address,
      latitude: lat,
      longitude: lng,
      placeId: data.location.placeId ?? null,
      description: data.description ?? null,
      createdAt: now,
      updatedAt: now,
      location: { type: "Point", coordinates: [lng, lat] },
    };
    await db.collection(COLLECTIONS.hobbies).insertOne(doc as Document);
    const created = await this.findById(id);
    if (!created) throw new Error("Failed to create hobby");
    return created;
  }

  async update(id: string, data: Partial<Hobby>): Promise<Hobby> {
    const db = await getMongoDb();
    const $set: Record<string, unknown> = { updatedAt: new Date() };

    if (data.title !== undefined) $set.title = data.title;
    if (data.category !== undefined) $set.category = data.category;
    if (data.tags !== undefined) $set.tags = data.tags;
    if (data.date !== undefined) $set.date = data.date;
    if (data.startTime !== undefined) $set.startTime = data.startTime;
    if (data.endTime !== undefined) $set.endTime = data.endTime;
    if (data.capacity !== undefined) $set.capacity = data.capacity;
    if (data.description !== undefined) $set.description = data.description;
    if (data.location !== undefined) {
      $set.address = data.location.address;
      $set.latitude = data.location.latitude;
      $set.longitude = data.location.longitude;
      $set.placeId = data.location.placeId ?? null;
      $set.location = {
        type: "Point",
        coordinates: [data.location.longitude, data.location.latitude],
      };
    }

    const upd = await db
      .collection(COLLECTIONS.hobbies)
      .updateOne(byId(id), { $set });
    if (upd.matchedCount === 0) throw new Error("Hobby not found");
    const row = (await db
      .collection(COLLECTIONS.hobbies)
      .findOne(byId(id))) as HobbyDoc | null;
    if (!row) throw new Error("Hobby not found");
    const host = await this.loadHost(row.hostId);
    return this.mapDoc(row, host);
  }

  async delete(id: string): Promise<void> {
    const db = await getMongoDb();
    await db
      .collection(COLLECTIONS.hobbies)
      .deleteOne(byId(id));
  }

  async findByFilters(filters: HobbyFilters): Promise<HobbySearchResult[]> {
    const db = await getMongoDb();
    const coll = db.collection(COLLECTIONS.hobbies);

    const match: Record<string, unknown> = {
      date: { $gte: startOfTodayUtc() },
    };

    if (filters.subject) {
      match.title = {
        $regex: escapeRegex(filters.subject),
        $options: "i",
      };
    }

    if (filters.category) {
      match.category = filters.category;
    }

    if (filters.tags && filters.tags.length > 0) {
      match.tags = { $in: filters.tags };
    }

    if (filters.date) {
      const d = new Date(filters.date);
      const start = new Date(d);
      start.setUTCHours(0, 0, 0, 0);
      const end = new Date(d);
      end.setUTCHours(23, 59, 59, 999);
      match.date = { $gte: start, $lte: end };
    }

    const useGeoNear =
      filters.userLocation &&
      filters.maxDistance != null &&
      filters.maxDistance > 0;

    let rows: HobbyDoc[];

    if (useGeoNear) {
      const { latitude, longitude } = filters.userLocation!;
      const pipeline = [
        {
          $geoNear: {
            near: {
              type: "Point",
              coordinates: [longitude, latitude],
            },
            distanceField: "geoDistanceM",
            maxDistance: filters.maxDistance! * 1000,
            spherical: true,
            query: match,
          },
        },
      ];
      rows = (await coll
        .aggregate(pipeline)
        .toArray()) as unknown as HobbyDoc[];
    } else {
      rows = (await coll
        .find(match as unknown as Filter<Document>)
        .sort({ date: 1, startTime: 1 })
        .toArray()) as unknown as HobbyDoc[];
    }

    const hobbyIds = rows.map((r) => r._id);
    const participantsByHobby: Record<string, import("@/lib/types").HobbyParticipant[]> =
      {};

    if (hobbyIds.length > 0) {
      const participantRows = await db
        .collection(COLLECTIONS.participants)
        .find({ hobbyId: { $in: hobbyIds } } as unknown as Filter<Document>)
        .toArray();

      for (const p of participantRows) {
        const doc = p as Document;
        const hid = String(doc.hobbyId);
        if (!participantsByHobby[hid]) participantsByHobby[hid] = [];
        participantsByHobby[hid].push({
          id: String(doc._id),
          hobbyId: hid,
          userId: String(doc.userId),
          contactEmail: doc.contactEmail as string | undefined,
          contactPhone: doc.contactPhone as string | undefined,
          status: doc.status as "pending" | "approved" | "rejected",
          requestedAt: new Date(doc.requestedAt as Date),
          respondedAt: doc.respondedAt
            ? new Date(doc.respondedAt as Date)
            : undefined,
        });
      }
    }

    let results: HobbySearchResult[] = [];

    for (const row of rows) {
      const host = await this.loadHost(row.hostId);
      const session = this.mapDoc(row, host);
      const parts = participantsByHobby[row._id] || [];
      session.participants = parts;

      let distance: number | undefined;
      if (filters.userLocation) {
        distance = haversineKm(
          filters.userLocation.latitude,
          filters.userLocation.longitude,
          row.latitude,
          row.longitude
        );
      }
      const rowWithGeo = row as HobbyDoc & { geoDistanceM?: number };
      if (rowWithGeo.geoDistanceM != null) {
        distance = rowWithGeo.geoDistanceM / 1000;
      }

      const r: HobbySearchResult = { ...session, distance };
      results.push(r);
    }

    if (filters.maxDistance && filters.userLocation && !useGeoNear) {
      results = results.filter(
        (s) =>
          s.distance !== undefined && s.distance <= filters.maxDistance!
      );
    }

    return results;
  }

  async findByHostId(hostId: string): Promise<Hobby[]> {
    const db = await getMongoDb();
    const rows = (await db
      .collection(COLLECTIONS.hobbies)
      .find({ hostId } as unknown as Filter<Document>)
      .sort({ date: -1, startTime: -1 })
      .toArray()) as unknown as HobbyDoc[];
    const out: Hobby[] = [];
    for (const row of rows) {
      const host = await this.loadHost(row.hostId);
      out.push(this.mapDoc(row, host));
    }
    return out;
  }

  async findUpcoming(): Promise<Hobby[]> {
    const db = await getMongoDb();
    const rows = (await db
      .collection(COLLECTIONS.hobbies)
      .find({ date: { $gte: startOfTodayUtc() } } as unknown as Filter<Document>)
      .sort({ date: 1, startTime: 1 })
      .toArray()) as unknown as HobbyDoc[];
    const out: Hobby[] = [];
    for (const row of rows) {
      const host = await this.loadHost(row.hostId);
      out.push(this.mapDoc(row, host));
    }
    return out;
  }
}

let hobbyRepository: IHobbyRepository | null = null;

export function getHobbyRepository(): IHobbyRepository {
  if (!hobbyRepository) {
    hobbyRepository = new MongoHobbyRepository();
  }
  return hobbyRepository;
}

/** @deprecated Use getHobbyRepository */
export const getGroupRepository = getHobbyRepository;

/** @deprecated Use IHobbyRepository */
export type IGroupRepository = IHobbyRepository;
