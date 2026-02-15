"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const index_1 = __importDefault(require("./app/routes/index"));
const notFound_1 = __importDefault(require("./errors/notFound"));
const globalErrorHandaler_1 = __importDefault(require("./errors/globalErrorHandaler"));
const path_1 = __importDefault(require("path"));
const webhook_controller_1 = require("./app/modules/payment/webhook.controller");
const app = (0, express_1.default)();
app.post("/api/payment/webhook", express_1.default.raw({ type: "application/json" }), webhook_controller_1.WebhookController.handleStripeWebhook);
const corsOptions = {
    origin: ["http://localhost:3000", "http://localhost:3001", "http://localhost:3002", "http://31.220.52.82:3050", "http://127.0.0.1:5500"],
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
};
app.use((0, cors_1.default)(corsOptions));
app.use("/uploads", express_1.default.static(path_1.default.join(process.cwd(), "uploads")));
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
app.use((0, cookie_parser_1.default)());
const projectRoot = process.cwd();
app.use(express_1.default.static(path_1.default.join(projectRoot, "public")));
app.get("/", (req, res) => {
    const indexPath = path_1.default.join(projectRoot, "public", "index.html");
    console.log("Serving index.html from:", indexPath);
    res.sendFile(indexPath);
});
app.use("/api", index_1.default);
app.use(notFound_1.default);
app.use(globalErrorHandaler_1.default);
exports.default = app;
//# sourceMappingURL=app.js.map