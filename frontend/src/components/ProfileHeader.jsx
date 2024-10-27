import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { axiosInstance } from "../lib/axios";
import { toast } from "react-hot-toast";

import { Camera, Clock, MapPin, UserCheck, UserPlus, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import BannerImageEditor from "./BannerImageEditor";

const ProfileHeader = ({ userData, onSave, isOwnProfile }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedData, setEditedData] = useState({
    name: userData.name || "",
    username: userData.username || "",
    headline: userData.headline || "",
    location: userData.location || "",
  });
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [showBannerEditor, setShowBannerEditor] = useState(false);
  const [selectedBannerImage, setSelectedBannerImage] = useState(null);

  // バナー画像の選択処理
  const handleBannerSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setSelectedBannerImage(reader.result);
        setShowBannerEditor(true);
      };
      reader.readAsDataURL(file);
    }
  };
  // バナー画像の保存処理
  const handleBannerSave = (croppedImage) => {
    setEditedData((prev) => ({
      ...prev,
      bannerImg: croppedImage,
    }));
    setShowBannerEditor(false);
  };

  // 編集モード開始時にデータを初期化
  const startEditing = () => {
    setEditedData({
      name: userData.name || "",
      username: userData.username || "",
      headline: userData.headline || "",
      location: userData.location || "",
      // その他のフィールド...
    });
    setIsEditing(true);
  };

  const { data: authUser } = useQuery({ queryKey: ["authUser"] });

  const { data: connectionStatus, refetch: refetchConnectionStatus } = useQuery(
    {
      queryKey: ["connectionStatus", userData._id],
      queryFn: () => axiosInstance.get(`/connections/status/${userData._id}`),
      enabled: !isOwnProfile,
    }
  );

  const isConnected = userData.connections.some(
    (connection) => connection === authUser._id
  );

  const { mutate: sendConnectionRequest } = useMutation({
    mutationFn: (userId) =>
      axiosInstance.post(`/connections/request/${userId}`),
    onSuccess: () => {
      toast.success("コネクションリクエストを送りました");
      refetchConnectionStatus();
      queryClient.invalidateQueries(["connectionRequests"]);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "エラー発生");
    },
  });

  const { mutate: acceptRequest } = useMutation({
    mutationFn: (requestId) =>
      axiosInstance.put(`/connections/accept/${requestId}`),
    onSuccess: () => {
      toast.success("コネクションリクエストを受け入れました");
      refetchConnectionStatus();
      queryClient.invalidateQueries(["connectionRequests"]);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "エラー発生");
    },
  });

  const { mutate: rejectRequest } = useMutation({
    mutationFn: (requestId) =>
      axiosInstance.put(`/connections/reject/${requestId}`),
    onSuccess: () => {
      toast.success("コネクションリクエストを拒否しました");
      refetchConnectionStatus();
      queryClient.invalidateQueries(["connectionRequests"]);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "エラー発生");
    },
  });

  const { mutate: removeConnection } = useMutation({
    mutationFn: (userId) => axiosInstance.delete(`/connections/${userId}`),
    onSuccess: () => {
      toast.success("コネクションを削除しました");
      refetchConnectionStatus();
      queryClient.invalidateQueries(["connectionRequests"]);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "エラー発生");
    },
  });

  const getConnectionStatus = useMemo(() => {
    if (isConnected) return "connected";
    if (!isConnected) return "not_connected";
    return connectionStatus?.data?.status;
  }, [isConnected, connectionStatus]);

  const renderConnectionButton = () => {
    const baseClass =
      "text-white py-2 px-4 rounded-full transition duration-300 flex items-center justify-center";
    switch (getConnectionStatus) {
      case "connected":
        return (
          <div className="flex gap-2 justify-center">
            <div className={`${baseClass} bg-[#5fced8] hover:bg-green-600`}>
              <UserCheck size={20} className="mr-2" />
              コネクション中
            </div>
            <button
              className={`${baseClass} bg-red-500 hover:bg-red-600 text-sm`}
              onClick={() => removeConnection(userData._id)}
            >
              <X size={20} className="mr-2" />
              コネクション削除
            </button>
          </div>
        );

      case "pending":
        return (
          <button className={`${baseClass} bg-yellow-500 hover:bg-yellow-600`}>
            <Clock size={20} className="mr-2" />
            Pending
          </button>
        );

      case "received":
        return (
          <div className="flex gap-2 justify-center">
            <button
              onClick={() => acceptRequest(connectionStatus.data.requestId)}
              className={`${baseClass} bg-green-500 hover:bg-green-600`}
            >
              Accept
            </button>
            <button
              onClick={() => rejectRequest(connectionStatus.data.requestId)}
              className={`${baseClass} bg-red-500 hover:bg-red-600`}
            >
              Reject
            </button>
          </div>
        );
      default:
        return (
          <button
            onClick={() => sendConnectionRequest(userData._id)}
            className="bg-[#5fced8] hover:bg-primary-dark text-white py-2 px-4 rounded-full transition duration-300 flex items-center justify-center"
          >
            <UserPlus size={20} className="mr-2" />
            コネクト
          </button>
        );
    }
  };

  const handleImageChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setEditedData((prev) => ({
          ...prev,
          [event.target.name]: reader.result,
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    try {
      // 明示的に空文字を含むオブジェクトを作成
      const dataToSave = {
        ...editedData,
        headline: editedData.headline ?? "", // undefinedの場合は空文字を使用
      };

      // フロントエンドでの基本的なバリデーション
      if (!dataToSave.name?.trim() || !dataToSave.username?.trim()) {
        toast.error("ユーザー名とニックネームは必須です");
        return;
      }

      // usernameが変更された場合の特別な処理
      if (dataToSave.username && dataToSave.username !== userData.username) {
        const confirmed = window.confirm(
          "ニックネームを変更します。よろしいですか？"
        );

        if (!confirmed) {
          return;
        }
      }

      await onSave(dataToSave);
      setIsEditing(false);

      // username変更が成功した場合、新しいプロフィールURLに遷移
      if (dataToSave.username && dataToSave.username !== userData.username) {
        navigate(`/profile/${dataToSave.username}`);
        // authUserも更新
        queryClient.invalidateQueries(["authUser"]);
      }
    } catch (error) {
      // バックエンドからのエラーメッセージを表示
      const errorMessage =
        error.response?.data?.message || "更新に失敗しました";
      toast.error(errorMessage);
      console.error("プロフィール更新エラー:", error);
    }
  };

  return (
    <div className="bg-white shadow rounded-lg mb-6">
      <div
        className="relative h-48 w-auto rounded-t-lg bg-black bg-center"
        style={{
          backgroundImage: `url('${
            editedData.bannerImg || userData.bannerImg || "/banner.png"
          }')`,
          backgroundSize: 'cover',  // または 'contain'
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        }}
      >
        
        {isEditing && (
          <label className="absolute top-2 right-2 bg-white p-2 rounded-full shadow cursor-pointer hover:bg-gray-100 transition-colors">
            <Camera size={20} />
            <input
              type="file"
              className="hidden"
              onChange={handleBannerSelect}
              accept="image/*"
            />
          </label>
        )}
      </div>

      {/* バナー編集モーダル */}
      {showBannerEditor && selectedBannerImage && (
        <BannerImageEditor
          image={selectedBannerImage}
          onSave={handleBannerSave}
          onCancel={() => setShowBannerEditor(false)}
        />
      )}

      <div className="p-4">
        <div className="relative -mt-20 mb-4">
          <img
            className="w-32 h-32 rounded-full mx-auto object-cover"
            src={
              editedData.profilePicture ||
              userData.profilePicture ||
              "/avatar.png"
            }
            alt={userData.name}
          />

          {isEditing && (
            <label className="absolute bottom-0 right-1/2 transform translate-x-16 bg-white p-2 rounded-full shadow cursor-pointer">
              <Camera size={20} />
              <input
                type="file"
                className="hidden"
                name="profilePicture"
                onChange={handleImageChange}
                accept="image/*"
              />
            </label>
          )}
        </div>

        <div className="text-center mb-4">
          {isEditing ? (
            <div className="space-y-3">
              <div>
                <label className="block text-sm text-gray-600 mb-1">@</label>
                <input
                  type="text"
                  value={editedData.name ?? userData.name}
                  onChange={(e) =>
                    setEditedData({ ...editedData, name: e.target.value })
                  }
                  className="text-lg border border-gray-300 rounded-md text-center w-full"
                  placeholder="ユーザー名"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">
                  ニックネーム
                </label>
                <input
                  type="text"
                  value={editedData.username ?? userData.username}
                  onChange={(e) =>
                    setEditedData({ ...editedData, username: e.target.value })
                  }
                  className="text-xl font-bold border border-gray-300 rounded-md text-center w-full mb-2"
                  placeholder="ニックネーム"
                />
              </div>
            </div>
          ) : (
            <div className="mb-4">
              <div className="text-lg text-gray-800">@{userData.name}</div>
              <h1 className="text-2xl font-bold">{userData.username}</h1>
            </div>
          )}

          {isEditing ? (
            <input
              type="text"
              value={editedData.headline}
              onChange={(e) =>
                setEditedData((prev) => ({
                  ...prev,
                  headline: e.target.value,
                }))
              }
              placeholder="例: ひとこと"
              className="text-gray-600 border border-gray-300 rounded-md text-center w-full"
            />
          ) : (
            <p className="text-gray-600">{userData.headline || ""}</p>
          )}

          <div className="flex justify-center items-center mt-2">
            <MapPin size={16} className="text-gray-500 mr-1" />
            {isEditing ? (
              <input
                type="text"
                value={editedData.location ?? userData.location}
                onChange={(e) =>
                  setEditedData({ ...editedData, location: e.target.value })
                }
                placeholder="例: 沖縄県宮古島市"
                className="text-gray-600 border border-gray-300 rounded-md text-center"
              />
            ) : (
              <span className="text-gray-600">{userData.location}</span>
            )}
          </div>
        </div>

        {isOwnProfile ? (
          isEditing ? (
            <button
              className="w-full bg-primary text-white py-2 px-4 rounded-full hover:bg-primary-dark
							 transition duration-300"
              onClick={handleSave}
            >
              保存
            </button>
          ) : (
            <button
              onClick={() => startEditing()}
              className="w-full bg-[#5fced8] text-white py-2 px-4 rounded-full hover:bg-primary-dark
							 transition duration-300"
            >
              プロフィールを編集
            </button>
          )
        ) : (
          <div className="flex justify-center">{renderConnectionButton()}</div>
        )}
      </div>
    </div>
  );
};

export default ProfileHeader;
