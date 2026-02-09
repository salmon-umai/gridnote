import dotenv from 'dotenv';
dotenv.config();

import mysql from 'mysql2/promise';

let pool;

if(process.env.NODE_ENV !== 'production') {
    pool = mysql.createPool({
    host:process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
});

    console.log("[GRIDNOTE] DB connected (local):", process.env.DB_NAME)
} else {
    console.log("[GRIDNOTE] DB disabled in production");
}

export { pool };