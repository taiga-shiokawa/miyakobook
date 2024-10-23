import { useQuery } from "@tanstack/react-query";
import { axiosInstance } from "../lib/axios";
import Sidebar from "../components/Sidebar";
import PostCreation from "../components/PostCreation";
import Post from "../components/Post";
import { Users } from "lucide-react";
import RecommendedUser from "../components/RecommendedUser";
import { useLocation } from "react-router-dom";
import SearchResult from "../components/SearchResult";

const HomePage = () => {
  const location = useLocation();
  const searchResults = location.state?.results;
  const searchKeyword = location.state?.keyword;
  // コネクションを推薦する
  const { data: authUser } = useQuery({ queryKey: ["authUser"] });
  const { data: recommendedUsers } = useQuery({
    queryKey: ["recommendedUsers"],
    queryFn: async () => {
      const res = await axiosInstance.get("/users/suggestions");
      return res.data;
    },
  });

  // 投稿を取得する
  const { data: posts } = useQuery({
    queryKey: ["posts"],
    queryFn: async () => {
      const res = await axiosInstance.get("/posts");
      return res.data;
    },
  });

  console.log("recommendedUsers", recommendedUsers);
  console.log("posts", posts);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
      <div className="hidden lg:block lg:col-span-1">
        <Sidebar user={authUser} />
      </div>

      <div className="col-span-1 lg:col-span-2 order-first lg:order-none">
        <PostCreation user={authUser} />

        {searchResults ? (
          <SearchResult results={searchResults} keyword={searchKeyword} />
        ) : (
          <>
            {posts?.map((post) => (
              <Post key={post._id} post={post} />
            ))}

            {posts?.length === 0 && (
              <div className="bg-white rounded-lg shadow p-8 text-center">
              <div className="mb-6">
                <Users size={64} className="mx-auto text-blue-500" />
              </div>
              <h2 className="text-2xl font-bold mb-4 text-gray-800">
                投稿がありません
              </h2>
            </div>
            )}
          </>
        )}
      </div>

      <div className="col-span-1 lg:col-span-1 hidden lg:block">
        <div className="bg-secondary rounded-lg shadow p-5">
          <h2 className="font-semibold mb-4">知り合いかも</h2>
          {recommendedUsers && recommendedUsers.length > 0 ? (
            recommendedUsers.map((user) => (
              <RecommendedUser key={user._id} user={user} />
            ))
          ) : (
            <p className="text-gray-500 text-sm">現在おすすめのユーザーはいません。</p>
          )}
        </div>
      </div>
      
    </div>
  );
};

export default HomePage;
