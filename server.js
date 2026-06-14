const express = require('express');
const cors = require('cors');
const mysql = require('mysql2/promise');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// 確保這段連線池定義在全域（檔案的最上層區域）
const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// 支援動態篩選、搜尋與標籤的商品 API
app.get('/api/products', async (req, res) => {
    try {
        const { category, search, tag } = req.query;
        
        let sql = 'SELECT * FROM products WHERE 1=1';
        const params = [];

        if (category && category !== 'all') {
            sql += ' AND category = ?';
            params.push(category);
        }

        if (search) {
            sql += ' AND name LIKE ?';
            params.push(`%${search}%`);
        }

        if (tag) {
            sql += ' AND tags LIKE ?';
            params.push(`%${tag}%`);
        }

        const [rows] = await pool.query(sql, params);
        res.json(rows);
    } catch (error) {
        console.error("資料庫撈取錯誤:", error);
        res.status(500).json({ error: "伺服器發生錯誤" });
    }
});

app.listen(PORT, () => {
    console.log(`伺服器正運行於 port ${PORT}`);
});