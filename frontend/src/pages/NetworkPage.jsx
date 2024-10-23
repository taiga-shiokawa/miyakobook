import { useQuery } from "@tanstack/react-query";
import { axiosInstance } from "../lib/axios";
import Sidebar from "../components/Sidebar";
import { UserPlus } from "lucide-react";
import FriendRequest from "../components/FriendRequest";
import UserCard from "../components/UserCard";
import { useState } from "react";

const NetworkPage = () => {
  const [visibleCount, setVisibleCount] = useState(6); // 初期表示数
  const increment = 6; // 「もっと見る」を押した時に追加で表示する数

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

	return (
		<div className='grid grid-cols-1 lg:grid-cols-4 gap-6'>
			<div className='col-span-1 lg:col-span-1'>
				<Sidebar user={user} />
			</div>
			<div className='col-span-1 lg:col-span-3'>
				<div className='bg-secondary rounded-lg shadow p-6 mb-6'>

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
							{/* <p className='text-gray-600 mt-2'>
								Explore suggested connections below to expand your network!
							</p> */}
						</div>
					)}
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