import path from "path";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import { env } from "./config/env";
import authRoutes from "./routes/auth.routes";
import recipeRoutes from "./routes/recipes.routes";
import folderRoutes from "./routes/folders.routes";
import tagRoutes from "./routes/tags.routes";
import { errorHandler } from "./middleware/error.middleware";

const app = express();

// Middleware
app.use(helmet());
app.use(cors({ origin: env.CLIENT_URL, credentials: true }));
app.use(morgan("dev"));
app.use(express.json({ limit: "20mb" }));
app.use(cookieParser());

// Health check
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok" });
});

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/recipes", recipeRoutes);
app.use("/api/folders", folderRoutes);
app.use("/api/tags", tagRoutes);
// app.use('/api/schedule', scheduleRoutes);

// Centralized error handling (must be last)
app.use(errorHandler);

// Serve React client in production
if (env.NODE_ENV === "production") {
  const clientDist = path.join(__dirname, "../../client/dist");
  app.use(express.static(clientDist));
  app.get("/{*splat}", (_req, res) => {
    res.sendFile(path.join(clientDist, "index.html"));
  });
}

export default app;
