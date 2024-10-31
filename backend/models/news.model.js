import mongoose from "mongoose";

const newsSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true
    },
    content: {
      type: String,
      required: true
    },
    image: {
      type: String, // Cloudinaryなどの画像URLを保存
      default: ""
    },
    tags: [{
      type: String,
      trim: true
    }],
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    featured: {
      type: Boolean,
      default: false // 注目ニュースかどうか
    },
    views: {
      type: Number,
      default: 0 // 閲覧数
    },
    status: {
      type: String,
      enum: ["draft", "published", "archived"],
      default: "published"
    },
    publishedAt: {
      type: Date,
      default: Date.now
    },
    comments: [{
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
      },
      content: {
        type: String,
        required: true
      },
      createdAt: {
        type: Date,
        default: Date.now
      }
    }],
    likes: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    }]
  },
  {
    timestamps: true
  }
);

// インデックスの作成
newsSchema.index({ title: 'text', content: 'text', tags: 'text' }); // 検索用
newsSchema.index({ createdAt: -1 }); // 新着順の取得用
newsSchema.index({ views: -1 }); // 人気順の取得用
newsSchema.index({ status: 1, publishedAt: -1 }); // ステータスと公開日による絞り込み用

const News = mongoose.model("News", newsSchema);

export default News;