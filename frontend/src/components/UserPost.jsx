const UserPost = ({ post }) => {
  // Postコンポーネントから必要な表示部分のみを抽出
  return (
    <div className="border-b border-gray-200 p-4">
      <div className="flex items-start space-x-3">
        {/* 投稿者情報（アバターなど）は表示しない or 簡略化 */}
        <div className="flex-1">
          <div className="text-sm text-gray-500">
            {new Date(post.createdAt).toLocaleString()}
          </div>
          <p className="mt-1">{post.content}</p>
          {post.image && (
            <img 
              src={post.image} 
              alt="投稿画像" 
              className="mt-2 rounded-lg max-h-96 object-cover"
            />
          )}
          {/* いいねボタンなど必要な機能のみ実装 */}
        </div>
      </div>
    </div>
  );
};

export default UserPost;