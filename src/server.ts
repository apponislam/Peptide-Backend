import "dotenv/config";
import app from "./app";
import { prisma } from "./lib/prisma";

const PORT = Number(process.env.PORT) || 5050;

async function main() {
    try {
        await prisma.$connect();
        console.log("✅ Database connected successfully");

        // Start server
        app.listen(PORT, () => {
            console.log(`🚀 Server running on port ${PORT}`);
        });
    } catch (error) {
        console.error("❌ Failed to start server:", error);
        process.exit(1);
    }
}

main();

const gracefulShutdown = async () => {
    console.log("🔴 Shutting down gracefully...");
    await prisma.$disconnect();
    console.log("🔴 Database connection closed");
    process.exit(0);
};

process.on("SIGTERM", gracefulShutdown);
process.on("SIGINT", gracefulShutdown);
