//server/routes/auth.js 
//bcrypt でパスワードハッシュ照合して、JWT を返す
//ログインAPI

import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { pool } from "../db.js";

const router = express.Router();

//ログイン
router.post("/login", async (req, res) => {
    const { username, password } = req.body;

    try {
        //ユーザー検査
        const [rows] = await pool.query(
            "SELECT * FROM `user` WHERE user_name = ?",
            [username]
    );
     if(rows.length === 0) {
        return res.status(401).json({ error: "ユーザーが存在しません"});
    }

    const user = rows[0];

    //パスワードの照合
    const ok = await bcrypt.compare(password, user.password_hash);
    if (!ok) {
        return res.status(401).json({ error:"パスワードが違います"})
    }

    //JWT発行
    const token = jwt.sign(
        { user_id: user.user_id },
        process.env.JWT_SECRET,
        { expiresIn: "24h"}
    );

    res.json({ token });
    
    } catch(err) {
        console.error(err);
        res.status(500).json({error:"ログイン処理エラー"})
    }

});

//認証ミドルウェア
/*
export function authMiddleware(req, res, next) {
    const header = req.headers.authorization;

    if(!header) {
        return res.status(401).json({ error: "トークンがありません" });
    }

    const token = header.split(" ")[1];

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user_id = decoded.user_id;
        next();
    } catch(err) {
        console.error(err);
        res.status(401).json({error:"トークンが不正or期限切れ"})
    }
}
*/
export default router;