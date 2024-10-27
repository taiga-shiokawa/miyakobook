import { useState } from "react";
import AuthLayout from "../components/layout/AuthLayout"
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState("");

  const queryClient = useQueryClient();

  const { mutate: forgotPasswordMutation, isLoading } = useMutation({
    mutationFn: async (data) => {
      const res = await axiosInstance.post("auth/forgot-password", data);
      return res.data;
    },
    onSuccess: () => {
      toast.success("メールを送信しました。");
      queryClient.invalidateQueries({ queryKey: ["authUser"] });
    },
    onError: (error) => {
      console.error("メール送信中にエラー発生: ", error);
      toast.error(error.response.data.message);
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();

    forgotPasswordMutation({ email });
  }

  return (
    <AuthLayout>
      <div className="max-w-md w-full mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">パスワードをお忘れですか？</h1>
          <p className="text-gray-600">
            登録済みのメールアドレスを入力してください。
            パスワード再設定用のリンクをお送りします。
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          <div className="space-y-2">
            <label 
              htmlFor="email" 
              className="block text-sm font-medium text-gray-700"
            >
              メールアドレス
            </label>
            <input 
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              className="input input-bordered w-full px-4 py-3 rounded-lg border focus:ring-2 focus:ring-[#5fced8] focus:border-[#5fced8] transition-all duration-200"
              required
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
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                送信中...
              </span>
            ) : (
              "送信する"
            )}
          </button>

          <p className="text-center text-sm text-gray-600">
            <a href="/login" className="text-[#5fced8] hover:text-[#4db9c3] font-medium">
              ログインページに戻る
            </a>
          </p>
        </form>
      </div>
    </AuthLayout>
  )
}

export default ForgotPasswordPage