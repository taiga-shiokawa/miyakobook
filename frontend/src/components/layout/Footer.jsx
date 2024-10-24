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
          {/* <div className="flex items-center space-x-6">
            <a 
              href="/terms" 
              className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
            >
              利用規約
            </a>
            <a 
              href="/privacy" 
              className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
            >
              プライバシーポリシー
            </a>
            <a 
              href="/contact" 
              className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
            >
              お問い合わせ
            </a>
          </div> */}
        </div>
      </div>
    </footer>
  )
}

export default Footer