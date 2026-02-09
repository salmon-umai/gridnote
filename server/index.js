// server/index.js　サーバーの入口

import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";

import authRoutes from "./routes/auth.js";
import userRoutes from "./routes/users.js";
import categoryRoutes from "./routes/category.js";
import itemRoutes from "./routes/item.js";
import calendarRoutes from "./routes/calendar.js";

const app = express();

app.use(cors({
  origin: true,
  /*[
    "http://localhost:5173",
    "http://localhost:5174"
  ],*/
  //ViteのURL
  credentials: true,
  allowedHeaders: ["Content-Type", "Authorization"],
  methods: ["GET",  "POST", "PUT", "DELETE", "OPTIONS"]
}));
app.use(express.json());

//ルート登録
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);

app.use("/api/category", categoryRoutes);
app.use("/api/item" , itemRoutes);

app.use("/api/calendar", calendarRoutes);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on poot ${PORT}`);
});