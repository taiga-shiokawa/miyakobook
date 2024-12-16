import jwt from 'jsonwebtoken';
import User from '../models/user.model.js';

export const protectRoute = async (req, res, next) => {
  try {
    const token = req.cookies["jwt-business-sns-token"];
    if (!token) {
      return res.status(401).json({ message: "認証が必要です。再度ログインしてください。"});
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.userId).select("-password");
      if (!user) {
        return res.status(401).json({ message: "ユーザーが見つかりませんでした。再度ログインしてください。"});
      }
      req.user = user;
      next();
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        return res.status(401).json({ 
          message: "セッションの有効期限が切れました。再度ログインしてください。",
          expired: true
        });
      }
      throw error;  // その他のエラーは catch ブロックで処理
    }
  } catch (error) {
    console.log("protectRouteミドルウェアでエラーが発生。", error.message, error.stack);
    res.status(500).json({ message: "サーバーエラーが発生しました。"});
  }
}