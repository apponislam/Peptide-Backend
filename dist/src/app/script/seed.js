"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createAdmin = createAdmin;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const config_1 = __importDefault(require("../../config"));
const prisma_1 = require("../../lib/prisma");
async function createAdmin() {
    try {
        const adminEmail = config_1.default.admin_email || "master@peptide.club";
        const existingAdmin = await prisma_1.prisma.user.findUnique({
            where: { email: adminEmail },
        });
        if (existingAdmin) {
            console.log("✅ Admin already exists");
            return existingAdmin;
        }
        const hashedPassword = await bcryptjs_1.default.hash(config_1.default.admin_password || "master123", Number(config_1.default.bcrypt_salt_rounds));
        const masterUser = await prisma_1.prisma.user.create({
            data: {
                name: config_1.default.admin_name || "Jacob Vlance",
                email: adminEmail,
                password: hashedPassword,
                referralCode: "JAKE",
                role: "ADMIN",
                tier: "Founder",
                storeCredit: 0,
                referralCount: 99999999,
            },
        });
        console.log("✅ Admin created:", masterUser.email);
        return masterUser;
    }
    catch (error) {
        console.error("❌ Error creating admin:", error.message);
        throw error;
    }
}
//# sourceMappingURL=seed.js.map