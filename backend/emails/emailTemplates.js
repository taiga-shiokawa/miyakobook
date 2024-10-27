export function createWelcomeEmailTemplate(name, profileUrl) {
  return `
  <!DOCTYPE html>
  <html lang="ja">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Miyakobookへようこそ</title>
  </head>
  <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
    <div style="background: linear-gradient(to right, #0077B5, #00A0DC); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
      // 画像をおく
      <h1 style="color: white; margin: 0; font-size: 28px;">Miyakobookへようこそ！</h1>
    </div>
    <div style="background-color: #ffffff; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 4px 10px rgba(0,0,0,0.1);">
      <p style="font-size: 18px; color: #0077B5;"><strong>${name}様</strong></p>
      <p>会員登録、誠にありがとうございます！Miyakobookは、あなたのキャリアにおける成長と学びをサポートするプラットフォームです。</p>
      <div style="background-color: #f3f6f8; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <p style="font-size: 16px; margin: 0;"><strong>始めるためのステップ：</strong></p>
        <ul style="padding-left: 20px;">
          <li>プロフィールを完成させる</li>
          <li>同僚や友人とつながる</li>
          <li>興味のある仕事に今すぐ飛び込む</li>
          <li>求人情報を探す</li>
        </ul>
      </div>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${profileUrl}" style="background-color: #0077B5; color: white; padding: 14px 28px; text-decoration: none; border-radius: 30px; font-weight: bold; font-size: 16px; transition: background-color 0.3s;">プロフィールを完成させる</a>
      </div>
      <p>ご不明な点やお困りのことがございましたら、サポートチームが常時対応させていただきます。</p>
      <p>よろしくお願いいたします。<br>Miyakobookチーム</p>
    </div>
  </body>
  </html>
  `;
}

export const createConnectionAcceptedEmailTemplate = (senderName, recipientName, profileUrl) => `
<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>コネクションリクエストが承認されました</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(to right, #0077B5, #00A0DC); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
    // 画像をおく
    <h1 style="color: white; margin: 0; font-size: 28px;">コネクションが承認されました！</h1>
  </div>
  <div style="background-color: #ffffff; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 4px 10px rgba(0,0,0,0.1);">
    <p style="font-size: 18px; color: #0077B5;"><strong>${senderName}様</strong></p>
    <p>朗報です！<strong>${recipientName}</strong>さんがMiyakobookでのコネクションリクエストを承認しました。</p>
    <div style="background-color: #f3f6f8; padding: 20px; border-radius: 8px; margin: 20px 0;">
      <p style="font-size: 16px; margin: 0;"><strong>次のステップ：</strong></p>
      <ul style="padding-left: 20px;">
        <li>${recipientName}さんのプロフィールを確認する</li>
        <li>メッセージを送って会話を始める</li>
        <li>共通の知り合いや興味を探る</li>
      </ul>
    </div>
    <div style="text-align: center; margin: 30px 0;">
      <a href="${profileUrl}" style="background-color: #0077B5; color: white; padding: 14px 28px; text-decoration: none; border-radius: 30px; font-weight: bold; font-size: 16px; transition: background-color 0.3s;">${recipientName}さんのプロフィールを見る</a>
    </div>
    <p>プロフェッショナルネットワークを広げることで、新たな機会が生まれます。つながり続けましょう！</p>
    <p>よろしくお願いいたします。<br>Miyakobookチーム</p>
  </div>
</body>
</html>
`;

export const createCommentNotificationEmailTemplate = (recipientName, commenterName, postUrl, commentContent) => `
<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>投稿に新しいコメントが付きました</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(to right, #0077B5, #00A0DC); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
    // 画像をおく
    <h1 style="color: white; margin: 0; font-size: 28px;">投稿に新しいコメントが付きました</h1>
  </div>
  <div style="background-color: #ffffff; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 4px 10px rgba(0,0,0,0.1);">
    <p style="font-size: 18px; color: #0077B5;"><strong>${recipientName}様</strong></p>
    <p>${commenterName}さんがあなたの投稿にコメントしました：</p>
    <div style="background-color: #f3f6f8; padding: 20px; border-radius: 8px; margin: 20px 0;">
      <p style="font-style: italic; margin: 0;">"${commentContent}"</p>
    </div>
    <div style="text-align: center; margin: 30px 0;">
      <a href=${postUrl} style="background-color: #0077B5; color: white; padding: 14px 28px; text-decoration: none; border-radius: 30px; font-weight: bold; font-size: 16px; transition: background-color 0.3s;">コメントを見る</a>
    </div>
    <p>コメントに返信し、ディスカッションを活発にすることで、企業や友人との関係を深めましょう。</p>
    <p>よろしくお願いいたします。<br>Miyakobookチーム</p>
  </div>
</body>
</html>
`;

// 修正後
export const createResetPasswordEmailTemplate = (name, resetPasswordUrl) => `
<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>パスワードリセット</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(to right, #0077B5, #00A0DC); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
    <h1 style="color: white; margin: 0; font-size: 28px;">パスワードリセット</h1>
  </div>
  <div style="background-color: #ffffff; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 4px 10px rgba(0,0,0,0.1);">
    <p style="font-size: 18px; color: #0077B5;"><strong>${name}様</strong></p>
    <p>パスワードリセットのリクエストを受け付けました。以下のボタンをクリックして、新しいパスワードを設定してください。</p>
    <p style="color: #666; font-size: 14px;">※このリンクの有効期限は10分間です。</p>
    <div style="text-align: center; margin: 30px 0;">
      <a href="${resetPasswordUrl}" style="background-color: #0077B5; color: white; padding: 14px 28px; text-decoration: none; border-radius: 30px; font-weight: bold; font-size: 16px; transition: background-color 0.3s;">パスワードを再設定する</a>
    </div>
    <p style="color: #666; font-size: 14px; margin-top: 20px;">
      ※このメールに心当たりがない場合は、無視していただいて構いません。<br>
      ※リンクの有効期限が切れた場合は、再度パスワードリセットをリクエストしてください。
    </p>
  </div>
</body>
</html>
`;