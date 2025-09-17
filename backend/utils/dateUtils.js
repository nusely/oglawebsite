// Date utility functions for consistent date handling
function convertDatesToISOString(obj) {
  if (obj === null || obj === undefined) return obj;
  if (obj instanceof Date) return obj.toISOString();

  if (Array.isArray(obj)) {
    return obj.map((item) => convertDatesToISOString(item));
  }

  if (typeof obj === "object") {
    const converted = {};
    for (const key in obj) {
      if (obj[key] instanceof Date) {
        converted[key] = obj[key].toISOString();
      } else if (typeof obj[key] === "object") {
        converted[key] = convertDatesToISOString(obj[key]);
      } else {
        converted[key] = obj[key];
      }
    }
    return converted;
  }

  return obj;
}
