import bcrypt from "bcryptjs";
import { randomUUID } from "crypto";
import type { Document, Filter } from "mongodb";
import { getMongoDb, COLLECTIONS, byId } from "@/lib/mongo";
import type { User } from "@/lib/types";

export async function signIn(email: string, password: string): Promise<User> {
  if (!email.includes("@")) {
    throw new Error("Invalid email address");
  }

  const db = await getMongoDb();
  const user = await db
    .collection(COLLECTIONS.users)
    .findOne({ email } as unknown as Filter<Document>);

  if (!user) {
    throw new Error("Account not found. Please sign up first.");
  }

  const isValidPassword = await bcrypt.compare(
    password,
    user.passwordHash as string
  );
  if (!isValidPassword) {
    throw new Error("Incorrect password. Please try again.");
  }

  return {
    id: String(user._id),
    email: user.email as string,
    name: user.name as string,
    createdAt: new Date(user.createdAt as Date),
  };
}

export async function signUp(
  email: string,
  name: string,
  password: string
): Promise<User> {
  if (!email.includes("@")) {
    throw new Error("Invalid email address");
  }

  const db = await getMongoDb();
  const existing = await db
    .collection(COLLECTIONS.users)
    .findOne({ email } as unknown as Filter<Document>);

  if (existing) {
    throw new Error("Account already exists. Please sign in instead.");
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const id = randomUUID();
  const now = new Date();

  await db.collection(COLLECTIONS.users).insertOne({
    _id: id,
    email,
    name,
    passwordHash,
    createdAt: now,
  } as Document);

  return { id, email, name, createdAt: now };
}

export async function getCurrentUser(userId: string): Promise<User | null> {
  const db = await getMongoDb();
  const user = await db
    .collection(COLLECTIONS.users)
    .findOne(byId(userId));

  if (!user) {
    return null;
  }

  return {
    id: String(user._id),
    email: user.email as string,
    name: user.name as string,
    createdAt: new Date(user.createdAt as Date),
  };
}

export async function signOut(): Promise<void> {
  // cookie cleared by route
}
