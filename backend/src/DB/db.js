import "dotenv/config";
import mysql from "mysql2/promise";

const db = mysql.createPool({
    host: process.env.DB_HOST || "localhost",
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT || 3306,

    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
});
// 2. Test the Database Connection on Startup
async function testDbConnection() {
    try {
        const [rows] = await db.query("SELECT 1 AS connected");

        console.log({
            success: true,
            message: "Database connected successfully",
            result: rows,
        });
    } catch (error) {
        console.error("Database connection error:", error);

        console.log({
            success: false,
            message: "Database connection failed",
            error: error.message,
        });
    }
}
testDbConnection();
export default db;