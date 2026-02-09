//server/middleware/authMiddleware.js

import jwt from "jsonwebtoken";

export function authMiddleware(req, res, next) {
    const header = req.headers.authorization;

    if(!header) {
        return res.status(401).json({ error: "トークンがありません"});
    }

    const token = header.split(" ")[1];//Bearer xxxのxxx

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        req.user_id = decoded.user_id;

        next();
    } catch(err) {
        return res.status(401).json({ error: "トークンが不正 または 期限切れ"});
    }
}