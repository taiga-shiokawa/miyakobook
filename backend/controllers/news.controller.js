import News from '../models/news.model.js';
import User from '../models/user.model.js';
import cloudinary from '../lib/cloudinary.js';
import ViewLog from '../models/view.log.model.js';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import { generateSitemap } from '../utils/sitemapGenerator.js';

dotenv.config();

// すべてのニュースを取得
export const getNews = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = 10;
    const skip = (page - 1) * limit;

    // クエリパラメータの取得
    const { tag, featured, sort = 'latest' } = req.query;

    // 基本的なクエリ条件
    const query = { status: 'published' };

    // タグによるフィルタリング
    if (tag) {
      query.tags = tag;
    }

    // 注目ニュースのフィルタリング
    if (featured === 'true') {
      query.featured = true;
    }

    // ソート条件の設定
    let sortCondition = {};
    switch (sort) {
      case 'popular':
        sortCondition = { views: -1 };
        break;
      case 'oldest':
        sortCondition = { publishedAt: 1 };
        break;
      default: // 'latest'
        sortCondition = { publishedAt: -1 };
    }

    // ニュース総数の取得
    const total = await News.countDocuments(query);

    // ニュースの取得
    const news = await News.find(query)
      .populate('author', 'name username profilePicture')
      .select('title content image tags featured views publishedAt author')
      .sort(sortCondition)
      .skip(skip)
      .limit(limit)
      .lean();

    res.status(200).json({
      news,
      pagination: {
        current: page,
        pages: Math.ceil(total / limit),
        total
      }
    });

  } catch (error) {
    console.error('ニュース取得エラー:', error);
    res.status(500).json({ message: 'サーバーエラーが発生しました' });
  }
};

// 特定のニュースを取得
export const getNewsById = async (req, res) => {
  try {
    const { newsId } = req.params;

    const news = await News.findById(newsId)
      .populate('author', 'name username profilePicture')
      .populate('comments.user', 'name username profilePicture')
      .select('title content image tags featured views publishedAt author comments')
      .lean();

    if (!news) {
      return res.status(404).json({ message: 'ニュースが見つかりません' });
    }

    res.status(200).json(news);

  } catch (error) {
    console.error('ニュース取得エラー:', error);
    res.status(500).json({ message: 'サーバーエラーが発生しました' });
  }
};

// ニュースを投稿
export const postNews = async (req, res) => {
  try {
    const { title, content, tags, image } = req.body;

    // 管理者権限チェック
    const user = await User.findById(req.user._id);
    if (user.userType !== 'admin') {
      return res.status(403).json({ message: '管理者権限が必要です' });
    }

    // 必須フィールドの確認
    if (!title || !content) {
      return res.status(400).json({ message: 'タイトルと内容は必須です' });
    }

    let imageUrl = '';
    if (image) {
      try {
        const uploadResponse = await cloudinary.uploader.upload(image);
        imageUrl = uploadResponse.secure_url;
      } catch (error) {
        console.error('画像アップロードエラー:', error);
      }
    }

    const newNews = new News({
      title,
      content,
      image: imageUrl,
      tags,
      author: req.user._id,
      status: 'published',
      publishedAt: new Date()
    });

    await newNews.save();
    await generateSitemap();

    const savedNews = await News.findById(newNews._id)
      .populate('author', 'name username profilePicture')
      .lean();

    res.status(201).json(savedNews);

  } catch (error) {
    console.error('ニュース投稿エラー:', error);
    res.status(500).json({ message: 'サーバーエラーが発生しました' });
  }
};
export const incrementViews = async (req, res) => {
  const session = await mongoose.startSession();
  
  try {
    const { newsId } = req.params;
    const ip = req.ip;
    let userId;

    // トークンからユーザーID取得
    const token = req.cookies['jwt-business-sns-token'];
    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      userId = decoded.userId;
    }

    const identifiers = [
      ip && `ip_${ip}`,
      userId && `user_${userId}`
    ].filter(Boolean);

    const now = new Date();
    const twentyFourHoursAgo = new Date(now - 24 * 60 * 60 * 1000);

    // IPとユーザーIDの両方をチェック
    let shouldIncrement = true;
    if (userId) {
      // ログインユーザーの場合、userIdベースでチェック
      const userView = await ViewLog.findOne({
        newsId,
        userId: `user_${userId}`,
        timestamp: { $gte: twentyFourHoursAgo }
      });
      if (userView) shouldIncrement = false;
    } else {
      // 未ログインユーザーの場合、IPベースでチェック
      const ipView = await ViewLog.findOne({
        newsId,
        userId: `ip_${ip}`,
        timestamp: { $gte: twentyFourHoursAgo }
      });
      if (ipView) shouldIncrement = false;
    }

    if (!shouldIncrement) {
      await session.endSession();
      return res.status(200).json({
        message: '既に閲覧済みです',
        alreadyViewed: true
      });
    }

    await session.withTransaction(async () => {
      await ViewLog.create(
        identifiers.map(identifier => ({
          newsId,
          userId: identifier,
          timestamp: now
        })),
        { session }
      );

      await News.findByIdAndUpdate(
        newsId,
        { $inc: { views: 1 } },
        { session }
      );
    });

    await session.endSession();
    return res.status(200).json({
      message: '閲覧数を更新しました',
      updated: true
    });

  } catch (error) {
    console.error('Debug - Error:', error);
    await session.endSession();
    return res.status(500).json({ message: 'サーバーエラーが発生しました' });
  }
};

export const deletePost = async (req, res) => {
  try {
    const { newsId } = req.params;

    // 管理者権限チェック
    const user = await User.findById(req.user._id);
    if (user.userType !== 'admin') {
      return res.status(403).json({ message: '管理者権限が必要です' });
    }

    // ニュースを削除
    await News.findByIdAndDelete(newsId);
    res.status(200).json({ message: 'ニュースを削除しました' });
  } catch (error) {
    console.error('投稿削除エラー:', error);
    res.status(500).json({ message: 'サーバーエラーが発生しました' });
  }
}

export const updateNews = async (req, res) => {
  try {
    const { newsId } = req.params;

    // 管理者権限チェック
    const user = await User.findById(req.user._id);
    if (user.userType !== 'admin') {
      return res.status(403).json({ message: '管理者権限が必要です' });
    }

    // ニュースを更新
    await News.findByIdAndUpdate(newsId, req.body);
    res.status(200).json({ message: 'ニュースを更新しました' });
  } catch (error) {
    console.error('ニュース更新エラー:', error);
    res.status(500).json({ message: 'サーバーエラーが発生しました' });
  }
}