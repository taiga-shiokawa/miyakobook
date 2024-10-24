const AuthLayout = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex-grow">
        <div className='flex flex-col justify-center py-12 sm:px-6 lg:px-8'>
          <div className='sm:mx-auto sm:w-full sm:max-w-md'>
            <img 
              className='mx-auto h-24 w-auto' 
              src='miyakobook-image-removebg-preview.png' 
              alt='miyakobook' 
            />
          </div>
          <div className='mt-8 sm:mx-auto sm:w-full sm:max-w-md shadow-md'>
            <div className='bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10'>
              {children}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;