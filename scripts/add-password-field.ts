import { config } from "dotenv";
import { Pool } from "pg";
import * as path from "path";


config({ path: path.join(__dirname, "..", ".env.local") });

async function addPasswordField() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL || process.env.POSTGRES_URL,
  });

  try {
    console.log("🔄 Adding password_hash column to users table...");

    await pool.query(
      "ALTER TABLE users ADD COLUMN IF NOT EXISTS password_hash VARCHAR(255);"
    );

    console.log("✅ Password field added successfully!");

    await pool.end();
    process.exit(0);
  } catch (error) {
    console.error("❌ Failed to add password field:", error);
    await pool.end();
    process.exit(1);
  }
}

addPasswordField();
