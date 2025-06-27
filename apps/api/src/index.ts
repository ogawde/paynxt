import express from "express";
import cors from "cors";

const app = express();


app.use(
    cors({
      credentials: true,
    })
  );

  app.use(express.json());


  app.get("/health", (req, res) => {
    res.json({
      success: true,
      message: "PayNXT API is running",
      timestamp: new Date().toISOString(),
    });
  });

  app.listen(3000);
  