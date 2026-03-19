/**
 * One-off migration: `groups` → `hobbies` collection; `groupId` → `hobbyId` on participants.
 * Usage: npx tsx scripts/migrate-groups-to-hobbies.ts
 */
import { config } from "dotenv";
import path from "path";
import { MongoClient } from "mongodb";

config({ path: path.join(__dirname, "..", ".env.local") });
config({ path: path.join(__dirname, "..", ".env") });

async function main() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error("MONGODB_URI is not set");
    process.exit(1);
  }
  const dbName = process.env.MONGODB_DB_NAME || "hobbyhop";
  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db(dbName);

  const hasGroups = (await db.listCollections({ name: "groups" }).toArray()).length > 0;
  const hasHobbies = (await db.listCollections({ name: "hobbies" }).toArray()).length > 0;

  if (hasGroups) {
    if (hasHobbies) {
      console.error("Both `groups` and `hobbies` exist — resolve manually.");
      process.exit(1);
    }
    await db.collection("groups").rename("hobbies");
    console.log("Renamed collection groups → hobbies");
  } else if (!hasHobbies) {
    console.log("No `groups` collection and no `hobbies` — run npm run db:init after first deploy.");
  }

  const participants = db.collection("participants");
  const cursor = participants.find({ groupId: { $exists: true } });
  let n = 0;
  for await (const doc of cursor) {
    const groupId = (doc as { groupId?: string }).groupId;
    if (!groupId) continue;
    await participants.updateOne(
      { _id: doc._id },
      { $set: { hobbyId: groupId }, $unset: { groupId: "" } }
    );
    n++;
  }
  if (n) console.log(`Migrated hobbyId on ${n} participant documents`);

  await client.close();
  console.log("Done.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
