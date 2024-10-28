import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";
import AuthLayout from "../components/layout/AuthLayout";

const ResetPasswordPage = () => {
 const [searchParams] = useSearchParams();
 const token = searchParams.get("token");
 const [newPassword, setNewPassword] = useState("");
 const navigate = useNavigate();

 const { mutate: resetPasswordMutation, isLoading } = useMutation({
   mutationFn: async (data) => {
     const res = await axiosInstance.post(`/auth/reset-password?token=${token}`, {
       newPassword: data.newPassword
     });
     return res.data;
   },
   onSuccess: () => {
     toast.success("パスワードを更新しました。");
     navigate("/login");
   },
   onError: (error) => {
     toast.error(error.response?.data?.message || "パスワードの更新に失敗しました。");
   },
 });

 const handleSubmit = (e) => {
   e.preventDefault();

   if (!token) {
     toast.error("無効なリクエストです。");
     return;
   }

   if (newPassword.length < 6) {
     toast.error("パスワードは6文字以上にしてください。");
     return;
   }

   resetPasswordMutation({ newPassword });
 };

 return (
   <AuthLayout>
     <div className="max-w-md w-full mx-auto">
       <div className="text-center mb-8">
         <h1 className="text-2xl font-bold text-gray-900 mb-2">
           新しいパスワードを設定
         </h1>
         <p className="text-gray-600">
           新しいパスワードを入力してください。
         </p>
       </div>

       <form onSubmit={handleSubmit} className="flex flex-col gap-6">
         <div className="space-y-2">
           <label
             htmlFor="password"
             className="block text-sm font-medium text-gray-700"
           >
             新しいパスワード
           </label>
           <input
             id="password"
             type="password"
             value={newPassword}
             onChange={(e) => setNewPassword(e.target.value)}
             placeholder="新しいパスワード（6文字以上）"
             className="input input-bordered w-full px-4 py-3 rounded-lg border focus:ring-2 focus:ring-[#5fced8] focus:border-[#5fced8] transition-all duration-200"
             required
             minLength={6}
           />
         </div>

         <button
           type="submit"
           disabled={isLoading}
           className="w-full py-3 px-4 bg-[#5fced8] hover:bg-[#4db9c3] text-white font-semibold rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-[#5fced8] focus:ring-opacity-75 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
         >
           {isLoading ? (
             <span className="flex items-center justify-center gap-2">
               <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                 <circle
                   className="opacity-25"
                   cx="12"
                   cy="12"
                   r="10"
                   stroke="currentColor"
                   strokeWidth="4"
                   fill="none"
                 />
                 <path
                   className="opacity-75"
                   fill="currentColor"
                   d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                 />
               </svg>
               更新中...
             </span>
           ) : (
             "パスワードを更新"
           )}
         </button>

         <p className="text-center text-sm text-gray-600">
           <a 
             href="/login" 
             className="text-[#5fced8] hover:text-[#4db9c3] font-medium"
           >
             ログインページに戻る
           </a>
         </p>
       </form>
     </div>
   </AuthLayout>
 );
};

export default ResetPasswordPage;