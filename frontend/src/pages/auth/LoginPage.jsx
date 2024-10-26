import { Link } from "react-router-dom"
import LoginForm from "../../components/auth/LoginForm"

const LoginPage = () => {
  return (
    <div className="min-h-screen">
      <div className="flex flex-col lg:flex-row items-center justify-center gap-8 py-12 px-4 sm:px-6 lg:px-8 min-h-[80vh]">
        {/* Left side - Site introduction */}
        <div className="flex flex-col max-w-md lg:max-w-xl">
          <img 
            className="h-24 w-auto mb-5" 
            src="https://res.cloudinary.com/dogup1dum/image/upload/v1729907452/miyakobook-image-removebg-preview_z3wlo4.png" 
            alt="miyakobook" 
          />
          <h2 className="text-2xl lg:text-3xl font-medium text-gray-900 leading-relaxed">
            「宮古島」で繋がる
          </h2>
        </div>

        {/* Right side - Login form */}
        <div className="w-full max-w-md">
          <div className="bg-white py-8 px-4 shadow-lg rounded-lg sm:px-10">
            <LoginForm />
            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">
                    アカウントをお持ちでない方はこちら
                  </span>
                </div>
              </div>
              <div className="mt-6">
                <Link
                  to="/signup"
                  className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-black bg-white hover:bg-gray-50 border-gray-300"
                >
                  アカウント作成
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default LoginPage