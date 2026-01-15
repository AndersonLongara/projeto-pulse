/**
 * Prisma Client Instance
 *
 * Singleton pattern for Prisma client with libsql adapter.
 * Configured for Next.js hot reload compatibility.
 *
 * @see prisma.config.ts for database configuration
 */

import { PrismaClient } from "@prisma/client";
import { PrismaLibSql } from "@prisma/adapter-libsql";
import { createClient } from "@libsql/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createPrismaClient() {
  const client = createClient({ url: "file:./prisma/dev.db" });
  const adapter = new PrismaLibSql(client);

  return new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

export default prisma;
