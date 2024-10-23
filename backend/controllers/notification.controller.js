import Notification from "../models/notification.model.js";

export const getUserNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ recipient: req.user._id })
    .sort({ createdAt: -1 })
    .populate("relatedUser", "name username profilePicture")
    .populate("relatedPost", "content image");

    res.status(200).json(notifications);
  } catch (error) {
    console.error("通知の取得に失敗しました: ", error);
    res.status(500).json({ message: "サーバーエラーの可能性あり。" });
  }
}

export const markNotificationAsRead = async (req, res) => {
  const notificationId = req.params.id;
  try {
    const notification = await Notification.findByIdAndUpdate(
      { _id: notificationId, recipient: req.user._id},
      { read: true },
      { new: true }
    );

    res.json(notification);
  } catch (error) {
    console.error("通知の更新に失敗しました: ", error);
    res.status(500).json({ message: "サーバーエラーの可能性あり。" });
  }
}

export const deleteNotification = async (req, res) => {
  const notificationId = req.params.id;
  try {
    await Notification.findByIdAndDelete({
      _id: notificationId,
      recipient: req.user._id,
    });

    res.json({ message: "通知を削除しました。"});
  } catch (error) {
    console.error("通知の削除に失敗しました: ", error);
    res.status(500).json({ message: "サーバーエラーの可能性あり。" });
  }
}