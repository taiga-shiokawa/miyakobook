import { useQuery } from "@tanstack/react-query";
import { axiosInstance } from "../lib/axios";
import Sidebar from "../components/Sidebar";
import { Loader, Search, UserPlus } from "lucide-react";
import FriendRequest from "../components/FriendRequest";
import UserCard from "../components/UserCard";
import { useState } from "react";

const NetworkPage = () => {
  const [visibleCount, setVisibleCount] = useState(6);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const increment = 6;

  const showMoreConnections = () => {
    setVisibleCount(prevCount => prevCount + increment);
  };

  const { data: user } = useQuery({ queryKey: ["authUser"] });

  const { data: connectionRequests } = useQuery({
    queryKey: ["connectionRequests"],
    queryFn: () => axiosInstance.get("/connections/requests"),
  });

  const { data: connections } = useQuery({
    queryKey: ["connections"],
    queryFn: () => axiosInstance.get("/connections"),
  });

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    try {
      const response = await axiosInstance.get(`/search/search-users?keyword=${searchQuery}`);
      setSearchResults(response.data);
    } catch (error) {
      console.error("検索エラー:", error);
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className='grid grid-cols-1 lg:grid-cols-4 gap-6'>
      <div className='col-span-1 lg:col-span-1'>
        <Sidebar user={user} />
      </div>
      <div className='col-span-1 lg:col-span-3'>
        <div className='bg-secondary rounded-lg shadow p-6 mb-6'>
          {/* 検索フォーム */}
          <div className="mb-6">
            <form onSubmit={handleSearch} className="w-full">
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="ユーザーを検索..."
                  className="w-full px-4 py-2 pl-10 pr-16 text-gray-900 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={isSearching}
                />
                <div className="absolute inset-y-0 left-0 flex items-center pl-3">
                  <Search className="w-5 h-5 text-gray-400" />
                </div>
                <button
                  type="submit"
                  disabled={isSearching}
                  className="absolute inset-y-0 right-0 flex items-center px-4 text-white bg-[#5fced8] hover:bg-[#4db9c3] rounded-r-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSearching ? (
                    <Loader className="w-5 h-5 animate-spin" />
                  ) : (
                    "検索"
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* 検索結果の表示 */}
          {isSearching ? (
            <div className="flex justify-center items-center py-8">
              <Loader className="w-8 h-8 animate-spin text-[#5fced8]" />
              <span className="ml-2 text-gray-600">検索中...</span>
            </div>
          ) : searchResults.length > 0 ? (
            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-4">検索結果</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {searchResults.map((user) => (
                  <UserCard key={user._id} user={user} />
                ))}
              </div>
            </div>
          ) : searchQuery && !isSearching && (
            <div className="mb-8 text-center py-4 bg-white rounded-lg">
              <p className="text-gray-600">検索結果が見つかりませんでした。</p>
            </div>
          )}

          {/* コネクションリクエスト */}
          {connectionRequests?.data?.length > 0 ? (
            <div className='mb-8'>
              <h2 className='text-xl font-semibold mb-2'>コネクションリクエスト</h2>
              <div className='space-y-4'>
                {connectionRequests.data.map((request) => (
                  <FriendRequest key={request.id} request={request} />
                ))}
              </div>
            </div>
          ) : (
            <div className='bg-white rounded-lg shadow p-6 text-center mb-6'>
              <UserPlus size={48} className='mx-auto text-gray-400 mb-4' />
              <h3 className='text-xl font-semibold mb-2'>コネクションリクエストはありません</h3>
              <p className='text-gray-600'>
                現在、保留中のコネクションリクエストはありません。
              </p>
            </div>
          )}

          {/* コネクション一覧 */}
          {connections?.data?.length > 0 && (
            <div className='mb-8'>
              <h2 className='text-xl font-semibold mb-4'>コネクション中</h2>
              <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
                {connections.data.slice(0, visibleCount).map((connection) => (
                  <UserCard key={connection._id} user={connection} isConnection={true} />
                ))}
              </div>
              {visibleCount < connections.data.length && (
                <div className="text-center mt-4">
                  <button 
                    onClick={showMoreConnections}
                    className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                  >
                    もっと見る
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NetworkPage;