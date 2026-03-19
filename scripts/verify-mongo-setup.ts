/**
 * 연결 + 기대 컬렉션·핵심 인덱스 존재 확인 (자격 증명 출력 없음)
 * Usage: npx tsx scripts/verify-mongo-setup.ts
 */
import { config } from "dotenv";
import path from "path";
import { MongoClient } from "mongodb";
import { COLLECTIONS } from "../lib/mongo";

config({ path: path.join(__dirname, "..", ".env.local") });
config({ path: path.join(__dirname, "..", ".env") });

async function main() {
  const uri = process.env.MONGODB_URI;
  if (!uri?.startsWith("mongodb")) {
    console.error("❌ MONGODB_URI missing or invalid format");
    process.exit(1);
  }

  const name = process.env.MONGODB_DB_NAME || "hobbyhop";
  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db(name);

  const cols = await db.listCollections().toArray();
  const colNames = new Set(cols.map((c) => c.name));
  for (const c of [COLLECTIONS.users, COLLECTIONS.hobbies, COLLECTIONS.participants]) {
    if (!colNames.has(c)) {
      console.error(`❌ Missing collection: ${c}`);
      process.exit(1);
    }
  }

  const usersIdx = await db.collection(COLLECTIONS.users).indexes();
  if (!usersIdx.some((i) => i.unique && i.key && (i.key as { email?: number }).email === 1)) {
    console.error("❌ users: expected unique index on email");
    process.exit(1);
  }

  const hobbiesIdx = await db.collection(COLLECTIONS.hobbies).indexes();
  const has2d = hobbiesIdx.some((i) =>
    JSON.stringify(i).includes("2dsphere")
  );
  if (!has2d) {
    console.error("❌ hobbies: expected 2dsphere index on location");
    process.exit(1);
  }

  const partsIdx = await db.collection(COLLECTIONS.participants).indexes();
  const hasCompound = partsIdx.some(
    (i) =>
      i.unique &&
      i.key &&
      typeof i.key === "object" &&
      "hobbyId" in (i.key as object) &&
      "userId" in (i.key as object)
  );
  if (!hasCompound) {
    console.error("❌ participants: expected unique compound hobbyId + userId");
    process.exit(1);
  }

  await client.close();
  console.log("✅ MongoDB verify: collections + critical indexes OK");
}

main().catch((e) => {
  console.error("❌ Verify failed:", e instanceof Error ? e.message : e);
  process.exit(1);
});
