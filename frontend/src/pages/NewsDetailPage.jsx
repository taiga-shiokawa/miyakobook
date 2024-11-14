import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useParams, useNavigate } from "react-router-dom";
import { axiosInstance } from "../lib/axios";
import { useEffect, useState } from "react";
import { ArrowLeft, Edit, Loader } from "lucide-react";
import { Helmet } from "react-helmet-async";

const NewsDetailPage = () => {
  const { newsId } = useParams();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [hasIncrementedView, setHasIncrementedView] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedNews, setEditedNews] = useState(null);

  // ユーザー情報を取得
  const { data: authUser } = useQuery({
    queryKey: ["authUser"],
    queryFn: async () => {
      const response = await axiosInstance.get("/auth/me");
      console.log("User response:", response.data);
      return response.data;
    },
  });

  // ニュース更新のミューテーション
  const updateNewsMutation = useMutation({
    mutationFn: async (updatedData) => {
      const response = await axiosInstance.put(
        `/news/edit/${newsId}`,
        updatedData
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["news", newsId]);
      setIsEditing(false);
    },
  });

  // ニュース詳細を取得
  const { data: news, isLoading } = useQuery({
    queryKey: ["news", newsId],
    queryFn: async () => {
      const response = await axiosInstance.get(`/news/${newsId}`);
      return response.data;
    },
    onSuccess: (data) => {
      if (!editedNews) {
        setEditedNews(data);
      }
    },
  });

  useEffect(() => {
    if (news) {
      setEditedNews(news);
    }
  }, [news]);

  // 閲覧数を更新
  const incrementViews = async () => {
    try {
      const viewKey = `news_view_${newsId}`;
      const lastViewTime = localStorage.getItem(viewKey);
      const now = Date.now();

      // ローカルストレージのチェック (追加の制御層として)
      if (!lastViewTime || now - parseInt(lastViewTime) > 24 * 60 * 60 * 1000) {
        const response = await axiosInstance.post(
          `/news/${newsId}/increment-views`,
          {},
          {
            withCredentials: true, // 認証情報を送信
          }
        );

        if (response.data.updated) {
          localStorage.setItem(viewKey, now.toString());
          queryClient.invalidateQueries(["news", newsId]);
          queryClient.invalidateQueries(["news"]); // リスト表示も更新
        }
      }
    } catch (error) {
      console.error("View increment error:", error);
    }
  };

  // localStorageから閲覧履歴をチェック
  useEffect(() => {
    if (newsId && !hasIncrementedView) {
      incrementViews();
      setHasIncrementedView(true);
    }
  }, [newsId, hasIncrementedView, authUser]);

  // 記事の本文から最初の160文字を抽出してメタ説明文として使用
  const getMetaDescription = (content) => {
    return content
      ?.replace(/\n/g, ' ')  // 改行を空白に変換
      ?.substring(0, 160)
      ?.trim() || '';
  };

  // キーワードを抽出（タグと記事内の重要な単語を組み合わせる）
  const getKeywords = (news) => {
    const baseKeywords = ['Miyakobook', 'みやこぶっく', '宮古島'];
    const tagKeywords = news?.tags || [];
    const titleKeywords = news?.title?.split(/[\s,、。　]+/) || [];
    return [...new Set([...baseKeywords, ...tagKeywords, ...titleKeywords])].join(', ');
  };

  // 投稿日時のフォーマット
  const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toISOString();
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader className="animate-spin h-8 w-8 text-primary" />
      </div>
    );
  }

  if (!news) {
    return (
      
      <div className="max-w-4xl mx-auto p-6">
        <Helmet>
          <title>記事が見つかりません - Miyakobook</title>
          <meta name="robots" content="noindex, nofollow" />
        </Helmet>
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-gray-900">
            ニュースが見つかりません
          </h2>
          <p className="mt-2 text-gray-600">
            お探しのニュースは削除されたか、存在しない可能性があります。
          </p>
          <button
            onClick={() => navigate("/news")}
            className="mt-4 inline-flex items-center text-primary hover:underline"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            ニュース一覧に戻る
          </button>
        </div>
      </div>
    );
  }

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSave = async () => {
    try {
      await updateNewsMutation.mutateAsync(editedNews);
      setIsEditing(false);
    } catch (error) {
      console.error("Update error:", error);
    }
  };

  const handleCancel = () => {
    setEditedNews(news);
    setIsEditing(false);
  };

  // OGP用の画像URLを取得する関数
  const getOgImage = (news) => {
    if (!news) return "https://miyakobook.com/default-ogp.jpg";
    
    // 記事に画像がある場合はその画像を使用
    if (news.image) {
      // Cloudinaryの画像を最適化
      return news.image.replace('/upload/', '/upload/w_1200,h_630,c_fill,g_center/');
    }
    
    return "https://miyakobook.com/default-ogp.jpg";
  };

  const metaDescription = getMetaDescription(news.content);
  const keywords = getKeywords(news);
  const publishDate = formatDate(news.createdAt);
  const modifyDate = formatDate(news.updatedAt);
  const pageUrl = `https://miyakobook.com/news/${newsId}`;
  return (
    <>
    <Helmet>
        {/* 基本的なメタタグ */}
        <title>{`${news.title} | Miyakobookの新着ニュース`}</title>
        <meta name="description" content={metaDescription} />
        <meta name="keywords" content={keywords} />
        <link rel="canonical" href={pageUrl} />
        <meta name="author" content={news.author?.name || "Miyakobook"} />
        <meta name="robots" content="index, follow, max-image-preview:large" />

        {/* OGP タグ */}
        <meta property="og:site_name" content="Miyakobook（みやこぶっく）" />
        <meta property="og:title" content={`${news.title} | Miyakobook（みやこぶっく）`} />
        <meta property="og:description" content={metaDescription} />
        <meta property="og:type" content="article" />
        <meta property="og:url" content={pageUrl} />
        <meta property="og:image" content={getOgImage(news)} />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:image:alt" content={news.title} /><meta property="og:locale" content="ja_JP" />
        <meta property="article:published_time" content={publishDate} />
        <meta property="article:modified_time" content={modifyDate} />
        {news.tags?.map(tag => (
          <meta property="article:tag" content={tag} key={tag} />
        ))}

        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={`${news.title} | Miyakobook（みやこぶっく）`} />
        <meta name="twitter:description" content={metaDescription} />
        <meta name="twitter:image" content={getOgImage(news)} />
        <meta name="twitter:image:alt" content={news.title} />

        {/* 構造化データ - Article */}
        <script type="application/ld+json">
        {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "NewsArticle",
            // ... 他の属性は同じ
            "image": {
              "@type": "ImageObject",
              "url": getOgImage(news),
              "width": 1200,
              "height": 630
            },
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
              "@id": pageUrl
            },
            "keywords": keywords,
            "articleSection": "News",
            "inLanguage": "ja",
            "isAccessibleForFree": "True",
            "interactionStatistic": {
              "@type": "InteractionCounter",
              "interactionType": "https://schema.org/ReadAction",
              "userInteractionCount": news.views || 0
            },
            "locationCreated": {
              "@type": "Place",
              "name": "宮古島"
            }
          })}
        </script>

        {/* 構造化データ - BreadcrumbList */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            "itemListElement": [
              {
                "@type": "ListItem",
                "position": 1,
                "name": "Miyakobook",
                "item": "https://miyakobook.com"
              },
              {
                "@type": "ListItem",
                "position": 2,
                "name": "ニュース",
                "item": "https://miyakobook.com/news"
              },
              {
                "@type": "ListItem",
                "position": 3,
                "name": news.title,
                "item": pageUrl
              }
            ]
          })}
        </script>
      </Helmet>
    <div className="max-w-4xl mx-auto p-6 relative">
      {/* 管理者用編集ボタン */}
      {authUser?.userType === "admin" && (
        <div className="absolute top-6 right-6 space-x-2">
          {isEditing ? (
            <>
              <button
                onClick={handleSave}
                className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90"
                disabled={updateNewsMutation.isLoading}
              >
                {updateNewsMutation.isLoading ? "保存中..." : "保存"}
              </button>
              <button
                onClick={handleCancel}
                className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600"
              >
                キャンセル
              </button>
            </>
          ) : (
            <button
              onClick={handleEdit}
              className="inline-flex items-center px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90"
            >
              <Edit className="w-4 h-4 mr-2" />
              編集
            </button>
          )}
        </div>
      )}
      {/* 戻るボタン */}
      <button
        onClick={() => navigate("/news")}
        className="mb-6 inline-flex items-center text-gray-600 hover:text-gray-900"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        ニュース一覧に戻る
      </button>

      {/* メインコンテンツ */}
      <article className="bg-white rounded-lg shadow-lg overflow-hidden">
        {/* ヘッダー画像 */}
        {news?.image && (
          <div className="w-full h-[400px] relative">
            {isEditing && editedNews ? (
              <div className="p-6">
                <input
                  type="text"
                  value={editedNews.image}
                  onChange={(e) =>
                    setEditedNews({ ...editedNews, image: e.target.value })
                  }
                  className="w-full p-2 border rounded"
                />
              </div>
            ) : (
              <img
                src={news.image}
                alt={news.title}
                className="w-full h-full object-cover"
              />
            )}
          </div>
        )}

        {/* コンテンツ */}
        <div className="p-6">
          {/* メタ情報 */}
          <div className="flex items-center space-x-4 text-sm text-gray-500 mb-4">
            <div className="flex items-center">
              <img
                src={news.author?.profilePicture || "/avatar.png"}
                alt={news.author?.name}
                className="w-6 h-6 rounded-full mr-2"
              />
              <span>{news.author?.name}</span>
            </div>
            <span>•</span>
            <span>{news.views || 0} views</span>
          </div>

          {/* タイトル */}
          {isEditing && editedNews ? (
            <div className="mb-4">
              <input
                type="text"
                value={editedNews.title}
                onChange={(e) =>
                  setEditedNews({ ...editedNews, title: e.target.value })
                }
                className="w-full text-3xl font-bold p-2 border rounded"
              />
            </div>
          ) : (
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              {news?.title}
            </h1>
          )}

          {/* タグ */}
          {news.tags && news.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-6">
              {news.tags.map((tag, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* 本文 */}
          <div className="prose max-w-none">
            {isEditing && editedNews ? (
              <div className="mb-4">
                <textarea
                  value={editedNews.content}
                  onChange={(e) =>
                    setEditedNews({ ...editedNews, content: e.target.value })
                  }
                  className="w-full h-64 p-2 border rounded"
                />
              </div>
            ) : (
              news?.content?.split("\n").map((paragraph, index) => (
                <p key={index} className="mb-4">
                  {paragraph}
                </p>
              ))
            )}
          </div>
        </div>
      </article>
    </div>
    </>
  );
};

export default NewsDetailPage;
