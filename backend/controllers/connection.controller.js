import ConnectionRequest from "../models/connectionRequest.model.js";
import User from "../models/user.model.js";
import Notification from "../models/notification.model.js";
import { sendConnectionAcceptedEmail } from "../emails/emailHandlers.js";

export const sendConnectionRequest = async (req, res) => {
  try {
		const { userId } = req.params;
		const senderId = req.user._id;

		if (senderId.toString() === userId) {
			return res.status(400).json({ message: "自分自身にリクエストを送信することはできません。" });
		}

		if (req.user.connections.includes(userId)) {
			return res.status(400).json({ message: "コネクションしています。" });
		}

		const existingRequest = await ConnectionRequest.findOne({
			sender: senderId,
			recipient: userId,
			status: "pending",
		});

		if (existingRequest) {
			return res.status(400).json({ message: "リクエスト送信済みです。" });
		}

		const newRequest = new ConnectionRequest({
			sender: senderId,
			recipient: userId,
		});

		await newRequest.save();

		res.status(201).json({ message: "コネクションリクエストを送信しました。" });
	} catch (error) {
		res.status(500).json({ message: "サーバーエラーの可能性あり。" });
	}
}

export const acceptConnectionRequest = async (req, res) => {
  try {
		const { requestId } = req.params;
		const userId = req.user._id;

		const request = await ConnectionRequest.findById(requestId)
			.populate("sender", "name email username")
			.populate("recipient", "name username");

		if (!request) {
			return res.status(404).json({ message: "コネクションリクエストが見つかりませんでした。" });
		}

		// check if the req is for the current user
		if (request.recipient._id.toString() !== userId.toString()) {
			return res.status(403).json({ message: "このリクエストを受け入れる権限がありません。" });
		}

		if (request.status !== "pending") {
			return res.status(400).json({ message: "このリクセストは既に承認済みです。" });
		}

		request.status = "accepted";
		await request.save();

		// if im your friend then ur also my friend ;)
		await User.findByIdAndUpdate(request.sender._id, { $addToSet: { connections: userId } });
		await User.findByIdAndUpdate(userId, { $addToSet: { connections: request.sender._id } });

		const notification = new Notification({
			recipient: request.sender._id,
			type: "connectionAccepted",
			relatedUser: userId,
		});

		await notification.save();

		res.json({ message: "コネクションが正常に受け入れられました。" });

		const senderEmail = request.sender.email;
		const senderName = request.sender.name;
		const recipientName = request.recipient.name;
		const profileUrl = process.env.CLIENT_URL + "/profile/" + request.recipient.username;

		try {
			await sendConnectionAcceptedEmail(senderEmail, senderName, recipientName, profileUrl);
		} catch (error) {
			console.error("sendConnectionAcceptedEmail内でエラー:", error);
		}
	} catch (error) {
		console.error("コネクションリクエストの受け入れに失敗しました:", error);
		res.status(500).json({ message: "サーバーエラーの可能性あり。" });
	}
}

export const rejectConnectionRequest = async (req, res) => {
  try {
		const { requestId } = req.params;
		const userId = req.user._id;

		const request = await ConnectionRequest.findById(requestId);

		if (request.recipient.toString() !== userId.toString()) {
			return res.status(403).json({ message: "このリクエストを拒否する権限がありません。" });
		}

		if (request.status !== "pending") {
			return res.status(400).json({ message: "このリクセストは既に承認済みです。" });
		}

		request.status = "rejected";
		await request.save();

		res.json({ message: "コネクションリクエストを拒否しました。" });
	} catch (error) {
		console.error("コネクションの拒否に失敗しました。:", error);
		res.status(500).json({ message: "サーバーエラーの可能性あり。" });
	}
}

export const getConnectionRequests = async (req, res) => {
  try {
		const userId = req.user._id;

		const requests = await ConnectionRequest.find({ recipient: userId, status: "pending" }).populate(
			"sender",
			"name username profilePicture headline connections"
		);

		res.json(requests);
	} catch (error) {
		console.error("コネクションリクエストの受け入れに失敗しました。:", error);
		res.status(500).json({ message: "サーバーエラーの可能性あり。" });
	}
}

export const getUserConnections = async (req, res) => {
  try {
		const userId = req.user._id;

		const user = await User.findById(userId).populate(
			"connections",
			"name username profilePicture headline connections"
		);

		res.json(user.connections);
	} catch (error) {
		console.error("コネクションユーザーの取得に失敗しました。:", error);
		res.status(500).json({ message: "サーバーエラーの可能性あり。" });
	}
}

export const removeConnection = async (req, res) => {
  try {
		const myId = req.user._id;
		const { userId } = req.params;

		await User.findByIdAndUpdate(myId, { $pull: { connections: userId } });
		await User.findByIdAndUpdate(userId, { $pull: { connections: myId } });

		res.json({ message: "コネクションの削除に成功しました。" });
	} catch (error) {
		console.error("コネクションの削除に失敗しました。:", error);
		res.status(500).json({ message: "サーバーエラーの可能性あり。" });
	}
}

export const getConnectionStatus = async (req, res) => {
  try {
		const targetUserId = req.params.userId;
		const currentUserId = req.user._id;

		const currentUser = req.user;
		if (currentUser.connections.includes(targetUserId)) {
			return res.json({ status: "connected" });
		}

		const pendingRequest = await ConnectionRequest.findOne({
			$or: [
				{ sender: currentUserId, recipient: targetUserId },
				{ sender: targetUserId, recipient: currentUserId },
			],
			status: "pending",
		});

		if (pendingRequest) {
			if (pendingRequest.sender.toString() === currentUserId.toString()) {
				return res.json({ status: "pending" });
			} else {
				return res.json({ status: "received", requestId: pendingRequest._id });
			}
		}

		// if no connection or pending req found
		res.json({ status: "not_connected" });
	} catch (error) {
		console.error("コネクションステータスの取得に失敗しました。:", error);
		res.status(500).json({ message: "サーバーエラーの可能性あり。" });
	}
}