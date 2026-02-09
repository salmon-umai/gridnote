//server/routes/category.js 
//カテゴリAPI

import express from "express";
import { pool } from "../db.js";
import { authMiddleware } from "../middleware/authMiddleware.js"

const router = express.Router();

//DBガード用ミドルウェア
const dbGuard = (req, res, next) => {
    if(!pool) {
        return res.status(503).json({
        message: "[GRIDNOTE] [DB_DISABLED] DB is disabled in demo mode"
    });
}
    next();
};

//カテゴリ一覧取得(ログインユーザーの分だけとる)
router.get("/", authMiddleware, dbGuard, async (req, res) => {
    const userId = req.user_id;//JWＴから自動取得

    try {
        const sql = `
            SELECT * FROM category 
                WHERE user_id = ? 
                ORDER BY cate_id ASC
        `;
        const [rows] = await pool.query(sql, [userId]);
        res.json(rows);

    } catch(err) {
        console.error("カテゴリ取得エラー：", err);
        res.status(500).json({ error: "DB取得エラー"});
    }
});

//カテゴリ追加　POST
router.post("/", authMiddleware, dbGuard, async(req, res) => {
    const userId = req.user_id;
    const { cate_name, bg_color, font_color } = req.body;

    try {
        const sql =`
            INSERT INTO category (
            user_id
            ,cate_name
            ,bg_color
            ,font_color
            ,sort_type
            )
            VALUES (?, ?, ?, ?, 'created_desc')
            `;

            const [result] = await pool.query(sql,[
                userId
                ,cate_name
                ,bg_color
                ,font_color
            ]);

            //追加したカテゴリを返す（フロント用）
            res.json({
                cate_id: result.insertId
                ,cate_name
                ,bg_color
                ,font_color
                ,sort_type: "created_desc"
            });
    } catch(err) {
        console.error("カテゴリ追加エラー:", err);
        res.status(500).json({ error:"カテゴリ追加に失敗しました"});
    }
});

//カテゴリごとに並び替えを覚える PUT
router.put("/sort", authMiddleware, dbGuard, async (req, res) => {
    const userId = req.user_id;
    const { cate_id, sort_type } = req.body;

    try {
        const sql = `
            UPDATE category
            SET sort_type = ?
            WHERE cate_id = ? AND user_id = ?
        `;

        await pool.query(sql, [sort_type, cate_id, userId]);
        res.json({ success: true });

    }catch(err) {
        console.error("並び替え更新エラー:", err);
        res.status(500).json({ error:"並び替え更新に失敗しました"}); 
    }
});

//カテゴリ更新　PUT
//カテゴリIDが変わるので可変パス⇒PUTのなかでも後ろに置く
router.put("/:cate_id", authMiddleware, dbGuard, async(req, res) => {
    const userId = req.user_id;
    const { cate_id } = req.params;
    const { cate_name, bg_color, font_color } = req.body;

    try {
        const sql = `
            UPDATE category
            SET
                cate_name = ?
                ,bg_color = ?
                ,font_color = ?
            WHERE cate_id = ? AND user_id = ?
        `;

        const [result] = await pool.query(sql,[
            cate_name
            ,bg_color
            ,font_color
            ,cate_id
            ,userId
        ]);

        res.json({ update: result.affectedRows });

    }catch(err) {
        console.error("カテゴリ更新エラー:", err);
        res.status(500).json({ error:"カテゴリ更新に失敗しました"});
    }
});



//削除処理　DELETE　/api/category/:id
router.delete("/:id", authMiddleware, dbGuard, async (req, res) => {
    const userId = req.user_id;
    const { id } = req.params;

    try {
        const sql =`
            DELETE FROM category
            WHERE cate_id = ? AND user_id = ?
            `;
        const[result] = await pool.query(sql, [id, userId]);

        res.json({ message: "カテゴリ削除OK"});
    } catch(err) {
        console.error("削除エラー",err);
        res.status(500).json({ error: "削除に失敗" });

    }
});

export default router;
