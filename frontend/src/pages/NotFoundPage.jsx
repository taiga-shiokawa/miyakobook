import { Link } from "react-router-dom"

const NotFoundPage = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <h1 className="text-6xl font-bold text-gray-800 mb-4">404</h1>
      <p className="text-2xl text-gray-600 mb-8">ページが見つかりません</p>
      <Link to="/" className="px-6 py-3 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors">
        ホームに戻る
      </Link>
    </div>
  )
}

export default NotFoundPage