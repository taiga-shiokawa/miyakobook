// scripts/generate-sitemap.js
import { MongoClient } from 'mongodb';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// MongoDB接続情報
const MONGODB_URI = 'mongodb+srv://taigahr12:D673nMfweaJFvdZO@cluster0.kovtn.mongodb.net/business_sns_db?retryWrites=true&w=majority&appName=Cluster0';
const DB_NAME = 'business_sns_db';

async function generateSitemap() {
  let client;
  try {
    // MongoDBに接続
    client = await MongoClient.connect(MONGODB_URI);
    const db = client.db(DB_NAME);
    
    // ニュース記事を取得
    const news = await db.collection('news').find({}).toArray();

    // XMLヘッダー
    let sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <!-- トップページ -->
  <url>
    <loc>https://miyakobook.com</loc>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  <!-- ニュース一覧ページ -->
  <url>
    <loc>https://miyakobook.com/news</loc>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>`;

    // ニュース記事のURLを追加
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

    // XMLフッター
    sitemap += '\n</urlset>';

    // publicディレクトリにsitemap.xmlを書き出し
    const publicPath = path.join(__dirname, '..', 'frontend', 'public');
    if (!fs.existsSync(publicPath)) {
      fs.mkdirSync(publicPath, { recursive: true });
    }

    fs.writeFileSync(path.join(publicPath, 'sitemap.xml'), sitemap);
    console.log('サイトマップが正常に生成されました！');

  } catch (error) {
    console.error('サイトマップ生成エラー:', error);
  } finally {
    if (client) {
      await client.close();
    }
  }
}

generateSitemap();