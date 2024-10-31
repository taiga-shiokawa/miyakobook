import mongoose from "mongoose";

const viewLogSchema = new mongoose.Schema({
  newsId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'News',
    required: true
  },
  userId: String,
  timestamp: {
    type: Date,
    default: Date.now
  }
});

// 複合インデックスを作成（同じニュースと同じユーザーの組み合わせでの検索を最適化）
viewLogSchema.index({ newsId: 1, userId: 1, timestamp: -1 });
viewLogSchema.index({ timestamp: -1 });

const ViewLog = mongoose.model('ViewLog', viewLogSchema);
export default ViewLog