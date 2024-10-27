import { Resend } from 'resend';
import dotenv from 'dotenv';
import { createWelcomeEmailTemplate, createCommentNotificationEmailTemplate, createConnectionAcceptedEmailTemplate, createResetPasswordEmailTemplate } from './emailTemplates.js';


dotenv.config();

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const IS_TEST = process.env.NODE_ENV === 'test';

export const resend = new Resend(RESEND_API_KEY);

// テスト環境用の送信元アドレス
const TEST_SENDER = {
  email: 'onboarding@resend.dev',
  name: 'Miyakobook Test'
};

// 本番環境用の送信元アドレス
const PROD_SENDER = {
  email: process.env.EMAIL_FROM,
  name: process.env.EMAIL_FROM_NAME
};

// 環境に応じて送信元を切り替え
export const sender = IS_TEST ? TEST_SENDER : PROD_SENDER;

// テスト環境用のメールアドレスに変換する関数
const getTestEmailAddress = (originalEmail) => {
  return IS_TEST ? 'delivered@resend.dev' : originalEmail;
};

export const sendResetPasswordEmail = async (email, name, resetPasswordUrl) => {
  try {
    const response = await resend.emails.send({
      from: `${sender.name} <${sender.email}>`,
      to: [email],
      subject: "【Miyakobook】アカウント設定のお知らせ",
      html: createResetPasswordEmailTemplate(name, resetPasswordUrl),
      tags: [{ name: 'category', value: 'password_reset' }]
    });

    console.log('Raw Resend Response:', response);

    if (!response?.data?.id) {  // response.data.id をチェック
      throw new Error('Failed to get email ID from Resend');
    }

    // 成功のログ
    console.log('Email sent successfully:', {
      id: response.data.id,
      to: email
    });

    return response;
  } catch (error) {
    console.error('Email Send Error:', {
      message: error.message,
      name: error.name,
      statusCode: error?.statusCode,
      details: error?.response?.data
    });
    throw error;
  }
};

export const sendWelcomeEmail = async (email, name, profileUrl) => {
  try {
    const response = await resend.emails.send({
      from: `${sender.name} <${sender.email}>`,
      to: [getTestEmailAddress(email)],
      subject: "Miyakobookへようこそ！",
      html: createWelcomeEmailTemplate(name, profileUrl),
      tags: [{ name: 'category', value: 'Welcome' }]
    });

    console.log(`Welcome email sent successfully ${IS_TEST ? '(TEST MODE)' : ''}`);
    return response;
  } catch (error) {
    console.error("Failed to send welcome email:", error);
    throw error;
  }
};

export const sendCommentNotificationEmail = async (
  recipientEmail,
  recipientName,
  commenterName,
  postUrl,
  commentContent
) => {
  try {
    const response = await resend.emails.send({
      from: `${sender.name} <${sender.email}>`,
      to: [getTestEmailAddress(recipientEmail)],
      subject: "あなたの投稿にコメントがつきました",
      html: createCommentNotificationEmailTemplate(
        recipientName,
        commenterName,
        postUrl,
        commentContent
      ),
      tags: [{ name: 'category', value: 'comment_notification' }]
    });

    console.log(`コメント通知をメールに送信しました ${IS_TEST ? '(TEST MODE)' : ''}`);
    return response;
  } catch (error) {
    console.error("Failed to send comment notification email:", error);
    throw error;
  }
};

export const sendConnectionAcceptedEmail = async (
  senderEmail,
  senderName,
  recipientName,
  profileUrl
) => {
  try {
    const response = await resend.emails.send({
      from: `${sender.name} <${sender.email}>`,
      to: [getTestEmailAddress(senderEmail)],
      subject: `${recipientName} があなたのコネクションリクエストを受け入れました`,
      html: createConnectionAcceptedEmailTemplate(
        senderName,
        recipientName,
        profileUrl
      ),
      tags: [{ name: 'category', value: 'connection_accepted' }]
    });

    console.log(`コネクション承認メールを送信しました ${IS_TEST ? '(TEST MODE)' : ''}`);
    return response;
  } catch (error) {
    console.error("Failed to send connection accepted email:", error);
    throw error;
  }
};