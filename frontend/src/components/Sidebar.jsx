import { Bell, Home, UserPlus } from "lucide-react";
import { Link } from "react-router-dom";

export default function Sidebar({ user }) {
  return (
    <div className='bg-secondary rounded-lg shadow'>
			<div className='p-4 text-center'>
				{/* バナー画像のサイズを調整 */}
        <div
          className='h-12 rounded-t-lg bg-black bg-center bg-cover bg-no-repeat'
          style={{
            backgroundImage: `url("${user.bannerImg || "banner.png"}")`,
          }}
        />
        <Link to={`/profile/${user.username}`}>
          {/* プロフィール画像のサイズを調整 */}
          <img
            src={user.profilePicture || "/avatar.png"}
            alt={user.username}
            className='w-16 h-16 rounded-full mx-auto mt-[-24px] object-cover border-2 border-white'
          />
          <h2 className='text-sm font-semibold mt-2'>{user.username}</h2>
        </Link>
        <p className='text-info text-xs'>{user.headline}</p>
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