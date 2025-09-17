const { ConnectionPool } = require("mssql");
require("dotenv").config();
const { handleAzureSqlError } = require("./azure-database-errors");

// Azure SQL Database configuration
const config = {
  server: process.env.DB_SERVER || "your-server.database.windows.net",
  database: process.env.DB_DATABASE || "OglaSheaButterDB",
  user: process.env.DB_USER || "your-username",
  password: process.env.DB_PASSWORD || "your-password",
  port: parseInt(process.env.DB_PORT) || 1433,
  options: {
    encrypt: process.env.DB_ENCRYPT === "true", // true for Azure
    trustServerCertificate: process.env.DB_TRUST_SERVER_CERTIFICATE === "true",
    enableArithAbort: true,
    connectionTimeout: 30000,
    requestTimeout: 30000,
  },
  pool: {
    max: 10,
    min: 0,
    idleTimeoutMillis: 30000,
  },
};

// Create connection pool
const pool = new ConnectionPool(config);

// Initialize connection
async function initializeDatabase() {
  try {
    if (!pool.connected) {
      await pool.connect();
      console.log("✅ Connected to Azure SQL Database");

      // Test the connection
      const result = await pool
        .request()
        .query("SELECT GETUTCDATE() as currentTime");
      console.log("🕐 Database time:", result.recordset[0].currentTime);

      console.log("🔗 Azure SQL Database connection established and ready");
    }

    return true;
  } catch (error) {
    console.error("❌ Error connecting to Azure SQL Database:", error.message);
    throw error;
  }
}

// Convert SQLite syntax to Azure SQL syntax
function convertSqliteToAzureSql(sql) {
  // Convert LIMIT ? OFFSET ? to OFFSET ? ROWS FETCH NEXT ? ROWS ONLY
  sql = sql.replace(
    /LIMIT \? OFFSET \?/g,
    "OFFSET ? ROWS FETCH NEXT ? ROWS ONLY"
  );

  // Convert LIMIT number OFFSET number to OFFSET number ROWS FETCH NEXT number ROWS ONLY
  sql = sql.replace(
    /LIMIT (\d+) OFFSET (\d+)/g,
    "OFFSET $2 ROWS FETCH NEXT $1 ROWS ONLY"
  );

  // Convert LIMIT number to TOP(number) - handle all cases
  // Store the LIMIT value and remove it
  let limitValue = null;
  sql = sql.replace(/\s+LIMIT\s+(\d+)\s*$/gi, (match, limit) => {
    limitValue = limit;
    return "";
  });

  // Add TOP(N) after SELECT if we found a LIMIT
  if (limitValue) {
    sql = sql.replace(/^SELECT\s+/gi, `SELECT TOP(${limitValue}) `);
  }

  // Convert RANDOM() to NEWID() for Azure SQL
  sql = sql.replace(/RANDOM\(\)/g, "NEWID()");

  // Convert datetime("now") to GETUTCDATE()
  sql = sql.replace(/datetime\("now"\)/g, "GETUTCDATE()");

  // Convert CURRENT_TIMESTAMP to GETUTCDATE()
  sql = sql.replace(/CURRENT_TIMESTAMP/g, "GETUTCDATE()");

  return sql;
}

// Helper functions (same as before)
async function query(sql, params = []) {
  try {
    // Ensure connection is established
    if (!pool.connected) {
      await pool.connect();
    }

    // Convert SQLite syntax to Azure SQL syntax
    const convertedSql = convertSqliteToAzureSql(sql);

    const request = pool.request();

    // Validate and process parameters
    let processedParams = [...params];

    // Handle LIMIT/OFFSET parameter reordering for Azure SQL
    if (
      convertedSql.includes("OFFSET") &&
      convertedSql.includes("FETCH NEXT")
    ) {
      // Find the last two parameters (LIMIT and OFFSET in SQLite order)
      const limitIndex = params.length - 2;
      const offsetIndex = params.length - 1;

      if (limitIndex >= 0 && offsetIndex >= 0) {
        const limit = parseInt(params[limitIndex]) || 10;
        const offset = parseInt(params[offsetIndex]) || 0;

        // Reorder: OFFSET first, then LIMIT (Azure SQL order)
        processedParams[limitIndex] = offset;
        processedParams[offsetIndex] = limit;
      }
    }

    // Validate parameters
    processedParams = processedParams.map((param, index) => {
      // Handle LIMIT/OFFSET parameters - ensure they're non-negative numbers
      if (
        convertedSql.includes("OFFSET") &&
        convertedSql.includes("FETCH NEXT") &&
        index >= params.length - 2
      ) {
        const value = parseInt(param) || 0;
        if (value < 0) {
          console.log(
            `⚠️ Warning: Invalid LIMIT/OFFSET parameter at index ${index}: ${param}, using default`
          );
          return index === params.length - 1 ? 10 : 0; // Default LIMIT=10, OFFSET=0
        }
        return value;
      }
      return param;
    });

    processedParams.forEach((param, index) => {
      request.input(`param${index}`, param);
    });

    let processedSql = convertedSql;
    for (let i = 0; i < processedParams.length; i++) {
      processedSql = processedSql.replace("?", `@param${i}`);
    }

    // Debug logging (disabled for performance)
    // console.log('🔍 SQL Debug:', { original: sql, converted: convertedSql, final: processedSql, params: processedParams });

    const result = await request.query(processedSql);
    return result.recordset;
  } catch (error) {
    // Format the error message
    const formattedError = {
      message: error.message,
      code: error.code || "UNKNOWN",
      state: error.state,
      number: error.number,
      sql: sql,
      params: params,
    };

    // Log the error details
    console.error("Database Error:", {
      message: formattedError.message,
      code: formattedError.code,
      sql: sql.slice(0, 500) + (sql.length > 500 ? "..." : ""),
      params: params,
    });

    // Throw a sanitized error for the client
    throw new Error(`Database error: ${formattedError.code}`);
  }
}

