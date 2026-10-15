import "dotenv/config";
import { PrismaPg} from "@prisma/adapter-pg";
import {PrismaClient} from "../../generated/prisma/client.ts"

const adapter = new PrismaPg({
    connectionString: process.env.DATABASE_URL,
    max:10,
    connectTimeoutMillis:5000,
    idleTimeoutMillis:10000,
})
export const prisma = new PrismaClient({
    adapter
})
