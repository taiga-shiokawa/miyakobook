import mongoose from "mongoose";

export const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URL);
    console.log(`DB接続に成功しました: ${conn.connection.host}`);
  } catch (error) {
    console.error(`DB接続に失敗しました: ${error.message}`);
    process.exit(1);
  }
}