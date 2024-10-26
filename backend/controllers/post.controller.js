import { sendCommentNotificationEmail } from "../emails/emailHandlers.js";
import cloudinary from "../lib/cloudinary.js";
import Notification from "../models/notification.model.js";
import Post from "../models/post.model.js";
import dotenv from "dotenv";
import User from "../models/user.model.js";

dotenv.config();

Post.schema.index({ createdAt: -1 });
Post.schema.index({ author: 1 });
Post.schema.index({ "comments.user": 1 });
Post.schema.index({ likes: 1 });

export const getFeedPosts = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = 10; // 1ページあたりの投稿数
    const skip = (page - 1) * limit;

    // 投稿の総数を取得
    const total = await Post.countDocuments();

    // 投稿を取得
    const posts = await Post.find()
      .populate("author", "name username profilePicture headline")
      .populate("comments.user", "name profilePicture")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    res.status(200).json({
      posts,
      pagination: {
        current: page,
        pages: Math.ceil(total / limit),
        total,
      },
    });
  } catch (error) {
    console.error("投稿の取得に失敗しました: ", error);
    res.status(500).json({ message: "サーバーエラーの可能性あり。" });
  }
};

// 自分の投稿を取得
export const getMyPosts = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = 10;
    const skip = (page - 1) * limit;

    // ログインユーザーの投稿のみを取得
    const total = await Post.countDocuments({ author: req.user._id });

    const posts = await Post.find({ author: req.user._id })
      .populate("author", "name username profilePicture headline")
      .populate("comments.user", "name profilePicture")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    res.status(200).json({
      success: true,
      posts,
      pagination: {
        current: page,
        pages: Math.ceil(total / limit),
        total,
      },
    });
  } catch (error) {
    console.error("投稿の取得に失敗しました: ", error);
    res.status(500).json({
      success: false,
      message: "サーバーエラーの可能性あり。",
      posts: [],
      pagination: {
        current: 1,
        pages: 0,
        total: 0,
      },
    });
  }
};

