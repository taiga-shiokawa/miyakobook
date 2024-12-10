import jwt from 'jsonwebtoken';
import User from '../models/user.model.js';

export const protectRoute = async (req, res, next) => {
  try {
    const token = req.cookies["jwt-business-sns-token"];
    if (!token) {
      return res.status(401).json({ message: "トークンが提供されていません"});
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!decoded) {
      return res.status(401).json({ message: "トークンが無効です"});
    }

    const user = await User.findById(decoded.userId).select("-password");
    if (!user) {
      return res.status(401).json({ message: "ユーザーが見つかりませんでした。"});
    }

    req.user = user;
    
    next();
  } catch (error) {
    console.log("protectRouteミドルウェアでエラーが発生。", error.message, error.stack);
    res.status(500).json({ message: "サーバーエラーの可能性あり。"});
  }
}