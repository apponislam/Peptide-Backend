import bcrypt from "bcryptjs";
import { prisma } from "../../lib/prisma";

async function main() {
    // await prisma.commission.deleteMany();
    // await prisma.order.deleteMany();
    // await prisma.checkoutSession.deleteMany();
    // await prisma.user.deleteMany();
    // await prisma.product.deleteMany();

    const hashedPassword = await bcrypt.hash("master123", 10);

    const masterUser = await prisma.user.create({
        data: {
            email: "master@peptide.club",
            password: hashedPassword,
            referralCode: "JAKE",
            tier: "Founder",
            storeCredit: 0,
            referralCount: 0,
        },
    });

    console.log("✅ Master user created:", masterUser.id);
}

main()
    .catch((e) => {
        console.error("❌ Seeding failed:", e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
