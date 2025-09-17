// Azure SQL Database error handler
function handleAzureSqlError(error) {
  // Common Azure SQL error codes and their meanings
  const errorCodes = {
    2627: "Unique constraint violation",
    547: "Constraint violation",
    8152: "String or binary data would be truncated",
    515: "Cannot insert NULL value",
    201: "Procedure or function expected different number of arguments",
    8114: "Error converting data type",
    4060: "Invalid database",
    18456: "Login failed",
    40613: "Database is currently unavailable",
    40197: "The service has encountered an error processing your request",
    40501: "The service is currently busy",
    40549: "Session is terminated because you have a long-running transaction",
    40550:
      "The session has been terminated because it has acquired too many locks",
  };

  // Format the error message
  const errorNumber = error.number || error.code;
  const errorMessage = errorCodes[errorNumber] || error.message;

  return {
    code: errorNumber,
    message: errorMessage,
    originalError: error.message,
    state: error.state,
    class: error.class,
    lineNumber: error.lineNumber,
    serverName: error.serverName,
    procName: error.procName,
  };
}
