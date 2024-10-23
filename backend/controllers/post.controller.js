import { sendCommentNotificationEmail } from "../emails/emailHandlers.js";
import cloudinary from "../lib/cloudinary.js";
import Notification from "../models/notification.model.js";
import Post from "../models/post.model.js";
import dotenv from "dotenv";

dotenv.config();

export const getFeedPosts = async (req, res) => {
  try {
    // 投稿を取得
    const posts = await Post.find()
      .populate("author", "name username profilePicture headline")
      .populate("comments.user", "name profilePicture")
      .sort({ createdAt: -1 });

    res.status(200).json(posts);
  } catch (error) {
    console.error("投稿の取得に失敗しました: ", error);
    res.status(500).json({ message: "サーバーエラーの可能性あり。" });
  }
};

export const getMyPosts = async (req, res) => {
  try {
    // 投稿を取得
    const posts = await Post.find({ author: req.user._id })
      .populate("author", "name username profilePicture headline")
      .populate("comments.user", "name profilePicture")
      .sort({ createdAt: -1 });

    res.status(200).json(posts);
  } catch (error) {
    console.error("投稿の取得に失敗しました: ", error);
    res.status(500).json({ message: "サーバーエラーの可能性あり。" });
  }
}

export const createPost = async (req, res) => {
  try {
    const { content, image } = req.body;

    if (!content) {
      return res.status(400).json({ message: "投稿内容を入力してください。" });
    }

    let newPost;

    // 画像の存在確認
    if (image) {
      const imgResult = await cloudinary.uploader.upload(image);
      newPost = new Post({
        author: req.user._id,
        content,
        image: imgResult.secure_url
      });
    } else {
      newPost = new Post({
        author: req.user._id,
        content
      });
    }

    await newPost.save();
    res.status(201).json(newPost);
  } catch (error) {
    console.error("投稿の作成に失敗しました: ", error);
    res.status(500).json({ message: "サーバーエラーの可能性あり。" });
  }
};

export const deletePost  = async (req, res) => {
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
      return res.status(403).json({ message: "あなたにはこの投稿の削除権限がありません。" });
    }

    // 投稿画像をcloudinaryから削除
    if (post.image) {
      await cloudinary.uploader.destroy(post.image.split("/").pop().split(".")[0]);
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
    const post = await Post.findByIdAndUpdate(
      postId,
      { $push: { comments: { user: req.user._id, content } } 
      },
      { new: true }
    ).populate("author", "name email username profilePicture headline");

    // 通知
    if (post.author._id.toString() !== req.user._id.toString()) {
      const newNotification = new Notification({
        recipient: post.author,
        type: "comment",
        relatedUser: req.user._id,
        relatedPost: postId
      });
      await newNotification.save();

      // メール送信
      try {
        const postUrl = process.env.CLIENT_URL + "/post/" + postId;
        await sendCommentNotificationEmail(post.author.email, post.author.name, req.user.name, postUrl, content);
      } catch (error) {
        console.error("コメント通知メールの送信に失敗しました: ", error);
      }
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
    const post = await Post.findById(postId);
    const userId = req.user._id;

    // いいねの更新
    if (post.likes.includes(userId)) {
      post.likes = post.likes.filter((id) => id.toString() !== userId.toString());
    } else {
      post.likes.push(userId);
    }

    // 投稿を保存
    await post.save();

    // いいねを押されたユーザーへの通知
    if (post.author.toString() !== userId.toString()) {
      const newNotification = new Notification({
        recipient: post.author,
        type: "like",
        relatedUser: userId,
        relatedPost: postId
      });

      await newNotification.save();
    }
  } catch (error) {
    console.error("いいねに失敗しました: ", error);
    res.status(500).json({ message: "サーバーエラーの可能性あり。" });
  }
};