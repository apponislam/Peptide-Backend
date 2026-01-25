import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import router from "./app/routes/index";
import notFound from "./errors/notFound";
import globalErrorHandler from "./errors/globalErrorHandaler";
import path from "path";
import { WebhookController } from "./app/modules/payment/webhook.controller";
const app = express();
app.post("/api/payment/webhook", express.raw({ type: "application/json" }), WebhookController.handleStripeWebhook);
const corsOptions = {
    origin: ["http://localhost:3000", "http://localhost:3001", "http://localhost:3002", "http://31.220.52.82:3050", "http://127.0.0.1:5500"],
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
};
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
const projectRoot = process.cwd();
app.use(express.static(path.join(projectRoot, "public")));
app.get("/", (req, res) => {
    const indexPath = path.join(projectRoot, "public", "index.html");
    console.log("Serving index.html from:", indexPath);
    res.sendFile(indexPath);
});
app.use("/api", router);
app.use(notFound);
app.use(globalErrorHandler);
export default app;
//# sourceMappingURL=app.js.map