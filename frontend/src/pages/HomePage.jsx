import { useQuery, useInfiniteQuery } from "@tanstack/react-query";
import { axiosInstance } from "../lib/axios";
import Sidebar from "../components/Sidebar";
import PostCreation from "../components/PostCreation";
import Post from "../components/Post";
import { Loader, Users } from "lucide-react";
import RecommendedUser from "../components/RecommendedUser";
import { useLocation } from "react-router-dom";
import SearchResult from "../components/SearchResult";

const HomePage = () => {
 const location = useLocation();
 const searchResults = location.state?.results;
 const searchKeyword = location.state?.keyword;

 const { data: authUser } = useQuery({ 
   queryKey: ["authUser"],
   staleTime: 30000,
 });
 
 // コネクションを推薦する
 const { 
   data: recommendedUsers, 
   isLoading: isLoadingUsers,
   error: recommendedError 
 } = useQuery({
   queryKey: ["recommendedUsers"],
   queryFn: async () => {
     const res = await axiosInstance.get("/users/suggestions");
     console.log("Recommended Users Response:", res.data);
     return res.data;
   },
   staleTime: 60000,
 });

 // 投稿を取得する（無限スクロール対応）
 const {
   data: postsData,
   fetchNextPage,
   hasNextPage,
   isFetchingNextPage,
   isLoading: isLoadingPosts,
   error: postsError,
   refetch: refetchPosts
 } = useInfiniteQuery({
   queryKey: ["posts"],
   queryFn: async ({ pageParam = 1 }) => {
     const res = await axiosInstance.get(`/posts?page=${pageParam}`);
     console.log("Posts Response for page", pageParam, ":", res.data);
     return res.data;
   },
   getNextPageParam: (lastPage) => {
     if (!lastPage) return undefined;
     // データがある場合は次のページを判定
     const nextPage = lastPage.pagination?.current < lastPage.pagination?.pages 
       ? lastPage.pagination.current + 1 
       : undefined;
     console.log("Next page:", nextPage);
     return nextPage;
   },
   staleTime: 10000,
 });

 console.log("Auth User:", authUser);
 console.log("Posts Data:", postsData);
 console.log("Posts Loading:", isLoadingPosts);
 console.log("Posts Error:", postsError);

 // 全体のローディング表示
 if (isLoadingPosts && !postsData) {
   return (
     <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
       <div className="hidden lg:block lg:col-span-1">
         <Sidebar user={authUser} />
       </div>
       <div className="col-span-1 lg:col-span-2 order-first lg:order-none flex justify-center items-center min-h-[400px]">
         <Loader className="animate-spin" size={40} />
       </div>
       <div className="col-span-1 lg:col-span-1 hidden lg:block">
         <div className="bg-secondary rounded-lg shadow p-5">
           <h2 className="font-semibold mb-4">知り合いかも</h2>
           <div className="flex justify-center">
             <Loader className="animate-spin" size={20} />
           </div>
         </div>
       </div>
     </div>
   );
 }

 // エラー表示
 if (postsError) {
   return (
     <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
       <div className="hidden lg:block lg:col-span-1">
         <Sidebar user={authUser} />
       </div>
       <div className="col-span-1 lg:col-span-2 order-first lg:order-none">
         <PostCreation user={authUser} />
         <div className="bg-white rounded-lg shadow p-8 text-center text-red-500">
           投稿の取得に失敗しました。
           <button 
             onClick={() => refetchPosts()} 
             className="mt-4 px-4 py-2 bg-[#5fced8] text-white rounded hover:bg-gray-800"
           >
             再読み込み
           </button>
         </div>
       </div>
       <div className="col-span-1 lg:col-span-1 hidden lg:block">
         <div className="bg-secondary rounded-lg shadow p-5">
           <h2 className="font-semibold mb-4">知り合いかも</h2>
           {isLoadingUsers ? (
             <div className="flex justify-center">
               <Loader className="animate-spin" size={20} />
             </div>
           ) : recommendedError ? (
             <p className="text-red-500 text-sm">ユーザーの読み込みに失敗しました</p>
           ) : recommendedUsers?.length > 0 ? (
             recommendedUsers.map((user) => (
               <RecommendedUser key={user._id} user={user} />
             ))
           ) : (
             <p className="text-gray-500 text-sm">
               現在おすすめのユーザーはいません。
             </p>
           )}
         </div>
       </div>
     </div>
   );
 }

 // すべてのページの投稿を結合
 const allPosts = postsData?.pages.flatMap(page => 
   Array.isArray(page) ? page : page.posts || []
 ) || [];

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
           {allPosts.length > 0 ? (
             <div className="space-y-4">
               {allPosts.map((post) => (
                 <Post key={post._id} post={post} />
               ))}
               
               {/* さらに読み込むボタン */}
               <div className="mt-6 text-center">
                 {hasNextPage && (
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
                 )}
                 
                 {!hasNextPage && allPosts.length > 0 && (
                   <p className="text-gray-500">
                     すべての投稿を読み込みました
                   </p>
                 )}
               </div>
             </div>
           ) : (
             <div className="bg-white rounded-lg shadow p-8 text-center">
               <div className="mb-6">
                 <Users size={64} className="mx-auto text-blue-500" />
               </div>
               <h2 className="text-2xl font-bold mb-4 text-gray-800">
                 投稿がありません
               </h2>
               <p className="text-gray-600">
                 最初の投稿を作成してみましょう！
               </p>
             </div>
           )}
         </>
       )}
     </div>

     <div className="col-span-1 lg:col-span-1 hidden lg:block">
       <div className="bg-secondary rounded-lg shadow p-5">
         <h2 className="font-semibold mb-4">知り合いかも</h2>
         {isLoadingUsers ? (
           <div className="flex justify-center">
             <Loader className="animate-spin" size={20} />
           </div>
         ) : recommendedError ? (
           <p className="text-red-500 text-sm">ユーザーの読み込みに失敗しました</p>
         ) : recommendedUsers?.length > 0 ? (
           recommendedUsers.map((user) => (
             <RecommendedUser key={user._id} user={user} />
           ))
         ) : (
           <p className="text-gray-500 text-sm">
             現在おすすめのユーザーはいません。
           </p>
         )}
       </div>
     </div>
   </div>
 );
};

export default HomePage;