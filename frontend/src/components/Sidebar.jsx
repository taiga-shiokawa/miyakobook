import { Bell, Home, UserPlus } from "lucide-react";
import { Link } from "react-router-dom";

export default function Sidebar({ user }) {
  return (
    <div className='bg-secondary rounded-lg shadow'>
			<div className='p-4 text-center'>
				<div
					className='h-16 rounded-t-lg bg-black bg-center'
					style={{
						backgroundImage: `url("${user.bannerImg || "banner.png"}")`,
					}}
				/>
				<Link to={`/profile/${user.username}`}>
					<img
						src={user.profilePicture || "/avatar.png"}
						alt={user.name}
						className='w-20 h-20 rounded-full mx-auto mt-[-40px]'
					/>
					<h2 className='text-xl font-semibold mt-2'>{user.name}</h2>
				</Link>
				<p className='text-info'>{user.headline}</p>
				<p className='text-info text-xs'>コネクション {user.connections.length}</p>
			</div>
			<div className='border-t border-base-100 p-4'>
				<nav>
					<ul className='space-y-2'>
						<li>
							<Link
								to='/'
								className='flex items-center py-2 px-4 rounded-md hover:bg-[#5fced8] hover:text-white transition-colors'
							>
								<Home className='mr-2' size={20} /> ホーム
							</Link>
						</li>
						<li>
							<Link
								to='/network'
								className='flex items-center py-2 px-4 rounded-md hover:bg-[#5fced8] hover:text-white transition-colors'
							>
								<UserPlus className='mr-2' size={20} /> 友達
							</Link>
						</li>
						<li>
							<Link
								to='/notifications'
								className='flex items-center py-2 px-4 rounded-md hover:bg-[#5fced8] hover:text-white transition-colors'
							>
								<Bell className='mr-2' size={20} /> 通知
							</Link>
						</li>
					</ul>
				</nav>
			</div>
			<div className='border-t border-base-100 p-4'>
				<Link to={`/profile/${user.username}`} className='text-sm font-semibold'>
					プロフィール
				</Link>
			</div>
		</div>
  );
}