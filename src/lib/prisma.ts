import { PrismaClient } from "../../generated/prisma/client";

const prisma = new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
    accelerateUrl: undefined,
    adapter: undefined,
} as any);

export default prisma;
