import { Card, CardContent } from "../components/Card";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";
import { Newspaper, Loader } from "lucide-react";
import { Link } from "react-router-dom";
import NewsCard from "../components/NewsCard";
import { Helmet } from "react-helmet-async";

const NewsPage = () => {
  const queryClient = useQueryClient();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [tagInput, setTagInput] = useState("");
  const [tags, setTags] = useState([]);

  const { data: authUser, isLoading: isLoadingAuth } = useQuery({
    queryKey: ["authUser"],
  });

  // ニュース一覧の取得
  const { data: newsData, isLoading: isLoadingNews } = useQuery({
    queryKey: ["news"],
    queryFn: async () => {
      const response = await axiosInstance.get("/news");
      return response.data;
    },
  });

  // ニュース投稿のミューテーション
  const { mutate: createNews, isLoading: isCreatingNews } = useMutation({
    mutationFn: async (newsData) => {
      const response = await axiosInstance.post("/news/create", newsData, {
        headers: {
          "Content-Type": "application/json",
        },
      });
      return response.data;
    },
    onSuccess: () => {
      // キャッシュの更新
      queryClient.invalidateQueries(["news"]);
      // フォームのリセット
      setTitle("");
      setContent("");
      setImage(null);
      setImagePreview(null);
      setTags([]);
      setTagInput("");
      toast.success("ニュースを投稿しました");
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "投稿に失敗しました");
    },
  });

  const isAdmin = authUser?.userType === "admin";
  const isLoading = isLoadingAuth || isLoadingNews;

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      const reader = new FileReader();
      reader.onload = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      let imageData = null;
      if (image) {
        imageData = await readFileAsDataURL(image);
      }
  
      const newsData = {
        title,
        content,
        tags,
        image: imageData
      };
  
      createNews(newsData);
    } catch (error) {
      console.error("ニュース投稿エラー:", error);
      toast.error("投稿に失敗しました");
    }
  };

  const readFileAsDataURL = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader className="animate-spin h-8 w-8 text-primary" />
      </div>
    );
  }

  return (
    <>
   <Helmet>
        {/* 一覧ページ用のメタデータ */}
        <title>ニュース一覧 - Miyakobook</title>
        <meta 
          name="description" 
          content="Miyakobookの最新ニュース一覧です。新着情報やお知らせをご覧いただけます。" 
        />
        
        {/* OGP タグ */}
        <meta 
          property="og:title" 
          content="ニュース一覧 - Miyakobook" 
        />
        <meta 
          property="og:description" 
          content="Miyakobookの最新ニュース一覧です。新着情報やお知らせをご覧いただけます。" 
        />
        <meta property="og:type" content="website" /> {/* articleからwebsiteに変更 */}
        <meta 
          property="og:url" 
          content="https://miyakobook.com/news" 
        />
        <meta 
          property="og:image" 
          content="https://miyakobook.com/default-ogp.jpg" 
        />
        
        {/* Twitter Card タグ */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta 
          name="twitter:title" 
          content="ニュース一覧 - Miyakobook" 
        />
        <meta 
          name="twitter:description" 
          content="Miyakobookの最新ニュース一覧です。新着情報やお知らせをご覧いただけます。" 
        />
        <meta 
          name="twitter:image" 
          content="https://miyakobook.com/default-ogp.jpg" 
        />

        {/* 一覧ページ用の構造化データ */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "CollectionPage",
            "headline": "ニュース一覧 - Miyakobook",
            "description": "Miyakobookの最新ニュース一覧です。新着情報やお知らせをご覧いただけます。",
            "publisher": {
              "@type": "Organization",
              "name": "Miyakobook",
              "logo": {
                "@type": "ImageObject",
                "url": "https://miyakobook.com/logo.png"
              }
            },
            "mainEntityOfPage": {
              "@type": "WebPage",
              "@id": "https://miyakobook.com/news"
            }
          })}
        </script>
      </Helmet>
    <div className="p-6 max-w-7xl mx-auto">
      <div
        className={`grid grid-cols-1 ${
          isAdmin ? "lg:grid-cols-3" : "lg:grid-cols-1"
        } gap-6`}
      >
        {/* ニュース一覧セクション */}
        <div className={isAdmin ? "lg:col-span-2" : "max-w-4xl mx-auto w-full"}>
          <h1 className="text-2xl font-bold mb-6">新着</h1>

          {isLoadingNews ? (
            <div className="flex justify-center items-center h-64">
              <Loader className="animate-spin h-8 w-8 text-primary" />
            </div>
          ) : newsData?.news?.length > 0 ? (
            <div className="space-y-6">
              {newsData.news.map((news) => (
                <Link key={news._id} to={`/news/${news._id}`}>
                  <NewsCard news={news} />
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-white rounded-lg shadow">
              <Newspaper className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">
                ニュースがありません
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                新しいニュースが投稿されるまでお待ちください。
              </p>
            </div>
          )}
        </div>

        {/* 管理者用投稿フォーム */}
        {isAdmin && (
          <div className="lg:col-span-1">
            <Card className="bg-white sticky top-6">
              <CardContent>
                <h2 className="text-xl font-bold my-4 mb-4">ニュース投稿</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      タイトル
                    </label>
                    <input
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      内容
                    </label>
                    <textarea
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      className="w-full p-2 border rounded-lg h-32 resize-none focus:outline-none focus:ring-2 focus:ring-primary"
                      required
                    />
                  </div>

                  {/* タグセクション */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      タグ
                    </label>
                    <div className="flex items-center space-x-2">
                      <input
                        type="text"
                        value={tagInput}
                        onChange={(e) => setTagInput(e.target.value)}
                        onKeyPress={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            if (tagInput.trim()) {
                              setTags([...tags, tagInput.trim()]);
                              setTagInput("");
                            }
                          }
                        }}
                        placeholder="Enterで追加"
                        className="flex-1 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          if (tagInput.trim()) {
                            setTags([...tags, tagInput.trim()]);
                            setTagInput("");
                          }
                        }}
                        className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                      >
                        追加
                      </button>
                    </div>
                    {/* タグ表示エリア */}
                    <div className="flex flex-wrap gap-2 mt-2">
                      {tags.map((tag, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium bg-blue-100 text-blue-800"
                        >
                          {tag}
                          <button
                            type="button"
                            onClick={() => {
                              setTags(tags.filter((_, i) => i !== index));
                            }}
                            className="ml-1 text-blue-800 hover:text-blue-900 focus:outline-none"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      画像
                    </label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="w-full p-2 border rounded-lg"
                    />
                    {imagePreview && (
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="mt-2 rounded-lg max-h-40 w-full object-cover"
                      />
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={isCreatingNews}
                    className="w-full bg-primary text-white p-2 rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-50"
                  >
                    {isCreatingNews ? (
                      <Loader className="animate-spin h-5 w-5 mx-auto" />
                    ) : (
                      "投稿する"
                    )}
                  </button>
                </form>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
    </>
  );
};

export default NewsPage;
