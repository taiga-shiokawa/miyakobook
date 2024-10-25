import Post from "../models/post.model.js";
import User from "../models/user.model.js";

export const getSearchResults = async (req, res) => {
  try {
    const { keyword } = req.query;

    if (!keyword) {
      return res.status(400).json({ message: "検索キーワードを入力してください。" });
    }

    const searchResults = await Post.find({
      content: { $regex: keyword, $options: "i" },
    }).populate("author", "name username profilePicture headline")
      .sort({ createdAt: -1 });

    res.status(200).json(searchResults);
  } catch (error) {
    console.error("検索結果の取得に失敗しました: ", error);
    res.status(500).json({ message: "サーバーエラーの可能性あり。" });
  }
}

export const getSearchUsers = async (req, res) => {
  try {
    const { keyword } = req.query;

    const searchUserResults = await User.find({
      username: { $regex: keyword, $options: "i" },
    });

    res.status(200).json(searchUserResults);
  } catch (error) {
    console.error("検索結果の取得に失敗しました: ", error);
    res.status(500).json({ message: "サーバーエラーの可能性あり。" });
  }
}