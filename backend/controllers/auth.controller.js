import User from "../models/user.model.js";
import { sendWelcomeEmail } from "../emails/emailHandlers.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

// キャッシュの導入（ファイルの先頭に追加）
const authCache = new Map();

// アカウント作成 
export const signup = async (req, res) => {
  try {
    const { name, username, email, password } = req.body;

    if (!name || !username || !email || !password) {
      return res.status(400).json( { message: "すべてのフィールドを入力してください。"} );
    }

    const existingEmail = await User.findOne({ email });
    if (existingEmail) {
      return res.status(400).json( { message: "このメールアドレスはすでに登録されています。"} );
    }

    const existingUsername = await User.findOne({ username });
    if (existingUsername) {
      return res.status(400).json( { message: "このユーザー名はすでに登録されています。"} );
    }

    if (password.length < 6) {
      return res.status(400).json( { message: "パスワードは6文字以上にしてください。"} );
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      username
    });
    await newUser.save();
    
    const token = jwt.sign({ 
      userId: newUser._id
    }, 
    process.env.JWT_SECRET, {
      expiresIn: "3d"
    });
    
    res.cookie("jwt-business-sns-token", token, {
      httpOnly: true, // XSS攻撃対策
      maxAge: 3 * 24 * 60 * 60 * 1000,
      sameSite: "strict", // CSRF対策
      secure: process.env.NODE_ENV === "production",
    });

    res.status(201).json({ message: "アカウントを作成しました。"});

    // Welcomeメール送信
    const profileUrl = process.env.CLIENT_URL + "/profile/" + newUser.username;
    try {
      await sendWelcomeEmail(newUser.email, newUser.name, profileUrl);
    } catch (emailError) {
      console.error("Welcomeメールの送信に失敗しました。", emailError);
    }

  } catch (error) {
    console.log("ユーザーの作成に失敗しました。", error.message); 
    res.status(500).json({ message: "ユーザーの作成に失敗しました。"});
  }
};

// ログイン
export const login = async (req, res) => {
  try {
    const { username, password } = req.body;

    // キャッシュをチェック
    if (authCache.has(username)) {
      const cachedToken = authCache.get(username);
      res.cookie("jwt-business-sns-token", cachedToken, {
        httpOnly: true,
        maxAge: 3 * 24 * 60 * 60 * 1000,
        sameSite: "strict",
        secure: process.env.NODE_ENV === "production",
      });
      return res.json({ message: "ログインに成功しました。" });
    }

    // ユーザーの存在確認
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(401).json({ 
        message: "ユーザー名またはパスワードに誤りがあります。"
      });
    }

    // パスワードの照合
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ 
        message: "ユーザー名またはパスワードに誤りがあります。"
      });
    }

    // トークンを作成して送信
    const token = jwt.sign({ 
      userId: user._id
    }, 
    process.env.JWT_SECRET, {
      expiresIn: "3d"
    });

    // トークンをキャッシュに保存
    authCache.set(username, token);

    res.cookie("jwt-business-sns-token", token, {
      httpOnly: true,
      maxAge: 3 * 24 * 60 * 60 * 1000,
      sameSite: "strict",
      secure: process.env.NODE_ENV === "production",
    });

    res.json({ message: "ログインに成功しました。" });
  } catch (error) {
    console.error("ログインに失敗しました。", error);
    res.status(500).json({ message: "サーバーエラーの可能性あり。"});
  }
};

// ログアウト
export const logout = (req, res) => {
  const username = req.user?.username;
  if (username) {
    authCache.delete(username);
  }
  res.clearCookie("jwt-business-sns-token");
  res.json({ message: "ログアウトしました。"});
};

export const getCurrentUser = async (req, res) => {
  try {
    res.json(req.user);
  } catch (error) {
    console.error("ユーザーの取得に失敗しました: ", error);
    re.status(500).json({ message: "サーバーエラーの可能性あり。"});
  }
};

// パスワードを忘れた場合