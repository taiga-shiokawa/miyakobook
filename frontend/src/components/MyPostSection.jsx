import { useInfiniteQuery } from "@tanstack/react-query";
import { useInView } from "react-intersection-observer";
import { axiosInstance } from "../lib/axios";
import Post from "./Post";
import { useEffect } from "react";
import { Loader } from "lucide-react";

const MyPostSection = ({ userId }) => {
  const { ref, inView } = useInView();

  const {
    data,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    status,
  } = useInfiniteQuery({
    queryKey: ["myPosts", userId],
    queryFn: async ({ pageParam = 1 }) => {
      const response = await axiosInstance.get(`/posts/my-posts`, {
        params: {
          page: pageParam,
          userId: userId
        }
      });
      return response.data;
    },
    getNextPageParam: (lastPage) => {
      if (lastPage.pagination.current < lastPage.pagination.pages) {
        return lastPage.pagination.current + 1;
      }
      return undefined;
    },
  });

  useEffect(() => {
    if (inView && hasNextPage) {
      fetchNextPage();
    }
  }, [inView, fetchNextPage, hasNextPage]);

  if (status === "loading") {
    return (
      <div className="text-center p-4">
        <Loader className="animate-spin" />
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="text-center text-red-500 p-4">
        Error: {error.message}
      </div>
    );
  }

  // データが空の場合
  if (!data || !data.pages || data.pages.length === 0) {
    return (
      <div className="mt-8">
        <h2 className="text-xl font-bold mb-4">投稿</h2>
        <p className="text-center text-gray-500">投稿がありません</p>
      </div>
    );
  }

  return (
    <div className="mt-8">
      <h2 className="text-xl font-bold mb-4">投稿</h2>
      {data.pages.map((page, i) => (
        <div key={i}>
          {page.posts && page.posts.map((post) => (
            <Post key={post._id} post={post} />
          ))}
        </div>
      ))}
      <div ref={ref} className="h-10 flex justify-center">
        {isFetchingNextPage && (
          <Loader className="animate-spin" />
        )}
      </div>
    </div>
  );
};

export default MyPostSection;