import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { formatDistanceToNow } from "date-fns";
import { ja } from "date-fns/locale";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";
import { Card, CardContent } from "./Card";
import { Loader, Trash2 } from "lucide-react";

const NewsCard = ({ news }) => {
  const queryClient = useQueryClient();
  const { data: authUser } = useQuery({
    queryKey: ["authUser"],
  });

  // 削除のミューテーション
  const { mutate: deleteNews, isLoading: isDeleting } = useMutation({
    mutationFn: async () => {
      await axiosInstance.delete(`/news/${news._id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["news"]);
      toast.success("ニュースを削除しました");
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "削除に失敗しました");
    },
  });

  const handleDelete = (e) => {
    e.preventDefault(); // Linkのクリックイベントを停止
    e.stopPropagation();
    
    if (window.confirm("このニュースを削除してもよろしいですか？")) {
      deleteNews();
    }
  };

  const isAdmin = authUser?.userType === "admin";
  return (<Card className="bg-white hover:shadow-lg transition-shadow mb-4 relative">
    <CardContent className="p-4">
      {isAdmin && (
        <button
          onClick={handleDelete}
          disabled={isDeleting}
          className="absolute top-4 right-4 p-2 text-gray-500 hover:text-red-500 rounded-full hover:bg-gray-100 transition-colors"
        >
          {isDeleting ? (
            <Loader className="animate-spin h-5 w-5" />
          ) : (
            <Trash2 size={20} />
          )}
        </button>
      )}

      {news.image && (
        <img
          src={news.image}
          alt={news.title}
          className="w-full h-48 object-cover rounded-lg mb-4"
        />
      )}
      <h3 className="text-xl font-bold mb-2">{news.title}</h3>
      <p className="text-gray-600 mb-4 line-clamp-3">{news.content}</p>
      <div className="flex flex-wrap gap-2 mb-4">
        {news.tags?.map((tag, index) => (
          <span
            key={index}
            className="px-2 py-1 bg-blue-100 text-blue-800 text-sm rounded-full"
          >
            {tag}
          </span>
        ))}
      </div>
      <div className="flex justify-between items-center text-sm text-gray-500">
        <div className="flex items-center gap-2">
          <span>{news.author?.name}</span>
          <span>•</span>
          <span>{news.views || 0} views</span>
        </div>
        <span>
          {formatDistanceToNow(new Date(news.publishedAt), {
            addSuffix: true,
            locale: ja,
          })}
        </span>
      </div>
    </CardContent>
  </Card>
  )
};

export default NewsCard;