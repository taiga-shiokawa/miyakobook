// MyPostSection.jsx
import { useInfiniteQuery } from "@tanstack/react-query";
import { axiosInstance } from "../lib/axios";
import { Loader } from "lucide-react";
import UserPost from "./UserPost";

const MyPostSection = ({ userId, isOwnProfile }) => {
  // ユーザーの投稿を取得（無限スクロール対応）
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading, error } = useInfiniteQuery({
    queryKey: ["userPosts", userId],
    queryFn: async ({ pageParam = 1 }) => {
      const endpoint = isOwnProfile ? 
        `/posts/my-posts?page=${pageParam}` : 
        `/posts/user-posts/${userId}?page=${pageParam}`;
      
      const response = await axiosInstance.get(endpoint);
      return response.data;
    },
    getNextPageParam: (lastPage) => {
      if (!lastPage?.pagination?.current || !lastPage?.pagination?.pages) {
        return undefined;
      }
      return lastPage.pagination.current < lastPage.pagination.pages
        ? lastPage.pagination.current + 1 
        : undefined;
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

  // すべてのページの投稿を結合
  const allPosts = data?.pages?.reduce((acc, page) => {
    if (page?.posts && Array.isArray(page.posts)) {
      return [...acc, ...page.posts];
    }
    return acc;
  }, []) || [];

  // 投稿がない場合の表示
  if (allPosts.length === 0) {
    return (
      <div className='bg-white shadow rounded-lg p-6'>
        <h2 className='text-xl font-semibold mb-4'>
          {isOwnProfile ? '過去の投稿' : 'ユーザーの投稿'}
        </h2>
        <div className="text-center text-gray-500">
          {isOwnProfile ? 'まだ投稿がありません' : 'このユーザーの投稿はありません'}
        </div>
      </div>
    );
  }

  return (
    <div className='bg-white shadow rounded-lg p-6'>
      <h2 className='text-xl font-semibold mb-4'>
        {isOwnProfile ? '過去の投稿' : 'ユーザーの投稿'}
      </h2>
      <div className='space-y-4'>
        {allPosts.map((post) => (
          <UserPost key={post._id} post={post} />
        ))}

        {/* さらに読み込むボタン */}
        {hasNextPage && (
          <div className="mt-6 text-center">
            <button
              onClick={() => fetchNextPage()}
              disabled={isFetchingNextPage}
              className="px-6 py-3 bg-[#5fced8] text-white rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isFetchingNextPage ? (
                <div className="flex items-center justify-center space-x-2">
                  <Loader className="animate-spin" size={20} />
                  <span>読み込み中...</span>
                </div>
              ) : (
                "さらに投稿を読み込む"
              )}
            </button>
          </div>
        )}

        {/* 全ての投稿を読み込んだ場合のメッセージ */}
        {!hasNextPage && allPosts.length > 0 && (
          <div className="mt-6 text-center text-gray-500">
            すべての投稿を読み込みました
          </div>
        )}
      </div>
    </div>
  );
};

export default MyPostSection;