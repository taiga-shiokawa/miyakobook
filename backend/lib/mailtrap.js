import { Resend } from 'resend';
import dotenv from 'dotenv';

dotenv.config();

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const IS_TEST = process.env.NODE_ENV === 'test' || RESEND_API_KEY.startsWith('re_test_');

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