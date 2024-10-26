import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";
import { Image, Loader } from "lucide-react";

const PostCreation = ({ user }) => {
  const [content, setContent] = useState("");
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [showMentions, setShowMentions] = useState(false);
  const [mentionSearch, setMentionSearch] = useState("");
  const [cursorPosition, setCursorPosition] = useState(0);

  const queryClient = useQueryClient();

  // メンションの候補をサーバーから取得
  const { data: mentionUsersResponse } = useQuery({
    queryKey: ["mentionUsers", mentionSearch],
    queryFn: async () => {
      if (mentionSearch.length < 1) return [];
      const res = await axiosInstance.get(
        `/search/search-users?keyword=${mentionSearch}`
      );
      return res.data;
    },
    enabled: showMentions && mentionSearch.length > 0,
  });

  // mentionUsersを配列として確実に取得
  const mentionUsers = mentionUsersResponse || [];
  // データの形を確認
  console.log('mentionUsersResponse:', mentionUsersResponse);
  console.log('mentionUsers:', mentionUsers);

  const { mutate: createPostMutation, isPending } = useMutation({
    mutationFn: async (postData) => {
      const res = await axiosInstance.post("/posts/create", postData, {
        headers: { "Content-Type": "application/json" },
      });
      return res.data;
    },

    onSuccess: () => {
      resetForm();
      toast.success("投稿に成功しました。");
      queryClient.invalidateQueries({ queryKey: ["posts"] });
    },

    onError: (error) => {
      toast.error(error.response.data.message || "投稿に失敗しました。");
    },
  });

  const handleContentChange = (e) => {
    const newContent = e.target.value;
    const cursorPos = e.target.selectionStart;
    setContent(newContent);
    setCursorPosition(cursorPos);

    // カーソル位置から前方向に@を探す
    const beforeCursor = newContent.slice(0, cursorPos);
    const mentionMatch = beforeCursor.match(/@(\w*)$/);

    if (mentionMatch) {
      setShowMentions(true);
      setMentionSearch(mentionMatch[1]);
    } else {
      setShowMentions(false);
      setMentionSearch("");
    }
  };

  // メンションを選択した時の処理
  const handleSelectMention = (user) => {
    const beforeMention = content.slice(0, cursorPosition).replace(/@\w*$/, "");
    const afterMention = content.slice(cursorPosition);
    setContent(`${beforeMention}@${user.username} ${afterMention}`);
    setShowMentions(false);
  };

  const handlePostCreation = async () => {
    try {
      const postData = { content };
      if (image) postData.image = await readFileAsDataURL(image);
      createPostMutation(postData);
    } catch (error) {
      console.error("handlePostCreationでエラー発生: ", error);
    }
  };

  const resetForm = () => {
    setContent("");
    setImage(null);
    setImagePreview(null);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setImage(file);
    if (file) {
      readFileAsDataURL(file).then(setImagePreview);
    } else {
      setImagePreview(null);
    }
  };

  const readFileAsDataURL = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  return (
    <div className="bg-secondary rounded-lg shadow mb-4 p-4">
      <div className="flex space-x-3">
        <img
          src={user.profilePicture || "/avatar.png"}
          alt={user.name}
          className="size-12 rounded-full"
        />
        <div className="relative flex-1">
          <textarea
            placeholder="何をシェアする？ (@でメンション)"
            className="w-full p-3 rounded-lg bg-base-100 hover:bg-base-200 focus:bg-base-200 focus:outline-none resize-none transition-colors duration-200 min-h-[100px]"
            value={content}
            onChange={handleContentChange}
          />

          {/* メンション候補の表示 */}
          {showMentions &&
            Array.isArray(mentionUsers) &&
            mentionUsers.length > 0 && (
              <div className="absolute z-10 w-full mt-1 max-h-48 overflow-y-auto bg-white border rounded-lg shadow-lg">
                {mentionUsers.map((user) => (
                  <div
                    key={user._id}
                    onClick={() => handleSelectMention(user)}
                    className="p-2 hover:bg-gray-100 cursor-pointer flex items-center gap-2"
                  >
                    <img
                      src={user.profilePicture || "/avatar.png"}
                      alt={user.name}
                      className="w-8 h-8 rounded-full"
                    />
                    <div>
                      <div className="font-semibold">{user.name}</div>
                      <div className="text-sm text-gray-500">
                        @{user.username}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
        </div>
      </div>

      {imagePreview && (
        <div className="mt-4">
          <img
            src={imagePreview}
            alt="Selected"
            className="w-full h-auto rounded-lg"
          />
        </div>
      )}

      <div className="flex justify-between items-center mt-4">
        <div className="flex space-x-4">
          <label className="flex items-center text-info hover:text-info-dark transition-colors duration-200 cursor-pointer">
            <Image size={20} className="mr-2" />
            <span>
              画像{" "}
              <span className="text-xs text-gray-500">
                ※動画は投稿できません
              </span>
            </span>
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleImageChange}
            />
          </label>
        </div>

        <button
          className="py-2 px-4 bg-[#5fced8] hover:bg-[#4db9c3] text-white font-semibold rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-[#5fced8] focus:ring-opacity-75 transition-colors duration-200"
          onClick={handlePostCreation}
          disabled={isPending}
        >
          {isPending ? <Loader className="size-5 animate-spin" /> : "投稿"}
        </button>
      </div>
    </div>
  );
};

export default PostCreation;
