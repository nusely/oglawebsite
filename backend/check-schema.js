// check-schema.js
const { pool, query } = require("./config/azure-database");

async function checkSchema() {
  try {
    await pool.connect();
    const result = await query(`
            SELECT 
                COLUMN_NAME, 
                DATA_TYPE,
                CHARACTER_MAXIMUM_LENGTH,
                IS_NULLABLE
            FROM INFORMATION_SCHEMA.COLUMNS 
            WHERE TABLE_NAME = 'requests'
            ORDER BY ORDINAL_POSITION;
        `);
    console.log("Table Schema:", JSON.stringify(result, null, 2));
  } catch (err) {
    console.error("Error:", err);
  } finally {
    await pool.close();
  }
}

checkSchema();
