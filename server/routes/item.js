//server/routes/item.js 
//項目API

import express from "express";
import { pool } from "../db.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

console.log("item.js 読み込まれた");

//DBガード用ミドルウェア
const dbGuard = (req, res, next) => {
    if(!pool) {
        return res.status(503).json({
        message: "[GRIDNOTE] [DB_DISABLED] DB is disabled in demo mode"
    });
}
    next();
}

// カテゴリごとの項目一覧取得　GET
//カテゴリをクリックしたら、そのカテゴリに属するアイテム一覧を
// MySQL から取ってくるための API
router.get("/", authMiddleware, dbGuard, async (req, res) => {
    const userId = req.user_id;
    const cateId = req.query.cate_id;
    //query：検索条件・フィルタにつかうとき
    //req.query 条件指定
    const sortType = req.query.sort_type || "created_desc";
    //指定がなければ新しい順

    //orderByをSwitchする
    let orderBy = "item.created_at DESC";

    switch (sortType) {
        case "updated_desc":
                orderBy = "item.updated_at DESC";
            break;
        case "priority_desc":
            orderBy = "item.priority DESC";
            break;
        case "priority_asc":
            orderBy = "item.priority ASC"
            break;
    }

    try {
        const sql = `
            SELECT 
                item.item_id
                ,item.cate_id
                ,item.title
                ,item.memo
                ,item.priority
                ,DATE_FORMAT(item.deadline,'%Y-%m-%d') AS deadline
                ,item.url
                ,item.price
                ,item.is_done
                ,item.is_deleted
                ,item.created_at
                ,item.updated_at
            FROM item
            JOIN category ON item.cate_id = category.cate_id
            WHERE category.user_id = ?
                AND item.cate_id = ?
                AND item.is_deleted = 0
            ORDER BY ${orderBy}
`;
        //AND is_deleted = 0 削除済みデータが出てこなくなる
        const[rows] = await pool.query(sql,[userId,cateId]);
        //userId,cateId：SQLの順番に合わせる

        res.json(rows);

    } catch(err) {
        console.error("カテゴリ取得エラー：", err);
        res.status(500).json({ error: "DB取得エラー"});
    }
});

//項目追加のAPI POST/api/item
router.post("/", authMiddleware, dbGuard, async(req, res) => {
    const {
        cate_id
        ,title
        ,memo
        ,priority
        ,deadline
        ,url
        ,price
    } = req.body;

    try {
        const sql = `
            INSERT INTO item
                (cate_id
                ,title
                ,memo
                ,priority
                ,deadline
                ,url
                ,price)
            VALUES ( ?, ?, ?, ?, ?, ?, ?)
        `; 

            const [result] = await pool.query(sql,[
                cate_id
                ,title
                ,memo
                ,priority
                ,deadline
                ,url
                ,price
            ]);

            res.json({ item_id: result.insertId});
    } catch(err) {
        console.error("項目追加エラー",err);
        res.status(500).json({ error:"項目追加に失敗"});
    }
});

//削除API　POST
// （論理削除：表示されなくなるだけでDBには残る）
router.post("/delete",  authMiddleware, dbGuard, async(req, res) => {
    console.log("delete api 送られてきた情報 item_ids:");
    
    const userId = req.user_id;
    const { item_ids } = req.body;

    if(!Array.isArray(item_ids) || item_ids.length === 0) {
        return res.status(400).json({ error: "item_idsが不正"});
    }

    try {
        const sql = `
            UPDATE item
            JOIN category ON item.cate_id = category.cate_id
            SET item.is_deleted = 1
            WHERE item.item_id IN (?) AND category.user_id = ?
        `;

        const [result] = await pool.query(sql, [item_ids, userId]);
        console.log("MySQL result(結果):", result);

        res.json({ deleted: result.affectedRows});
        //result.affectedRows:SQL が影響を与えた行数
        // 〇件削除したとクライアントに伝える
    } catch(err) {
        console.error("削除エラー",err);
        res.status(500).json({ error:"項目削除に失敗"});
    }
});

//UNDO(削除取り消し)API
router.post("/undo", authMiddleware, dbGuard, async(req, res) => {
    const userId = req.user_id;
    const { item_ids } = req.body;

    if(!Array.isArray(item_ids) || item_ids.length === 0) {
        return res.status(400).json({ error: "item_idsが不正"});
    }

    try {
        const sql = `
            UPDATE item
            JOIN category ON item.cate_id = category.cate_id
            SET item.is_deleted = 0
            WHERE item.item_id IN (?) AND category.user_id = ?
        `;

        const [result] = await pool.query(sql, [item_ids, userId]);

        res.json({ restored: result.affectedRows});
        //restored:復元した件数 呼び方は自由
    } catch(err) {
        console.error("削除エラー",err);
        res.status(500).json({ error:"項目削除に失敗"});
    }
});

//完了済みAPI PUT
router.put("/:item_id/done", authMiddleware, dbGuard, async (req, res) => {
    const userId = req.user_id;
    const itemId = req.params.item_id;
    const { is_done } = req.body;

    try {
        const sql = `
            UPDATE item
            JOIN category ON item.cate_id = category.cate_id
            SET item.is_done = ?
            WHERE item.item_id = ?
            AND category.user_id = ?
        `;

        const [result] = await pool.query(sql, [
            is_done ? 1 : 0,
            itemId,
            userId
        ]);
        
        res.json({ updated: result.affectedRows });
    } catch (err) {
        console.error("完了済更新エラー", err);
        res.status(500).json({ error: "完了済更新に失敗 "});
    }
});

//編集 更新API　PUT /api/item/:item_id
///api/item/3 に PUT でデータを投げると、item_id=3 の行が更新される。
router.put("/:item_id", authMiddleware, dbGuard, async(req, res) => {
    const userId = req.user_id;
    const itemId = req.params.item_id;
    //params:データ１件を特定するとき
    //req.params 個体識別

    const {
        title
        ,memo
        ,priority
        ,deadline
        ,url
        ,price
    } = req.body;

    try {
        const sql = `
            UPDATE item
            JOIN category ON item.cate_id = category.cate_id
            SET
                item.title = ?
                ,item.memo = ?
                ,item.priority = ?
                ,item.deadline = ?
                ,item.url = ?
                ,item.price = ?
                ,item.updated_at = CURRENT_TIMESTAMP
            WHERE item.item_id = ? AND category.user_id = ?
        `;

        const [result] = await pool.query(sql,[
                title
                ,memo
                ,priority
                ,deadline
                ,url
                ,price
                ,itemId
                ,userId          
        ]);

        //何件更新されたかだけを返す
        res.json({ updated: result.affectedRows });
    } catch(err) {
        console.error("項目更新エラー",err);
        res.status(500).json({ error:"項目更新に失敗"});
    }
});

export default router;