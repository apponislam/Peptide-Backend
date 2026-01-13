import bcrypt from "bcryptjs";
import config from "../../config";
import { prisma } from "../../lib/prisma";

export async function createAdmin() {
    try {
        const adminEmail = config.admin_email || "master@peptide.club";

        const existingAdmin = await prisma.user.findUnique({
            where: { email: adminEmail },
        });

        if (existingAdmin) {
            console.log("✅ Admin already exists");
            return existingAdmin;
        }

        const hashedPassword = await bcrypt.hash(config.admin_password || "master123", Number(config.bcrypt_salt_rounds));

        const masterUser = await prisma.user.create({
            data: {
                name: config.admin_name || "Jacob Vlance",
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
    } catch (error: any) {
        console.error("❌ Error creating admin:", error.message);
        throw error;
    }
}
