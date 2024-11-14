import fs from 'fs/promises';
import path from 'path';
import News from '../models/news.model.js';

export const generateSitemap = async () => {
  try {
    // 全ての記事を取得
    const news = await News.find({}).select('_id updatedAt createdAt');

    let sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://miyakobook.com</loc>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>https://miyakobook.com/news</loc>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>`;

    // 記事のURLを追加
    for (const article of news) {
      const lastmod = article.updatedAt || article.createdAt;
      sitemap += `
  <url>
    <loc>https://miyakobook.com/news/${article._id}</loc>
    <lastmod>${new Date(lastmod).toISOString()}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>`;
    }

    sitemap += '\n</urlset>';

    // サイトマップを保存
    const publicPath = path.join(process.cwd(), 'frontend', 'public');
    await fs.writeFile(path.join(publicPath, 'sitemap.xml'), sitemap);

  } catch (error) {
    console.error('サイトマップ生成エラー:', error);
  }
};