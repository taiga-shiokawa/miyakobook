// サードパーティモジュール
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import express, { json } from 'express';
import cors from 'cors';
import path from 'path';

// ローカルモジュール
import authRoutes from './routes/auth.routes.js';
import userRoutes from './routes/user.routes.js';
import postRoutes from './routes/post.routes.js';
import notificationRoutes from './routes/notification.routes.js';
import connectionRoutes from './routes/connection.routes.js';
import searchRoutes from './routes/search.routes.js';
import jobRoutes from './routes/job.routes.js';
import { connectDB } from './lib/db.js';

// 環境変数使用
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5500;
const __dirname = path.resolve();

if (process.env.NODE_ENV !== "production") {
    app.use(
      cors({
      origin: "http://localhost:5173",
      credentials: true,
      })
    );
}

app.use(express.json({ limit: "5mb" })); // JSON形式のリクエストを受け取れるようにする
app.use(cookieParser()); // cookieを受け取れるようにする

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/users", userRoutes);
app.use("/api/v1/posts", postRoutes);
app.use("/api/v1/notifications", notificationRoutes);
app.use("/api/v1/connections", connectionRoutes);
app.use("/api/v1/search", searchRoutes);
app.use("/api/v1/jobs", jobRoutes);

if (process.env.NODE_ENV === "production") {
	app.use(express.static(path.join(__dirname, "/frontend/dist"), {
    etag: false,
    maxAge: 0,
    lastModified: false
  }));

	app.get("*", (req, res) => {
    res.set('Cache-Control', 'no-store');
		res.sendFile(path.resolve(__dirname, "frontend", "dist", "index.html"));
	});
}

app.listen(PORT, () => {
  console.log(`サーバーが起動しました: ポート番号: ${PORT}`);
  connectDB();
});