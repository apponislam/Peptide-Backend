"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const app_1 = __importDefault(require("./app"));
const prisma_1 = require("./lib/prisma");
const seed_1 = require("./app/script/seed");
// import sendEmail from "./utils/sendEmail";
const PORT = Number(process.env.PORT) || 5050;
async function main() {
    try {
        await prisma_1.prisma.$connect();
        console.log("✅ Database connected successfully");
        await (0, seed_1.createAdmin)();
        // await seedProducts();
        // await sendEmail();
        // Start server
        app_1.default.listen(PORT, () => {
            console.log(`🚀 Server running on port ${PORT}`);
        });
    }
    catch (error) {
        console.error("❌ Failed to start server:", error);
        process.exit(1);
    }
}
main();
const gracefulShutdown = async () => {
    console.log("🔴 Shutting down gracefully...");
    await prisma_1.prisma.$disconnect();
    console.log("🔴 Database connection closed");
    process.exit(0);
};
process.on("SIGTERM", gracefulShutdown);
process.on("SIGINT", gracefulShutdown);
process.on("unhandledRejection", (reason, promise) => {
    console.error("❌ Unhandled Rejection at:", promise, "reason:", reason);
});
process.on("uncaughtException", (error) => {
    console.error("❌ Uncaught Exception:", error);
    gracefulShutdown();
});
//# sourceMappingURL=server.js.map