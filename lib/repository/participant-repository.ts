import { randomUUID } from "crypto";
import type { Document, Filter } from "mongodb";
import { getMongoDb, COLLECTIONS, byId } from "@/lib/mongo";
import type { BaseRepository } from "./base-repository";
import type { HobbyParticipant, User } from "@/lib/types";

export interface IParticipantRepository
  extends BaseRepository<HobbyParticipant> {
  findByHobbyId(hobbyId: string): Promise<HobbyParticipant[]>;
  /** @deprecated Use findByHobbyId */
  findByGroupId(groupId: string): Promise<HobbyParticipant[]>;
  findBySessionId(sessionId: string): Promise<HobbyParticipant[]>;
  findByUserId(userId: string): Promise<HobbyParticipant[]>;
  findPendingRequests(hobbyId: string): Promise<HobbyParticipant[]>;
  updateStatus(
    id: string,
    status: "approved" | "rejected"
  ): Promise<HobbyParticipant>;
}

type PartDoc = {
  _id: string;
  hobbyId: string;
  userId: string;
  contactEmail?: string | null;
  contactPhone?: string | null;
  status: string;
  requestedAt: Date;
  respondedAt?: Date | null;
};

export class MongoParticipantRepository implements IParticipantRepository {
  private async loadUser(userId: string): Promise<User | null> {
    const db = await getMongoDb();
    const u = await db
      .collection(COLLECTIONS.users)
      .findOne(byId(userId));
    if (!u) return null;
    return {
      id: String(u._id),
      email: u.email as string,
      name: u.name as string,
      createdAt: new Date(u.createdAt as Date),
    };
  }

  private mapRow(row: PartDoc, user?: User | null): HobbyParticipant {
    const p: HobbyParticipant = {
      id: row._id,
      hobbyId: row.hobbyId,
      userId: row.userId,
      contactEmail: row.contactEmail || undefined,
      contactPhone: row.contactPhone || undefined,
      status: row.status as "pending" | "approved" | "rejected",
      requestedAt:
        row.requestedAt instanceof Date
          ? row.requestedAt
          : new Date(row.requestedAt),
      respondedAt: row.respondedAt
        ? row.respondedAt instanceof Date
          ? row.respondedAt
          : new Date(row.respondedAt)
        : undefined,
    };
    if (user) p.user = user;
    return p;
  }

  async findById(id: string): Promise<HobbyParticipant | null> {
    const db = await getMongoDb();
    const row = (await db
      .collection(COLLECTIONS.participants)
      .findOne(byId(id))) as PartDoc | null;
    if (!row) return null;
    const user = await this.loadUser(row.userId);
    return this.mapRow(row, user);
  }

  async findAll(): Promise<HobbyParticipant[]> {
    const db = await getMongoDb();
    const rows = (await db
      .collection(COLLECTIONS.participants)
      .find({} as unknown as Filter<Document>)
      .sort({ requestedAt: -1 })
      .toArray()) as unknown as PartDoc[];
    const out: HobbyParticipant[] = [];
    for (const row of rows) {
      const user = await this.loadUser(row.userId);
      out.push(this.mapRow(row, user));
    }
    return out;
  }

  async create(
    data: Omit<HobbyParticipant, "id" | "requestedAt"> & {
      requestedAt?: Date;
    }
  ): Promise<HobbyParticipant> {
    const db = await getMongoDb();
    const id = randomUUID();
    const requestedAt = data.requestedAt ?? new Date();
    await db.collection(COLLECTIONS.participants).insertOne({
      _id: id,
      hobbyId: data.hobbyId,
      userId: data.userId,
      contactEmail: data.contactEmail ?? null,
      contactPhone: data.contactPhone ?? null,
      status: data.status || "pending",
      requestedAt,
      respondedAt: null,
    } as Document);
    const created = await this.findById(id);
    if (!created) throw new Error("Failed to create participant");
    return created;
  }

  async update(id: string, data: Partial<HobbyParticipant>): Promise<HobbyParticipant> {
    const db = await getMongoDb();
    const $set: Record<string, unknown> = {};
    if (data.status !== undefined) $set.status = data.status;
    if (data.respondedAt !== undefined) $set.respondedAt = data.respondedAt;
    if (data.contactEmail !== undefined) $set.contactEmail = data.contactEmail;
    if (data.contactPhone !== undefined) $set.contactPhone = data.contactPhone;

    if (Object.keys($set).length === 0) throw new Error("No fields to update");

    await db
      .collection(COLLECTIONS.participants)
      .updateOne(byId(id), { $set });
    const updated = await this.findById(id);
    if (!updated) throw new Error("Participant not found");
    return updated;
  }

  async delete(id: string): Promise<void> {
    const db = await getMongoDb();
    await db
      .collection(COLLECTIONS.participants)
      .deleteOne(byId(id));
  }

  async findByHobbyId(hobbyId: string): Promise<HobbyParticipant[]> {
    const db = await getMongoDb();
    const rows = (await db
      .collection(COLLECTIONS.participants)
      .find({ hobbyId } as unknown as Filter<Document>)
      .sort({ requestedAt: -1 })
      .toArray()) as unknown as PartDoc[];
    const out: HobbyParticipant[] = [];
    for (const row of rows) {
      const user = await this.loadUser(row.userId);
      out.push(this.mapRow(row, user));
    }
    return out;
  }

  async findByGroupId(groupId: string): Promise<HobbyParticipant[]> {
    return this.findByHobbyId(groupId);
  }

  async findBySessionId(sessionId: string): Promise<HobbyParticipant[]> {
    return this.findByHobbyId(sessionId);
  }

  async findByUserId(userId: string): Promise<HobbyParticipant[]> {
    const db = await getMongoDb();
    const rows = (await db
      .collection(COLLECTIONS.participants)
      .find({ userId } as unknown as Filter<Document>)
      .sort({ requestedAt: -1 })
      .toArray()) as unknown as PartDoc[];
    const out: HobbyParticipant[] = [];
    for (const row of rows) {
      const user = await this.loadUser(row.userId);
      out.push(this.mapRow(row, user));
    }
    return out;
  }

  async findPendingRequests(hobbyId: string): Promise<HobbyParticipant[]> {
    const db = await getMongoDb();
    const rows = (await db
      .collection(COLLECTIONS.participants)
      .find({ hobbyId, status: "pending" } as unknown as Filter<Document>)
      .sort({ requestedAt: 1 })
      .toArray()) as unknown as PartDoc[];
    const out: HobbyParticipant[] = [];
    for (const row of rows) {
      const user = await this.loadUser(row.userId);
      out.push(this.mapRow(row, user));
    }
    return out;
  }

  async updateStatus(
    id: string,
    status: "approved" | "rejected"
  ): Promise<HobbyParticipant> {
    const db = await getMongoDb();
    await db.collection(COLLECTIONS.participants).updateOne(
      byId(id),
      { $set: { status, respondedAt: new Date() } }
    );
    const updated = await this.findById(id);
    if (!updated) throw new Error("Participant not found");
    return updated;
  }
}

let participantRepository: IParticipantRepository | null = null;

export function getParticipantRepository(): IParticipantRepository {
  if (!participantRepository) {
    participantRepository = new MongoParticipantRepository();
  }
  return participantRepository;
}
