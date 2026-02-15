"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
dotenv_1.default.config({ path: path_1.default.join(process.cwd(), ".env") });
exports.default = {
    node_env: process.env.NODE_ENV,
    port: process.env.PORT,
    database_url: process.env.DATABASE_URL,
    // JWT
    jwt_access_secret: process.env.JWT_ACCESS_SECRET,
    jwt_access_expire: process.env.JWT_ACCESS_EXPIRE,
    jwt_refresh_secret: process.env.JWT_REFRESH_SECRET,
    jwt_refresh_expire: process.env.JWT_REFRESH_EXPIRE,
    // B
    bcrypt_salt_rounds: process.env.BCRYPT_SALT_ROUNDS || 12,
    // Stripe
    stripe_secret_key: process.env.STRIPE_SECRET_KEY,
    stripe_publishable_key: process.env.STRIPE_PUBLISHABLE_KEY,
    stripe_webhook_secret: process.env.STRIPE_WEBHOOK_SECRET,
    // Frontend
    frontend_url: process.env.FRONTEND_URL,
    // Admin
    admin_name: process.env.ADMIN_NAME,
    admin_email: process.env.ADMIN_EMAIL,
    admin_password: process.env.ADMIN_PASSWORD,
    // Resend
    resend_api_key: process.env.RESEND_API_KEY,
    resend_email: process.env.RESEND_EMAIL,
    // shipsation
    shipstation_api_key: process.env.SHIPSTATION_API_KEY,
    shipstation_api_secret: process.env.SHIPSTATION_API_SECRET,
};
//# sourceMappingURL=index.js.map