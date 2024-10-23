import { useQuery } from "@tanstack/react-query";
import { axiosInstance } from "../lib/axios";
import Post from "./Post";  // 既存のPostコンポーネントを再利用
import { Loader } from "lucide-react";

const MyPostSection = () => {
  // 自分の投稿を取得
  const { data: myPosts, isLoading, error } = useQuery({
    queryKey: ["myPosts"],
    queryFn: async () => {
      const response = await axiosInstance.get("/posts/my-posts");
      return response.data;
    }
  });

  // ローディング中の表示
  if (isLoading) {
    return (
      <div className='bg-white shadow rounded-lg p-6'>
        <div className="flex justify-center items-center h-40">
          <Loader className="animate-spin" size={40} />
        </div>
      </div>
    );
  }

  // エラー時の表示
  if (error) {
    return (
      <div className='bg-white shadow rounded-lg p-6'>
        <div className="text-center text-red-500">
          投稿の取得に失敗しました
        </div>
      </div>
    );
  }

  // 投稿がない場合の表示
  if (!myPosts || myPosts.length === 0) {
    return (
      <div className='bg-white shadow rounded-lg p-6'>
        <h2 className='text-xl font-semibold mb-4'>過去の投稿</h2>
        <div className="text-center text-gray-500">
          まだ投稿がありません
        </div>
      </div>
    );
  }

  return (
    <div className='bg-white shadow rounded-lg p-6'>
      <h2 className='text-xl font-semibold mb-4'>過去の投稿</h2>
      <div className='space-y-4'>
        {myPosts.map((post) => (
          <Post key={post._id} post={post} />
        ))}
      </div>
    </div>
  );
};

export default MyPostSection;