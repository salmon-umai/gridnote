import express from "express";
import { pool } from "../db.js";
import { authMiddleware } from "../middleware/authMiddleware.js"

const router = express.Router();

console.log("calendar.js 読み込まれた");

//DBガード用ミドルウェア
const dbGuard = (req, res, next) => {
    if(!pool) {
        return res.status(503).json({
        message: "[GRIDNOTE] [DB_DISABLED] DB is disabled in demo mode"
    });
}
    next();
};

//カレンダーに渡す
router.get("/", authMiddleware, dbGuard, async (req, res) => {
    const userId = req.user_id;//JWＴから自動取得

    try {
        const sql = `
            SELECT 
                item.title,
                DATE_FORMAT(item.deadline, '%Y-%m-%d') AS deadline,
                item.cate_id,
                category.bg_color,
                category.font_color
            FROM item
            JOIN category
                ON item.cate_id = category.cate_id
            WHERE
                category.user_id = ?
                AND item.deadline IS NOT NULL
                AND item.is_deleted = 0
            ORDER BY item.deadline ASC
            `;
        //category.user_id = ? ⇒ログインユーザーのカテゴリーに属する項目のみ取得
        //AND item.deadline IS NOT NULL ⇒日付が設定されている項目のみ取得
        //AND item.is_deleted = 0 ⇒削除されていないitemだけ取得
        const [rows] = await pool.query(sql, [userId]);
        res.json(rows);

    } catch(err) {
        console.error("カレンダーデータ取得エラー：", err);
        res.status(500).json({ error: "カレンダーデータ取得失敗"});
    }
});

export default router;