// 特定のユーザーの投稿を取得（新規追加）
export const getUserPosts = async (req, res) => {
  try {
    const { userId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = 10;
    const skip = (page - 1) * limit;

    // 指定されたユーザーの投稿のみを取得
    const total = await Post.countDocuments({ author: userId });

    const posts = await Post.find({ author: userId })
      .populate("author", "name username profilePicture headline")
      .populate("comments.user", "name profilePicture")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    res.status(200).json({
      success: true,
      posts,
      pagination: {
        current: page,
        pages: Math.ceil(total / limit),
        total,
      },
    });
  } catch (error) {
    console.error("投稿の取得に失敗しました: ", error);
    res.status(500).json({
      success: false,
      message: "サーバーエラーの可能性あり。",
      posts: [],
      pagination: {
        current: 1,
        pages: 0,
        total: 0,
      },
    });
  }
};

export const createPost = async (req, res) => {
  try {
    const { content, image } = req.body;

    if (!content) {
      return res.status(400).json({ message: "投稿内容を入力してください。" });
    }

    // デバッグ: 受け取ったcontent全体を確認
    console.log('Received content:', content);

    // 正規表現を修正して日本語を含む文字に対応
    const mentionMatches = content.match(/@([^\s]+)/g) || [];
    console.log('Raw mention matches:', mentionMatches);

    // @を除去してユーザー名のみを抽出
    const usernames = mentionMatches.map(match => match.substring(1));
    console.log('Extracted usernames:', usernames);

    // ユーザー検索のクエリを実行
    const mentionedUsers = await User.find({ 
      username: { 
        $in: usernames 
      } 
    });

    console.log('Database query result:', {
      searchedUsernames: usernames,
      foundUsers: mentionedUsers.map(u => ({ 
        id: u._id, 
        username: u.username,
        name: u.name 
      }))
    });

    const mentionUserIds = mentionedUsers.map(user => user._id);

    // 画像の存在確認
    let imageUrl = null;
    if (image) {
      const imgResult = await cloudinary.uploader.upload(image, {
        timeout: 60000, // タイムアウトを60秒に設定
      });
      imageUrl = imgResult.secure_url;
    }

    const newPost = new Post({
      author: req.user._id,
      content,
      image: imageUrl,
      mentions: mentionUserIds,
    });

    await newPost.save();

    // メンション通知を作成
    // メンション通知を作成
    const notificationPromises = mentionedUsers
      .filter(
        (user) =>
          user &&
          user._id &&
          req.user._id &&
          user._id.toString() !== req.user._id.toString()
      )
      .map((user) => {
        console.log(`Creating mention notification for user: ${user.username}`); // デバッグログ
        return new Notification({
          recipient: user._id,
          type: "mention",
          relatedUser: req.user._id,
          relatedPost: newPost._id,
        })
          .save()
          .catch((error) => {
            console.error(
              `Failed to create notification for user ${user.username}:`,
              error
            );
            return null;
          });
      });

    try {
      if (notificationPromises.length > 0) {
        const createdNotifications = await Promise.all(notificationPromises);
        console.log(
          `Successfully created ${
            createdNotifications.filter(Boolean).length
          } notifications`
        );
      }
    } catch (error) {
      console.error("メンション通知の作成に失敗:", error);
    }

    // 必要なフィールドのみを返す
    const populatedPost = await Post.findById(newPost._id)
      .select("author content image createdAt")
      .populate("author", "name username profilePicture headline")
      .populate("mentions", "name username profilePicture")
      .populate({
        path: "mentions",
        select: "name username profilePicture",
      })
      .lean();

    res.status(201).json(populatedPost);
  } catch (error) {
    console.error("投稿の作成に失敗しました: ", error);
    res.status(500).json({ message: "サーバーエラーの可能性あり。" });
  }
};

export const deletePost = async (req, res) => {
  try {
    const postId = req.params.id;
    const userId = req.user._id;

    const post = await Post.findById(postId);

    // 削除する投稿の存在確認
    if (!post) {
      return res.status(404).json({ message: "投稿が見つかりません。" });
    }

    // 自分の投稿 or 管理者であるか確認 todo: 管理者であるケースは未実装
    if (post.author.toString() !== userId.toString()) {
      return res
        .status(403)
        .json({ message: "あなたにはこの投稿の削除権限がありません。" });
    }

    // 投稿画像をcloudinaryから削除
    if (post.image) {
      await cloudinary.uploader.destroy(
        post.image.split("/").pop().split(".")[0]
      );
    }

    await Post.findByIdAndDelete(postId);

    res.status(200).json({ message: "投稿を削除しました" });
  } catch (error) {
    console.error("投稿の削除に失敗しました: ", error);
    res.status(500).json({ message: "サーバーエラーの可能性あり。" });
  }
};

export const getPostById = async (req, res) => {
  try {
    const postId = req.params.id;
    const post = await Post.findById(postId)
      .populate("author", "name username profilePicture headline")
      .populate("comments.user", "name username profilePicture headline");

    res.status(200).json(post);
  } catch (error) {
    console.error("投稿の取得に失敗しました: ", error);
    res.status(500).json({ message: "サーバーエラーの可能性あり。" });
  }
};

export const createComment = async (req, res) => {
  try {
    const postId = req.params.id;
    const { content } = req.body;

    // 投稿の更新
    // 投稿の更新（アトミック操作を使用）
    const post = await Post.findByIdAndUpdate(
      postId,
      {
        $push: {
          comments: {
            $each: [{ user: req.user._id, content }],
            $position: 0, // 最新のコメントを先頭に
          },
        },
      },
      {
        new: true,
        select: "author comments", // 必要なフィールドのみ取得
        populate: {
          path: "author",
          select: "name email username profilePicture headline",
        },
      }
    ).lean();

    // 通知
    if (post.author._id.toString() !== req.user._id.toString()) {
      Promise.all([
        new Notification({
          recipient: post.author,
          type: "comment",
          relatedUser: req.user._id,
          relatedPost: postId,
        }).save(),
        sendCommentNotificationEmail(
          post.author.email,
          post.author.name,
          req.user.name,
          `${process.env.CLIENT_URL}/post/${postId}`,
          content
        ).catch((error) => console.error("メール送信エラー:", error)),
      ]).catch((error) => console.error("通知処理エラー:", error));
    }

    res.status(200).json(post);
  } catch (error) {
    console.error("Error in createComment controller:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const likePost = async (req, res) => {
  try {
    const postId = req.params.id;
    const userId = req.user._id;

    // いいねの更新
    const post = await Post.findOneAndUpdate(
      { _id: postId },
      [
        {
          $set: {
            likes: {
              $cond: {
                if: { $in: [userId, "$likes"] },
                then: {
                  $filter: {
                    input: "$likes",
                    cond: { $ne: ["$$this", userId] },
                  },
                },
                else: { $concatArrays: ["$likes", [userId]] },
              },
            },
          },
        },
      ],
      { new: true, lean: true }
    );

    // 通知は非同期で処理
    if (post.author.toString() !== userId.toString()) {
      new Notification({
        recipient: post.author,
        type: "like",
        relatedUser: userId,
        relatedPost: postId,
      })
        .save()
        .catch((error) => console.error("通知エラー:", error));
    }

    res.status(200).json(post);
  } catch (error) {
    console.error("いいねに失敗しました: ", error);
    res.status(500).json({ message: "サーバーエラーの可能性あり。" });
  }
};
