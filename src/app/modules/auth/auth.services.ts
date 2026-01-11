import { PrismaClient } from "../../../../generated/prisma/client";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const prisma = new PrismaClient({});
const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

export const authService = {
    async register(email: string, password: string, referralCode?: string) {
        // Check if user exists
        const existing = await prisma.user.findUnique({ where: { email } });
        if (existing) {
            throw new Error("Email already registered");
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Find referrer if code provided
        let referrerId = null;
        if (referralCode && referralCode !== "JAKE") {
            const referrer = await prisma.user.findUnique({
                where: { referralCode },
            });
            if (referrer) {
                referrerId = referrer.id;
            }
        }

        // Create user
        const user = await prisma.user.create({
            data: {
                email,
                password: hashedPassword,
                referralCode: Math.random().toString(36).substring(2, 8).toUpperCase(),
                referrerId,
                tier: "Member",
                storeCredit: 0,
                referralCount: 0,
            },
        });

        // Generate token
        const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: "30d" });

        return {
            token,
            user: {
                id: user.id,
                email: user.email,
                referralCode: user.referralCode,
                tier: user.tier,
                storeCredit: user.storeCredit,
            },
        };
    },

    async login(email: string, password: string) {
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) {
            throw new Error("Invalid credentials");
        }

        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) {
            throw new Error("Invalid credentials");
        }

        const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: "30d" });

        return {
            token,
            user: {
                id: user.id,
                email: user.email,
                referralCode: user.referralCode,
                tier: user.tier,
                storeCredit: user.storeCredit,
                referralCount: user.referralCount,
            },
        };
    },

    async getCurrentUser(userId: string) {
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                email: true,
                referralCode: true,
                tier: true,
                storeCredit: true,
                referralCount: true,
                createdAt: true,
            },
        });

        if (!user) {
            throw new Error("User not found");
        }

        return user;
    },
};
