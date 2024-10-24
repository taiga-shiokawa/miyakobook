import { Link } from "react-router-dom"
import LoginForm from "../../components/auth/LoginForm"
import AuthLayout from "../../components/layout/AuthLayout"

const LoginPage = () => {
  return (
    <AuthLayout>
      <LoginForm />
      <div className='mt-6'>
        <div className='relative'>
          <div className='absolute inset-0 flex items-center'>
            <div className='w-full border-t border-gray-300'></div>
          </div>
          <div className='relative flex justify-center text-sm'>
            <span className='px-2 bg-white text-gray-500'>アカウントをお持ちでない方はこちら</span>
          </div>
        </div>
        <div className='mt-6'>
          <Link
            to='/signup'
            className='w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-black bg-white hover:bg-gray-50'
          >
            アカウント作成
          </Link>
        </div>
      </div>
    </AuthLayout>
  )
}

export default LoginPage