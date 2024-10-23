import Post from "./Post";

const SearchResult = ({ results, keyword }) => {
  if (results.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-8 text-center">
        <h2 className="text-2xl font-bold mb-4 text-gray-800">
          {keyword} の検索結果はありません
        </h2>
        <p className="text-gray-600">
          別のキーワードで検索してみてください。
        </p>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4 text-gray-800">
        {keyword} の検索結果
      </h2>
      {results.map((post) => (
        <Post key={post._id} post={post} />
      ))}
    </div>
  );
};

export default SearchResult;