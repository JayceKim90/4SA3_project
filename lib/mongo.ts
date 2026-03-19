import { MongoClient, Db } from "mongodb";

const uri = process.env.MONGODB_URI;

let client: MongoClient | null = null;
let database: Db | null = null;

export const COLLECTIONS = {
  users: "users",
  groups: "groups",
  participants: "participants",
} as const;

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
