import express, { Request, Response, NextFunction } from "express";
import { createProxyMiddleware } from "http-proxy-middleware";
import morgan from "morgan";
import cors from "cors";

const app = express();

app.use(morgan("combined"));
app.use(cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"]
}));

app.get("/api/router/health", (_req: Request, res: Response) => {
    res.status(200).json({ status: "Router server is healthy", service: "router" });
});

app.get("/api/router/ready", (_req: Request, res: Response) => {
    res.status(200).json({ status: "Router server is ready", service: "router" });
});

const proxies: Record<string, ReturnType<typeof createProxyMiddleware>> = {};

function getOrCreateProxy(sandboxId: string) {
    if (!proxies[sandboxId]) {
        proxies[sandboxId] = createProxyMiddleware({
            target: `http://delpoyforge-service-${sandboxId}`,
            changeOrigin: true,
            ws: true
        });
    }
    return proxies[sandboxId];
}

app.use((req: Request, res: Response, next: NextFunction) => {
    const host = req.headers.host || "";
    const sandboxId = host.split(".")[0]?.trim();
    const type = host.split(".")[1]?.trim();
    if (!sandboxId) {
        return res.status(404).json({ error: "Sandbox not found or invalid host" });
    }
    if (type === "preview") {
        return getOrCreateProxy(sandboxId)(req, res, next);
    }
    return res.status(404).json({ error: "Invalid preview host" });
});

export default app;