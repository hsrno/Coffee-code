import express from "express";
import cors from "cors";
import pool from "./db.js"

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Test route
app.get("/", (req, res) => {
  res.send("🔥 Coffee & Code Backend is running");
});

// Test DB conection
app.get("/api/products", async (req, res) => {
try {
    const result = await pool.query("SELECT * FROM products ORDER BY id");
    res.json(result.rows);
} catch (err) {
    console.error("DB ERROR:", err);
    res.status(500).json({
        success: false,
        error: err.message,
    });
}
});

//Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
