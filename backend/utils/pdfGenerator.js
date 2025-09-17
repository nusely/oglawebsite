// Use a proper PDF generation library (optional dependency)

let playwright;
try {
  playwright = require("playwright");
} catch (error) {
  console.log("⚠️  Playwright not installed. Using fallback PDF generation.");
  playwright = null;
}

const fs = require("fs");
const path = require("path");

// Read letterhead image and convert to Base64 at module load
const pathToLetterhead = path.join(__dirname, "../images/OGLA_SHEA_lh.jpg");
let letterheadDataUrl = "";
try {
  if (fs.existsSync(pathToLetterhead)) {
    const imgBuffer = fs.readFileSync(pathToLetterhead);
    letterheadDataUrl = `data:image/jpeg;base64,${imgBuffer.toString(
      "base64"
    )}`;
  } else {
    console.log("⚠️  Letterhead image not found at:", pathToLetterhead);
  }
} catch (e) {
  console.error("Could not read letterhead image:", e);
  letterheadDataUrl = "";
}

const generateRequestHTML = async (data) => {
  // Create a professional HTML template for the request
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; margin: 40px; }
        .header { text-align: center; margin-bottom: 30px; }
        .request-info { margin-bottom: 20px; }
        .products { margin: 20px 0; }
        .footer { margin-top: 30px; text-align: center; }
        table { width: 100%; border-collapse: collapse; }
        th, td { padding: 8px; border: 1px solid #ddd; }
        th { background-color: #f4f4f4; }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>Request Details</h1>
        <p>Request #${data.requestId}</p>
        <p>${data.date}</p>
      </div>
      
      <div class="request-info">
        <h2>Customer Information</h2>
        <p><strong>Name:</strong> ${data.customerName}</p>
        <p><strong>Email:</strong> ${data.customerEmail}</p>
        <p><strong>Phone:</strong> ${data.customerPhone}</p>
        <p><strong>Address:</strong> ${data.customerAddress}</p>
        <p><strong>Status:</strong> ${data.status}</p>
      </div>
      
      <div class="products">
        <h2>Products</h2>
        <table>
          <thead>
            <tr>
              <th>Product</th>
              <th>Quantity</th>
              <th>Price</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            ${data.products
              .map(
                (p) => `
              <tr>
                <td>${p.name}</td>
                <td>${p.quantity}</td>
                <td>$${p.price.toFixed(2)}</td>
                <td>$${(p.quantity * p.price).toFixed(2)}</td>
              </tr>
            `
              )
              .join("")}
          </tbody>
        </table>
        
        <p><strong>Total Amount: $${data.totalAmount.toFixed(2)}</strong></p>
      </div>
      
      ${
        data.message
          ? `
        <div class="message">
          <h2>Additional Information</h2>
          <p>${data.message}</p>
        </div>
      `
          : ""
      }
      
      <div class="footer">
        <p>Thank you for your business!</p>
      </div>
    </body>
    </html>
  `;
};

const generatePDF = async (htmlContent, options = {}) => {
  try {
    if (playwright) {
      const browser = await playwright.chromium.launch({
        headless: true,
        timeout: 30000, // 30 second timeout
      });
      const context = await browser.newContext();
      const page = await context.newPage();

      // Set page timeout
      page.setDefaultTimeout(30000);
      await page.setContent(htmlContent, { waitUntil: "networkidle" });
      // Wait for background images to load
      await page.waitForTimeout(2000);
      // Ensure the viewport matches A4 size exactly
      await page.setViewportSize({ width: 794, height: 1123 }); // 210mm x 297mm at 96dpi
      const pdfBuffer = await page.pdf({
        format: "A4",
        printBackground: true,
        margin: { top: 0, right: 0, bottom: 0, left: 0 },
        width: "210mm",
        height: "297mm",
        preferCSSPageSize: true,
      });
      await browser.close();

      // Validate PDF buffer
      if (!pdfBuffer || pdfBuffer.length === 0) {
        throw new Error("Generated PDF buffer is empty");
      }

      // Check if it's a valid PDF
      const pdfSignature = pdfBuffer.toString("ascii", 0, 4);
      if (pdfSignature !== "%PDF") {
        throw new Error("Generated buffer is not a valid PDF");
      }
      return pdfBuffer;
    } else {
      throw new Error("Playwright not available");
    }
  } catch (error) {
    console.error(
      "❌ Playwright PDF generation failed, using fallback PDF:",
      error.message
    );
    // Fallback to placeholder PDF
    const pdfContent = `
%PDF-1.4
1 0 obj
<<
/Type /Catalog
/Pages 2 0 R
>>
endobj

2 0 obj
<<
/Type /Pages
/Kids [3 0 R]
/Count 1
>>
endobj

3 0 obj
<<
/Type /Page
/Parent 2 0 R
/MediaBox [0 0 595 842]
/Contents 4 0 R
>>
endobj

4 0 obj
<<
/Length 200
>>
stream
BT
/F1 16 Tf
72 720 Td
(Proforma Invoice - Generated by Ogla) Tj
ET
BT
/F1 12 Tf
72 680 Td
(This is a fallback PDF. The full PDF with letterhead) Tj
ET
BT
/F1 12 Tf
72 660 Td
(will be generated when Playwright is properly configured.) Tj
ET
BT
/F1 10 Tf
72 620 Td
(Please check the email for the complete invoice details.) Tj
ET
endstream
endobj


0 5
0000000000 65535 f 
0000000009 00000 n 
0000000058 00000 n 
0000000115 00000 n 
0000000204 00000 n 
trailer
<<
/Size 5
/Root 1 0 R
>>
startxref
500
%%EOF
    `;
    const buffer = Buffer.from(pdfContent, "utf8");
    return buffer;
  }
};
// Generate invoice PDF with letterhead
const generateInvoicePDF = async (invoiceData) => {
  try {
    // Use the top-level letterheadDataUrl
    const isAdmin = invoiceData.adminStamp;

    const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <style>
        @page {
          size: A4;
          margin: 0;
        }
        body {
          font-family: Arial, sans-serif;
          font-size: 11px;
          color: #333;
          margin: 0;
          padding: 0;
            background-image: url('${letterheadDataUrl || ""}');
          background-size: 210mm 297mm;
          background-repeat: no-repeat;
          background-position: center;
          min-height: 297mm;
          position: relative;
        }
        .container {
          padding: 20mm 15mm;
          min-height: 257mm;
          position: relative;
          z-index: 1;
        }
        .header {
          text-align: center;
          border-bottom: 1px solid #b5a033;
          margin-bottom: 20px;
          padding-bottom: 8px;
        }
        .title {
          font-size: 1.6em;
          font-weight: bold;
          color: #b5a033;
          margin: 0;
        }
        .invoice-number {
          font-size: 0.9em;
          color: #666;
          font-weight: bold;
          margin: 5px 0 0 0;
        }
        .info-section {
          display: flex;
          justify-content: space-between;
          margin-bottom: 40px;
          gap: 40px;
        }
        .info-box {
          flex: 1;
          margin: 0 20px;
          line-height: 1.8;
        }
        .info-box:first-child {
          margin-left: 0;
        }
        .info-box:last-child {
          margin-right: 0;
        }
        .info-title {
          font-weight: bold;
          color: #b5a033;
          border-bottom: 1px solid #b5a033;
          margin-bottom: 5px;
          padding-bottom: 2px;
        }
        .items-table {
          width: 100%;
          border-collapse: collapse;
          margin: 20px 0;
          font-size: 0.8em;
        }
        .items-table th {
          background: #b5a033;
          color: white;
          padding: 8px 4px;
          text-align: left;
        }
        .items-table td {
          padding: 6px 4px;
          border-bottom: 1px solid #dee2e6;
        }
        .total-section {
          text-align: right;
          border-top: 2px solid #b5a033;
          margin-top: 15px;
          padding-top: 10px;
        }
        .total-label {
          font-weight: bold;
          font-size: 1.1em;
          margin-right: 10px;
        }
        .total-amount {
          font-weight: bold;
          font-size: 1.1em;
          color: #b5a033;
        }
        .terms {
          margin-top: 25px;
          padding: 10px;
          background: rgba(248,249,250,0.9);
          border-left: 3px solid #b5a033;
        }
        .terms h4 {
          font-size: 0.9em;
          color: #b5a033;
          margin: 0 0 10px 0;
        }
        .terms ul {
          font-size: 0.8em;
          margin: 0;
          padding-left: 20px;
        }
        .terms li {
          margin-bottom: 3px;
        }
        .bank-details {
          margin-top: 25px;
          padding: 15px;
          background: rgba(255,255,255,0.95);
          border: 2px solid #b5a033;
          border-radius: 8px;
        }
        .bank-details h4 {
          font-size: 1em;
          color: #b5a033;
          margin: 0 0 15px 0;
          text-align: center;
          border-bottom: 1px solid #b5a033;
          padding-bottom: 5px;
        }
        .bank-accounts {
          display: flex;
          justify-content: space-between;
          gap: 15px;
        }
        .bank-account {
          flex: 1;
          text-align: center;
          padding: 10px;
          background: rgba(248,249,250,0.8);
          border-radius: 5px;
          border: 1px solid #dee2e6;
        }
        .bank-name {
          font-weight: bold;
          color: #b5a033;
          font-size: 0.9em;
          margin-bottom: 5px;
        }
        .bank-branch {
          font-size: 0.7em;
          color: #666;
          margin-bottom: 5px;
        }
        .account-name {
          font-weight: bold;
          font-size: 0.8em;
          margin-bottom: 3px;
        }
        .account-number {
          font-family: 'Courier New', monospace;
          font-size: 0.8em;
          color: #333;
          background: #f8f9fa;
          padding: 2px 5px;
          border-radius: 3px;
        }
        .system-generated {
          position: absolute;
          bottom: 10mm;
          left: 50%;
          transform: translateX(-50%);
          font-size: 0.8em;
          color: #666;
          font-style: italic;
          background: rgba(255,255,255,0.9);
          padding: 5px 10px;
          border-radius: 3px;
          border: 1px solid #dee2e6;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1 class="title">Proforma Invoice</h1>
          <p class="invoice-number">Invoice #: ${invoiceData.invoiceNumber}</p>
        </div>

        <div class="info-section">
          <div class="info-box">
            <div class="info-title">Bill To:</div>
            <div><strong>Name:</strong> ${invoiceData.customer.firstName} ${
      invoiceData.customer.lastName
    }</div>
            <div><strong>Company:</strong> ${
              invoiceData.customer.companyName || "N/A"
            }</div>
            <div><strong>Email:</strong> ${invoiceData.customer.email}</div>
            <div><strong>Phone:</strong> ${
              invoiceData.customer.phone || "N/A"
            }</div>
          </div>
          <div class="info-box">
            <div class="info-title">Invoice Details:</div>
            <div><strong>Date:</strong> ${new Date(
              invoiceData.submittedAt
            ).toLocaleDateString("en-GB")}</div>
            <div><strong>Status:</strong> ${
              invoiceData.status || "PENDING"
            }</div>
            <div><strong>Company Type:</strong> ${
              invoiceData.customer.companyType || "N/A"
            }</div>
            <div><strong>Role:</strong> ${
              invoiceData.customer.companyRole || "N/A"
            }</div>
          </div>
        </div>

        <table class="items-table">
          <thead>
            <tr>
              <th>Item</th>
              <th>Qty</th>
              <th>Unit Price</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            ${invoiceData.items
              .map(
                (item) => `
              <tr>
                <td>${item.name || "Product"}</td>
                <td>${item.quantity}</td>
                <td>GH₵${item.price}</td>
                <td>GH₵${(item.price * item.quantity).toFixed(2)}</td>
              </tr>
            `
              )
              .join("")}
          </tbody>
        </table>

        <div class="total-section">
          <span class="total-label">Total:</span>
          <span class="total-amount">GH₵${invoiceData.totalAmount.toFixed(
            2
          )}</span>
        </div>

        <div class="bank-details">
          <h4>Bank Payment Details</h4>
          <div class="bank-accounts">
            <div class="bank-account">
              <div class="bank-name">Ecobank Ghana</div>
              <div class="bank-branch">Head Office, Ridge – Accra</div>
              <div class="account-name">OGLA SHEA BUTTER & TRADING</div>
              <div class="account-number">1441002558413</div>
            </div>
            <div class="bank-account">
              <div class="bank-name">First Bank Ghana</div>
              <div class="bank-branch">Osu Branch – Accra</div>
              <div class="account-name">OGLA SHEA BUTTER & TRADING</div>
              <div class="account-number">0203400000888</div>
            </div>
            <div class="bank-account">
              <div class="bank-name">Access Bank Ghana</div>
              <div class="bank-branch">Stadium Branch – Accra</div>
              <div class="account-name">OGLA SHEA BUTTER & TRADING</div>
              <div class="account-number">100900031728</div>
            </div>
          </div>
        </div>

        <div class="terms">
          <h4>Terms & Conditions:</h4>
          <ul>
            <li>This is a Proforma Invoice and does not constitute a tax invoice</li>
            <li>Prices are subject to change without prior notice</li>
            <li>Delivery will be arranged upon confirmation of order</li>
            <li>All disputes are subject to Ghanaian law</li>
          </ul>
        </div>
        
        ${isAdmin ? '<div class="system-generated">System Generated</div>' : ""}
      </div>
    </body>
    </html>
  `;

    const pdfBuffer = await generatePDF(htmlContent);

    return pdfBuffer;
  } catch (error) {
    console.error("❌ Invoice PDF generation failed:", error);
    throw error;
  }
};

module.exports = {
  generatePDF,
  generateInvoicePDF,
};
