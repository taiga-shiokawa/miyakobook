import { Loader } from "lucide-react";
import { axiosInstance } from "../lib/axios"
import { useQuery } from "@tanstack/react-query";

const UserCountPage = () => {
  const { data: userStats, isLoading, error } = useQuery({
    queryKey: ["userStats"],
    queryFn: async () => {
      const res = await axiosInstance.get("/users/user-count");
      return res.data;
    },
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader className="animate-spin" size={40} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen text-red-500">
        エラーが発生しました: {error.message}
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="test-2xl font-bold mb-6">ユーザー統計</h1>

      {/* 総ユーザー数 */}
      <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-gray-500 text-sm mb-2">総ユーザー数</h2>
          <p className="text-3xl font-bold text-[#5fced8]">
            {userStats.total}
            <span className="text-sm font-normal text-gray-500 ml-1">人</span>
          </p>
        </div>
    </div>
  )
}

export default UserCountPage