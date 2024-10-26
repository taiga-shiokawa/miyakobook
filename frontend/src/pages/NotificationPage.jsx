import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { axiosInstance } from "../lib/axios";
import { toast } from "react-hot-toast";
import { ExternalLink, Eye, MessageSquare, ThumbsUp, Trash2, UserPlus } from "lucide-react";
import { Link } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import { formatDistanceToNow } from "date-fns";

const NotificationsPage = () => {
	const { data: authUser } = useQuery({ queryKey: ["authUser"] });
	const queryClient = useQueryClient();

	const { data: notifications, isLoading } = useQuery({
		queryKey: ["notifications"],
		queryFn: () => axiosInstance.get("/notifications"),
	});

	const { mutate: markAsReadMutation } = useMutation({
		mutationFn: (id) => axiosInstance.put(`/notifications/${id}/read`),
		onSuccess: () => {
			queryClient.invalidateQueries(["notifications"]);
		},
	});

	const { mutate: deleteNotificationMutation } = useMutation({
		mutationFn: (id) => axiosInstance.delete(`/notifications/${id}`),
		onSuccess: () => {
			queryClient.invalidateQueries(["notifications"]);
			toast.success("Notification deleted");
		},
	});

	const renderNotificationIcon = (type) => {
		switch (type) {
			case "like":
				return <ThumbsUp className='text-blue-500' size={16} />;
			case "comment":
				return <MessageSquare className='text-green-500' size={16} />;
			case "connectionAccepted":
				return <UserPlus className='text-purple-500' size={16} />;
			default:
				return null;
		}
	};

	const renderNotificationContent = (notification) => {
		switch (notification.type) {
			case "like":
				return (
					<span className="break-words">
						<strong>{notification.relatedUser.name}</strong> があなたの投稿にいいねしました
					</span>
				);
			case "comment":
				return (
					<span className="break-words">
						<Link to={`/profile/${notification.relatedUser.username}`} className='font-bold'>
							{notification.relatedUser.name}
						</Link>{" "}
						があなたの投稿にコメントしました
					</span>
				);
			case "connectionAccepted":
				return (
					<span className="break-words">
						<Link to={`/profile/${notification.relatedUser.username}`} className='font-bold'>
							{notification.relatedUser.name}
						</Link>{" "}
						コネクションリクエストを受け入れました
					</span>
				);
			default:
				return null;
		}
	};

	const renderRelatedPost = (relatedPost) => {
		if (!relatedPost) return null;

		return (
			<Link
				to={`/post/${relatedPost._id}`}
				className='mt-2 p-2 bg-gray-50 rounded-md flex items-center space-x-2 hover:bg-gray-100 transition-colors w-full'
			>
				{relatedPost.image && (
					<img src={relatedPost.image} alt='Post preview' className='w-10 h-10 object-cover rounded flex-shrink-0' />
				)}
				<div className='flex-1 min-w-0'>
					<p className='text-sm text-gray-600 truncate'>{relatedPost.content}</p>
				</div>
				<ExternalLink size={14} className='text-gray-400 flex-shrink-0' />
			</Link>
		);
	};

	return (
		<div className='grid grid-cols-1 lg:grid-cols-4 gap-6 px-4 max-w-7xl mx-auto'>
			<div className='col-span-1 lg:col-span-1'>
				<Sidebar user={authUser} />
			</div>
			<div className='col-span-1 lg:col-span-3'>
				<div className='bg-white rounded-lg shadow p-4 sm:p-6'>
					<h1 className='text-2xl font-bold mb-6'>通知</h1>

					{isLoading ? (
						<p>Loading notifications...</p>
					) : notifications && notifications.data.length > 0 ? (
						<ul className='space-y-4'>
							{notifications.data.map((notification) => (
								<li
									key={notification._id}
									className={`bg-white border rounded-lg p-3 sm:p-4 transition-all hover:shadow-md ${
										!notification.read ? "border-blue-500" : "border-gray-200"
									}`}
								>
									<div className='flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4'>
										<div className='flex items-start space-x-3'>
											<Link to={`/profile/${notification.relatedUser.username}`} className="flex-shrink-0">
												<img
													src={notification.relatedUser.profilePicture || "/avatar.png"}
													alt={notification.relatedUser.name}
													className='w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover'
												/>
											</Link>

											<div className='flex-1 min-w-0'>
												<div className='flex items-start gap-2'>
													<div className='p-1 bg-gray-100 rounded-full flex-shrink-0'>
														{renderNotificationIcon(notification.type)}
													</div>
													<div className='flex-1 min-w-0'>
														{renderNotificationContent(notification)}
													</div>
												</div>
												<p className='text-xs text-gray-500 mt-1'>
													{formatDistanceToNow(new Date(notification.createdAt), {
														addSuffix: true,
													})}
												</p>
												{renderRelatedPost(notification.relatedPost)}
											</div>
										</div>

										<div className='flex gap-2 ml-auto sm:ml-0'>
											{!notification.read && (
												<button
													onClick={() => markAsReadMutation(notification._id)}
													className='p-1 bg-blue-100 text-blue-600 rounded hover:bg-blue-200 transition-colors'
													aria-label='Mark as read'
												>
													<Eye size={16} />
												</button>
											)}

											<button
												onClick={() => deleteNotificationMutation(notification._id)}
												className='p-1 bg-red-100 text-red-600 rounded hover:bg-red-200 transition-colors'
												aria-label='Delete notification'
											>
												<Trash2 size={16} />
											</button>
										</div>
									</div>
								</li>
							))}
						</ul>
					) : (
						<p>通知はありません。</p>
					)}
				</div>
			</div>
		</div>
	);
};

export default NotificationsPage;