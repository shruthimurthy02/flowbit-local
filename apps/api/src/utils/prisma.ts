import { PrismaClient } from "@prisma/client";

export const prisma = new PrismaClient({
  log: [
    { level: "query", emit: "event" },
    { level: "info", emit: "event" },
    { level: "warn", emit: "event" },
    { level: "error", emit: "event" }
  ]
});

prisma.$on("query", (e) => {
  console.log("📌 QUERY:", e.query);
  console.log("🔧 PARAMS:", e.params);
});

prisma.$on("error", (e) => {
  console.log("❌ PRISMA ERROR:", e);
});

export default prisma;
