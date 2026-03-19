import { MongoClient, Db, type Document, type Filter } from "mongodb";

const uri = process.env.MONGODB_URI;

let client: MongoClient | null = null;
let database: Db | null = null;

export const COLLECTIONS = {
  users: "users",
  groups: "groups",
  participants: "participants",
} as const;

/** UUID 문자열 `_id` 조회용 (드라이버 기본 타입은 ObjectId) */
export function byId(id: string): Filter<Document> {
  return { _id: id } as unknown as Filter<Document>;
}

export async function getMongoDb(): Promise<Db> {
  if (database) return database;
  if (!uri) {
    throw new Error("MONGODB_URI is not set");
  }
  client = new MongoClient(uri);
  await client.connect();
  const name = process.env.MONGODB_DB_NAME || "hobbyhop";
  database = client.db(name);
  return database;
}
