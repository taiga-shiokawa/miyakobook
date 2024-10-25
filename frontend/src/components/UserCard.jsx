import { Link } from "react-router-dom";

function UserCard({ user }) { // isConnectionを入れる
	return (
		<div className='bg-white rounded-lg shadow p-4 flex flex-col items-center transition-all hover:shadow-md'>
			<Link to={`/profile/${user.username}`} className='flex flex-col items-center'>
				<img
					src={user.profilePicture || "/avatar.png"}
					alt={user.username}
					className='w-24 h-24 rounded-full object-cover mb-4'
				/>
				<h3 className='font-semibold text-lg text-center'>{user.username}</h3>
			</Link>
			<p className='text-gray-600 text-center'>{user.headline}</p>
			<p className='text-sm text-gray-500 mt-2'>コネクション {user.connections?.length}</p>
			{/* <button className="w-full mt-3 py-2 px-4 bg-[#5fced8] hover:bg-[#4db9c3] text-white font-semibold rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-[#5fced8] focus:ring-opacity-75 transition-colors duration-200">
				{isConnection ? "コネクション中" : "コネクト"}
			</button> */}
		</div>
	);
}

export default UserCard;