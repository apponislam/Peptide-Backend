import express, { Application, Request, Response } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import router from "./app/routes/index";
import notFound from "./errors/notFound";
import globalErrorHandler from "./errors/globalErrorHandaler";
import path from "path";

const app: Application = express();

const corsOptions = {
    origin: ["http://localhost:3000", "http://localhost:3001", "http://31.220.52.82:3050"],
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// app.get("/", (req: Request, res: Response) => {
//     res.status(200).json({
//         status: "ok",
//         timestamp: new Date().toISOString(),
//         message: "Server is running with Prisma",
//     });
// });

// app.get("/", (req: Request, res: Response) => {
//     res.sendFile(path.join(__dirname, "../public/index.html"));
// });

const projectRoot = process.cwd();
app.use(express.static(path.join(projectRoot, "public")));

// app.get("/", (req: Request, res: Response) => {
//     res.sendFile(path.join(__dirname, "../public/index.html"));
// });

app.get("/", (req: Request, res: Response) => {
    const indexPath = path.join(projectRoot, "public", "index.html");
    console.log("Serving index.html from:", indexPath);
    res.sendFile(indexPath);
});

app.use("/api", router);

app.use(notFound);
app.use(globalErrorHandler);

export default app;
