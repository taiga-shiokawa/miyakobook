import { Link } from "react-router-dom"
import SignUpForm from "../../components/auth/SignUpForm"
import AuthLayout from "../../components/layout/AuthLayout"

const SignUpPage = () => {
  return (
    <AuthLayout>
      <SignUpForm />
      <div className='mt-6'>
        <div className='relative'>
          <div className='absolute inset-0 flex items-center'>
            <div className='w-full border-t border-gray-300'></div>
          </div>
          <div className='relative flex justify-center text-sm'>
            <span className='px-2 bg-white text-gray-500'>アカウントをお持ちの方はこちら</span>
          </div>
        </div>
        <div className='mt-6'>
          <Link 
            to='/login'
            className='w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-black bg-white hover:bg-gray-50'
          >
            ログイン
          </Link>
        </div>
      </div>
    </AuthLayout>
  )
}

export default SignUpPage