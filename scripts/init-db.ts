import { config } from "dotenv";
import path from "path";
import { MongoClient } from "mongodb";
import { COLLECTIONS } from "../lib/mongo";

config({ path: path.join(__dirname, "..", ".env.local") });
config({ path: path.join(__dirname, "..", ".env") });

async function initMongo() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error("❌ MONGODB_URI is not set in .env or .env.local");
    process.exit(1);
  }

  const name = process.env.MONGODB_DB_NAME || "hobbyhop";
  const client = new MongoClient(uri);

  try {
    console.log("🔄 Connecting to MongoDB...");
    await client.connect();
    const db = client.db(name);
    console.log(`✅ Connected to database "${name}"`);

    await db.collection(COLLECTIONS.users).createIndex({ email: 1 }, { unique: true });
    await db
      .collection(COLLECTIONS.hobbies)
      .createIndex({ hostId: 1 });
    await db
      .collection(COLLECTIONS.hobbies)
      .createIndex({ date: 1 });
    await db
      .collection(COLLECTIONS.hobbies)
      .createIndex({ category: 1 });
    await db
      .collection(COLLECTIONS.hobbies)
      .createIndex({ location: "2dsphere" });
    await db
      .collection(COLLECTIONS.hobbies)
      .createIndex({ title: "text" });

    await db
      .collection(COLLECTIONS.participants)
      .createIndex({ hobbyId: 1 });
    await db
      .collection(COLLECTIONS.participants)
      .createIndex({ userId: 1 });
    await db
      .collection(COLLECTIONS.participants)
      .createIndex(
        { hobbyId: 1, userId: 1 },
        { unique: true }
      );

    console.log("✅ Indexes ensured");
    console.log("\n🎉 MongoDB setup complete!");
    process.exit(0);
  } catch (e) {
    console.error("❌ MongoDB init failed:", e);
    process.exit(1);
  } finally {
    await client.close();
  }
}

initMongo();
