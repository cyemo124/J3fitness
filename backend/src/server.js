import app from "./app.js";
import connectDB from "./config/database.js";

const PORT = process.env.PORT || 5000;

// Connect to DB (eagerly — safe for serverless with connection caching)
if (process.env.USE_DB === "true") {
  connectDB().catch((err) => {
    console.error("[DB Connection Error]", err);
  });
}

// Local development: start the server
if (process.env.NODE_ENV !== "production") {
  app.listen(PORT, () => {
    console.log(`[Server] Running on port ${PORT}`);
    console.log(`[Environment] ${process.env.NODE_ENV || "development"}`);
  });
}

// Vercel serverless: export the app
export default app;
