// Proforma Invoice Generator Utility
// Handles generation of Proforma Invoices with Ogla letterhead

import jsPDF from "jspdf";

export const generateInvoiceNumber = () => {
  const year = new Date().getFullYear();
  const yearShort = year.toString().slice(-2);
  const existingRequests = JSON.parse(localStorage.getItem("ogla_requests") || "[]");
  const yearRequests = existingRequests.filter((req) =>
    req.invoiceNumber.startsWith(`OGP-${yearShort}`)
  );
  const nextNumber = yearRequests.length + 1;
  return `OGP-${String(nextNumber).padStart(3, "0")}${yearShort}`;
};

export const formatPrice = (price) => {
  return new Intl.NumberFormat("en-GH", {
    style: "currency",
    currency: "GHS",
  }).format(price);
};

export const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString("en-GH", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

export const generateProformaInvoice = async (invoiceData) => {
  try {
    const letterheadUrl = `${window.location.origin}/images/OGLA_SHEA_lh.jpg`;
    const invoiceHTML = createInvoiceHTML(invoiceData, letterheadUrl);
    const pdfBlob = await generatePDF(invoiceHTML);
    downloadPDF(pdfBlob, `Proforma_Invoice_${invoiceData.invoiceNumber}.pdf`);
    await sendInvoiceEmail(invoiceData);
    return true;
  } catch (error) {
    console.error("Error generating invoice:", error);
    throw error;
  }
};

const createInvoiceHTML = (invoiceData, letterheadUrl) => {
  const { invoiceNumber, customer, items, totalAmount, submittedAt } = invoiceData;

  return `
  <div style="
    font-family: Arial, sans-serif;
    font-size: 11px;
    color: #333;
    width: 210mm;
    min-height: 297mm;
    background-image: url('${letterheadUrl}');
    background-size: 210mm 297mm;
    background-repeat: no-repeat;
    box-sizing: border-box;
    padding: 20mm 15mm;
  ">
    <div style="text-align:center; border-bottom: 1px solid #b5a033; margin-bottom: 20px; padding-bottom: 8px;">
      <div style="font-size: 1.6em; font-weight: bold; color:#b5a033;">Proforma Invoice</div>
      <div style="font-size: 0.9em; color:#666; font-weight: bold;">Invoice #: ${invoiceNumber}</div>
    </div>

    <div style="display:flex; justify-content:space-between; margin-bottom:20px;">
      <div>
        <div style="font-weight:bold; color:#b5a033; border-bottom:1px solid #b5a033; margin-bottom:5px;">Bill To:</div>
        <div><b>Name:</b> ${customer.firstName} ${customer.lastName}</div>
        <div><b>Company:</b> ${customer.companyName}</div>
        <div><b>Email:</b> ${customer.email}</div>
        <div><b>Phone:</b> ${customer.phone}</div>
      </div>
      <div>
        <div style="font-weight:bold; color:#b5a033; border-bottom:1px solid #b5a033; margin-bottom:5px;">Invoice Details:</div>
        <div><b>Date:</b> ${formatDate(submittedAt)}</div>
        <div><b>Company Type:</b> ${customer.companyType}</div>
        <div><b>Role:</b> ${customer.companyRole}</div>
      </div>
    </div>

    <table style="width:100%; border-collapse:collapse; margin:20px 0; font-size:0.8em;">
      <thead>
        <tr style="background:#b5a033; color:white;">
          <th style="padding:8px 4px; text-align:left;">Item</th>
          <th style="padding:8px 4px; text-align:left;">Description</th>
          <th style="padding:8px 4px; text-align:left;">Qty</th>
          <th style="padding:8px 4px; text-align:left;">Unit Price</th>
          <th style="padding:8px 4px; text-align:left;">Total</th>
        </tr>
      </thead>
      <tbody>
        ${items
          .map(
            (item) => `
          <tr style="border-bottom: 1px solid #dee2e6;">
            <td style="padding:6px 4px;">${item.name}</td>
            <td style="padding:6px 4px;">${item.shortDescription || item.description || ""}</td>
            <td style="padding:6px 4px;">${item.quantity}</td>
            <td style="padding:6px 4px;">${formatPrice(item.price)}</td>
            <td style="padding:6px 4px;">${formatPrice(item.price * item.quantity)}</td>
          </tr>`
          )
          .join("")}
      </tbody>
    </table>

    <div style="text-align:right; border-top:2px solid #b5a033; margin-top:15px; padding-top:10px;">
      <span style="font-weight:bold; font-size: 1.1em; margin-right:10px;">Total:</span>
      <span style="font-weight:bold; font-size: 1.1em; color:#b5a033;">${formatPrice(totalAmount)}</span>
    </div>

    <div style="margin-top:25px; padding:10px; background:rgba(248,249,250,0.8); border-left:3px solid #b5a033;">
      <h4 style="font-size:0.9em; color:#b5a033; margin-top:0;">Terms & Conditions:</h4>
      <ul style="font-size:0.8em; margin:0; padding-left:20px;">
        <li>This is a Proforma Invoice and does not constitute a tax invoice</li>
        <li>Prices are subject to change without prior notice</li>
        <li>Delivery will be arranged upon confirmation of order</li>
        <li>All disputes are subject to Ghanaian law</li>
      </ul>
    </div>
  </div>`;
};

const generatePDF = async (htmlContent) => {
  const { jsPDF } = await import("jspdf");
  const html2canvas = await import("html2canvas");

  const tempDiv = document.createElement("div");
  tempDiv.innerHTML = htmlContent;
  tempDiv.style.position = "absolute";
  tempDiv.style.left = "-9999px";
  tempDiv.style.width = "210mm";
  tempDiv.style.height = "297mm";
  document.body.appendChild(tempDiv);

  const canvas = await html2canvas.default(tempDiv, {
    scale: 2,
    useCORS: true,
    logging: false,
    backgroundColor: "#ffffff",
  });

  document.body.removeChild(tempDiv);

  const pdf = new jsPDF("p", "mm", "a4");
  const imgData = canvas.toDataURL("image/jpeg", 0.95);
  pdf.addImage(imgData, "JPEG", 0, 0, 210, 297);

  return pdf.output("blob");
};

const downloadPDF = (blob, filename) => {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

const sendInvoiceEmail = async (invoiceData) => {
  console.log("Pretend email sent:", invoiceData.invoiceNumber);
};

export default {
  generateInvoiceNumber,
  formatPrice,
  formatDate,
  generateProformaInvoice,
};
