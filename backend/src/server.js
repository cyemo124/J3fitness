import app from "./app.js";
import connectDB from "./config/database.js";

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    if (process.env.USE_DB === "true") {
      await connectDB();
    }

    app.listen(PORT, () => {
      console.log(`[Server] Running on port ${PORT}`);
      console.log(`[Environment] ${process.env.NODE_ENV || "development"}`);
    });
  } catch (error) {
    console.error("[Startup Error]", error);
    process.exit(1);
  }
};

startServer();
