// lib/mongodb.ts
import mongoose from "mongoose";

declare global {
  // eslint-disable-next-line no-var
  var mongooseConn:
    | { conn: typeof mongoose | null; promise: Promise<typeof mongoose> | null }
    | undefined;
}

export async function connectMongo() {
  if (global.mongooseConn?.conn) return global.mongooseConn.conn;

  if (!process.env.MONGODB_URI) {
    throw new Error("Missing MONGODB_URI");
  }

  if (!global.mongooseConn) {
    global.mongooseConn = { conn: null, promise: null };
  }

  if (!global.mongooseConn.promise) {
    global.mongooseConn.promise = mongoose.connect(process.env.MONGODB_URI, {
      dbName: "clinic",
      // gợi ý thêm:
      // bufferCommands: false,
      // maxPoolSize: 10,
      // serverSelectionTimeoutMS: 5000,
    });
  }

  global.mongooseConn.conn = await global.mongooseConn.promise;
  return global.mongooseConn.conn;
}
