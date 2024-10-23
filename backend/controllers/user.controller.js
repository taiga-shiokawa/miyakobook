import User from "../models/user.model.js";
import cloudinary from "../lib/cloudinary.js";

export const getSuggestedConnections = async (req, res) => {
  try {
    const currentUser = await User.findById(req.user._id).select("connections");

    const suggestedUsers = await User.aggregate([
      {
        $match: {
          _id: { 
            $ne: req.user._id, 
            $nin: currentUser.connections
          }
        }
      },
      { $sample: { size: 3 } },
      {
        $project: {
          name: 1,
          username: 1,
          profilePicture: 1,
          headline: 1
        }
      }
    ]);

    res.json(suggestedUsers);
  } catch (error) {
    console.error("SuggestedConnectionsの取得に失敗しました: ", error);
    res.status(500).json({ message: "サーバーエラーの可能性あり。" });
  }
};

export const getPublicProfile = async (req, res) => {
  try {
    const user = await User.findOne({ username: req.params.username }).select("-password");

    if (!user) {
      return res.status(404).json({ message: "ユーザーが見つかりませんでした。" });
    }

    res.json(user);
  } catch (error) {
    console.error("PublicProfileの取得に失敗しました: ", error);
    res.status(500).json({ message: "サーバーエラーの可能性あり。" });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const allowedFields = [
      "name",
      "username",
      "headline",
      "about",
      "location",
      "profilePicture",
      "bannerImg",
      "skills",
      "experience",
      "education",
    ];

    const updatedData = {};

    for (const field of allowedFields) {
      if (req.body[field]) {
        updatedData[field] = req.body[field];
      }
    }

    // プロフィール画像とバナー画像のチェック => 画像はcloudinaryにアップロードする
    if (req.body.profilePicture) {
      const result = await cloudinary.uploader.upload(req.body.profilePicture);
      updatedData.profilePicture = result.secure_url;
    }

    if (req.body.bannerImg) {
      const result = await cloudinary.uploader.upload(req.body.bannerImg);
      updatedData.bannerImg = result.secure_url;
    }

    const user = await User.findByIdAndUpdate(req.user._id, { $set: updatedData }, {new: true}).select("-password");
    res.json(user);
  } catch (error) {
    console.error("user.controllerのupdateProfileでエラー発生", error);
    res.status(500).json({ message: "サーバーエラーの可能性あり。" });
  }
};

// ユーザーを全て削除（テストユーザー削除）
export const deleteUser = async (req, res) => {
  try {
    await User.deleteMany({});
    res.json({ message: "ユーザーの削除に成功しました。" });
  } catch (error) {
    console.log("ユーザー削除失敗：", error);
  }
}