// Execute a query with timeout protection
async function queryWithTimeout(sql, params = [], timeout = 15000) {
  try {
    const result = await Promise.race([
      query(sql, params),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Query timeout exceeded")), timeout)
      ),
    ]);
    return result;
  } catch (error) {
    console.error("Query failed:", sql, error);
    throw error;
  }
}

async function queryOne(sql, params = []) {
  const result = await query(sql, params);
  return result.length > 0 ? result[0] : null;
}

// Convert JavaScript boolean to SQL bit (0/1)
function convertToSqlBoolean(value) {
  if (typeof value === "boolean") {
    return value ? 1 : 0;
  }
  if (typeof value === "string") {
    return value.toLowerCase() === "true" ? 1 : 0;
  }
  if (typeof value === "number") {
    return value === 1 ? 1 : 0;
  }
  return 0;
}

async function run(sql, params = []) {
  try {
    // Ensure connection is established
    if (!pool.connected) {
      await pool.connect();
    }

    // Convert SQLite syntax to Azure SQL syntax
    const convertedSql = convertSqliteToAzureSql(sql);

    const request = pool.request();

    params.forEach((param, index) => {
      // Convert boolean values for isActive, isVerified, isFeatured, etc.
      const paramName = `param${index}`;
      const value =
        typeof param === "boolean" ||
        (typeof param === "string" &&
          ["true", "false"].includes(param.toLowerCase())) ||
        (typeof param === "number" && (param === 0 || param === 1))
          ? convertToSqlBoolean(param)
          : param;
      request.input(paramName, value);
    });

    let processedSql = convertedSql;

    // Simple parameter replacement - replace ? with @param0, @param1, etc.
    for (let i = 0; i < params.length; i++) {
      processedSql = processedSql.replace("?", `@param${i}`);
    }

    // For INSERT statements, we need to handle identity insert properly
    let insertedId = null;
    if (processedSql.toLowerCase().trim().startsWith("insert")) {
      // First execute the INSERT
      const insertResult = await request.query(processedSql);

      // Then get the last inserted ID using SCOPE_IDENTITY()
      const idResult = await request.query("SELECT SCOPE_IDENTITY() as id");
      if (idResult && idResult.recordset && idResult.recordset.length > 0) {
        insertedId = idResult.recordset[0].id;
      }

      return {
        id: insertedId,
        lastID: insertedId,
        insertId: insertedId,
        changes: insertResult.rowsAffected[0],
      };
    }

    const result = await request.query(processedSql);

    // Normal non-insert queries continue here

    return {
      lastID: null,
      insertId: null,
      changes: result.rowsAffected[0],
    };
  } catch (error) {
    console.error("Run error:", error.message);
    console.error("SQL:", sql);
    console.error("Params:", params);
    throw error;
  }
}

async function execute(procedureName, params = {}) {
  const request = pool.request();
  Object.keys(params).forEach((key) => {
    request.input(key, params[key]);
  });

  const result = await request.execute(procedureName);
  return result.recordset;
}

async function transaction(callback) {
  const transaction = pool.transaction();

  try {
    await transaction.begin();
    const result = await callback(transaction);
    await transaction.commit();
    return result;
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
}

const poolInterface = {
  execute: async (sql, params = []) => {
    const result = await query(sql, params);
    return [result];
  },
};

// Graceful shutdown
process.on("SIGINT", async () => {
  console.log("\n🔄 Received SIGINT, closing Azure SQL Database connection...");
  try {
    await pool.close();
    console.log("✅ Azure SQL Database connection closed");
  } catch (error) {
    console.log("⚠️ Error closing connection:", error.message);
  }
  process.exit(0);
});

process.on("SIGTERM", async () => {
  console.log(
    "\n🔄 Received SIGTERM, closing Azure SQL Database connection..."
  );
  try {
    await pool.close();
    console.log("✅ Azure SQL Database connection closed");
  } catch (error) {
    console.log("⚠️ Error closing connection:", error.message);
  }
  process.exit(0);
});

module.exports = {
  pool,
  poolInterface,
  query,
  queryOne,
  queryWithTimeout,
  run,
  execute,
  transaction,
  initializeDatabase,
  config,
  convertSqliteToAzureSql,
};
