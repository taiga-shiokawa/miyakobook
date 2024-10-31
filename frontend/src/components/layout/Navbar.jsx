import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { axiosInstance } from "../../lib/axios";
import { Link, useNavigate } from "react-router-dom";
import { Bell, Home, LogOut, Search, User, Users, Menu, X, Newspaper } from "lucide-react";
import { BsBriefcase } from 'react-icons/bs';
import { useState } from "react";

const Navbar = () => {
  const [searchKeyword, setSearchKeyword] = useState("");
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();

  const { data: authUser } = useQuery({ queryKey: ["authUser"] });
  const queryClient = useQueryClient();

  const { data: notifications } = useQuery({
    queryKey: ["notifications"],
    queryFn: async () => axiosInstance.get("/notifications"),
    enabled: !!authUser,
  });

  const { data: connectionRequests } = useQuery({
    queryKey: ["connectionRequests"],
    queryFn: async () => axiosInstance.get("/connections/requests"),
    enabled: !!authUser,
  });

  const { mutate: logout } = useMutation({
    mutationFn: () => axiosInstance.post("/auth/logout"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["authUser"] });
      setIsMenuOpen(false);
    },
  });

  const handleSearchPost = async (e) => {
    e.preventDefault();
    if (!searchKeyword.trim()) return;
    
    try {
      const response = await axiosInstance.get(`/search?keyword=${searchKeyword}`);
      navigate("/", { state: { results: response.data, keyword: searchKeyword } });
      setIsMenuOpen(false);
    } catch (error) {
      console.error("投稿検索に失敗しました: ", error);
    }
  };

  const unreadNotificationCount = notifications?.data.filter((notif) => !notif.read).length;
  const unreadConnectionRequestsCount = connectionRequests?.data?.length;

  const NavLinks = () => (
    <>
      <Link to={"/"} className='text-neutral flex flex-col items-center' onClick={() => setIsMenuOpen(false)}>
        <Home size={20} />
        <span className='text-xs md:block'>ホーム</span>
      </Link>
      <Link to='/network' className='text-neutral flex flex-col items-center relative' onClick={() => setIsMenuOpen(false)}>
        <Users size={20} />
        <span className='text-xs md:block'>友達</span>
        {unreadConnectionRequestsCount > 0 && (
          <span className='absolute -top-1 -right-1 md:right-4 bg-[#f59e0b] text-white text-xs rounded-full size-3 md:size-4 flex items-center justify-center'>
            {unreadConnectionRequestsCount}
          </span>
        )}
      </Link>
      <Link to='/jobs' className='text-neutral flex flex-col items-center relative' onClick={() => setIsMenuOpen(false)}>
        <BsBriefcase size={20} />
        <span className='text-xs md:block'>求人</span>
      </Link>
      <Link to='/news' className='text-neutral flex flex-col items-center relative' onClick={() => setIsMenuOpen(false)}>
        <Newspaper size={20} />
        <span className='text-xs md:block'>ニュース</span>
      </Link>
      <Link to='/notifications' className='text-neutral flex flex-col items-center relative' onClick={() => setIsMenuOpen(false)}>
        <Bell size={20} />
        <span className='text-xs md:block'>通知</span>
        {unreadNotificationCount > 0 && (
          <span className='absolute -top-1 -right-1 md:right-4 bg-red-500 text-white text-xs rounded-full size-3 md:size-4 flex items-center justify-center'>
            {unreadNotificationCount}
          </span>
        )}
      </Link>
      <Link to={`/profile/${authUser?.username}`} className='text-neutral flex flex-col items-center' onClick={() => setIsMenuOpen(false)}>
        <User size={20} />
        <span className='text-xs md:block'>プロフィール</span>
      </Link>
      <button
        className='flex flex-col items-center text-sm text-gray-600 hover:text-gray-800'
        onClick={() => logout()}
      >
        <LogOut size={20} />
        <span className='text-xs md:block'>ログアウト</span>
      </button>
    </>
  );

  return (
    <nav className='bg-secondary shadow-md sticky top-0 z-50'>
      <div className='max-w-7xl mx-auto px-4'>
        <div className='flex justify-between items-center py-3'>
          <div className='flex items-center space-x-4'>
            <Link to='/'>
              <img className='h-10 w-auto rounded' src='https://res.cloudinary.com/dogup1dum/image/upload/v1729907452/miyakobook-image-removebg-preview_z3wlo4.png' alt='miyakobook' />
            </Link>

            {/* 検索フォーム - デスクトップ */}
            {authUser && (
              <form onSubmit={handleSearchPost} className="hidden md:flex items-center max-w-sm">   
                <label htmlFor="simple-search" className="sr-only">Search</label>
                <div className="relative w-full">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <Search className="w-5 h-5 text-gray-500" />
                  </div>
                  <input 
                    type="text" 
                    id="simple-search" 
                    className="border text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 p-2.5"
                    placeholder="投稿を検索..." 
                    value={searchKeyword}
                    onChange={(e) => setSearchKeyword(e.target.value)}
                  />
                </div>
              </form>
            )}
          </div>

          {/* デスクトップナビゲーション */}
          <div className='hidden md:flex items-center gap-6'>
            {authUser ? (
              <NavLinks />
            ) : (
              <div className="flex items-center gap-4">
                <Link 
                  to='/news' 
                  className='flex flex-col items-center gap-1 text-gray-700 hover:text-primary transition-colors duration-200'
                  onClick={() => setIsMenuOpen(false)}
                >
                  <Newspaper className="w-5 h-5" />
                  <span className='text-xs'>ニュース</span>
                </Link>
                <Link 
                  to='/login' 
                  className='text-gray-700 hover:text-primary font-medium transition-colors duration-200'
                >
                  ログイン
                </Link>
                <Link 
                  to='/signup' 
                  className="py-2 px-4 bg-[#5fced8] hover:bg-primary-dark text-white font-medium rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:ring-opacity-50 transition-all duration-200"
                >
                  アカウント作成
                </Link>
              </div>
            )}
          </div>

          {/* ハンバーガーメニューボタン */}
          <button
            className="md:hidden p-2"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* モバイルメニュー */}
      {isMenuOpen && (
        <div className="md:hidden">
          {authUser && (
            <div className="px-4 pt-2 pb-3 space-y-1">
              <form onSubmit={handleSearchPost} className="mb-4">   
                <label htmlFor="mobile-search" className="sr-only">Search</label>
                <div className="relative w-full">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <Search className="w-5 h-5 text-gray-500" />
                  </div>
                  <input 
                    type="text" 
                    id="mobile-search" 
                    className="border text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 p-2.5"
                    placeholder="検索" 
                    value={searchKeyword}
                    onChange={(e) => setSearchKeyword(e.target.value)}
                  />
                </div>
              </form>
              <div className="grid grid-cols-4 gap-4 items-center">
                <NavLinks />
              </div>
            </div>
          )}
          {!authUser && (
            <div className="px-4 py-3 space-y-2">
              <Link to='/login' className="block text-center py-2 text-base font-medium text-gray-700 hover:bg-gray-100 rounded-md">
                ログイン
              </Link>
              <Link to='/signup' className="block text-center py-2 px-3 bg-[#5fced8] hover:bg-[#4db9c3] text-white font-semibold rounded-lg">
                アカウント作成
              </Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;