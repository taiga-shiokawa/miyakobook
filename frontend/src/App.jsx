import { Navigate, Route, Routes } from "react-router-dom"
import Layout from "./components/layout/Layout"
import SignUpPage from "./pages/auth/SignUpPage"
import LoginPage from "./pages/auth/LoginPage"
import HomePage from "./pages/HomePage"
import  toast, { Toaster } from "react-hot-toast"
import { useQuery } from "@tanstack/react-query"
import { axiosInstance } from "./lib/axios"
import NotificationPage from "./pages/NotificationPage"
import NetworkPage from "./pages/NetworkPage"
import PostPage from "./pages/PostPage"
import ProfilePage from "./pages/ProfilePage"
import NotFoundPage from "./pages/NotFoundPage"
import JobPage from "./pages/JobPage"
import CompanyInfoPage from "./pages/CompanyInfoPage"
import JobInfoPage from "./pages/JobInfoPage"

function App() {

  const { data: authUser, isLoading } = useQuery({
    queryKey: ["authUser"],
    queryFn: async () => {
      try {
        const res = await axiosInstance.get("/auth/me");
        return res.data;       
      } catch (error) {
        if (error.response && error.response.status === 401) {
          return null;
        }
        toast.error(error.response.data.message || "サーバーエラーの可能性あり。");
        return null;
      }
    }
  });

  if (isLoading) return null;

  return <Layout>

    <Routes>
      <Route path="/" element={authUser ? <HomePage /> : <Navigate to="/login" />} />
      <Route path="/signup" element={!authUser ? <SignUpPage /> : <Navigate to="/" />} />
      <Route path="/login" element={!authUser ? <LoginPage /> : <Navigate to="/" />} />
      <Route path="/notifications" element={authUser ? <NotificationPage /> : <Navigate to="/login" />} />
      <Route path="/network" element={authUser ? <NetworkPage /> : <Navigate to="/login" />} />
      <Route path="/jobs" element={authUser ? <JobPage /> : <Navigate to="/login" />} />
      <Route path="/post/:postId" element={authUser ? <PostPage /> : <Navigate to="/login" />} />
      <Route path="/profile/:username" element={authUser ? <ProfilePage /> : <Navigate to="/login" />} />
      <Route path="/company-info" element={authUser ? <CompanyInfoPage /> : <Navigate to="/login" />} />
      <Route path="/job-posting" element={authUser ? <JobInfoPage /> : <Navigate to="/login" />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
    <Toaster />
  </Layout>
}

export default App
