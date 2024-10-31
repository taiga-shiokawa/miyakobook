import { Link } from "react-router-dom"

const Footer = () => {
  return (
    <footer className="w-full bg-base-100 shadow-md border-t">
      <div className="max-w-7xl mx-auto px-4">
        <div className="py-4 flex flex-col md:flex-row md:justify-between items-center">
          {/* ロゴとコピーライト */}
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-500">
              Miyakobook © 2024
            </span>
          </div>

          {/* リンク */}
          <div className="flex items-center space-x-6">
            <Link to="/term">
              利用規約
            </Link>
            <Link to="/privacy">
              プライバシーポリシー
            </Link>
            <a href="https://forms.gle/v4NhAnFrQKPkvy5i8" target="_blank" rel="noopener noreferrer" className="target_bla">
              お問い合わせ
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer