// Proforma Invoice Generator Utility
// Handles generation of Proforma Invoices with Ogla letterhead

import jsPDF from "jspdf";



// Note: This is now primarily handled by the backend
// Frontend should use the invoice number returned from the API
export const generateInvoiceNumber = () => {
  const year = new Date().getFullYear();
  const yearShort = year.toString().slice(-2);
  const existingRequests = JSON.parse(localStorage.getItem("ogla_requests") || "[]");
  const yearRequests = existingRequests.filter((req) =>
    req.invoiceNumber.startsWith(`OGL-${yearShort}`)
  );
  const nextNumber = yearRequests.length + 1;
  return `OGL-${String(nextNumber).padStart(3, "0")}${yearShort}`;
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

export const generateProformaInvoice = async (invoiceData, isAdminDownload = false) => {
  try {
    // Use local letterhead image for reliable PDF generation
    const letterheadUrl = '/images/OGLA_SHEA_lh.jpg';
    console.log('🎯 Using local letterhead image:', letterheadUrl);
    
    const invoiceHTML = createInvoiceHTML(invoiceData, letterheadUrl, isAdminDownload);
    const pdfBlob = await generatePDF(invoiceHTML);
    const filename = isAdminDownload 
      ? `Admin_Invoice_${invoiceData.invoiceNumber}_${new Date().toISOString().split('T')[0]}.pdf`
      : `Proforma_Invoice_${invoiceData.invoiceNumber}.pdf`;
    downloadPDF(pdfBlob, filename);
    
    if (!isAdminDownload) {
      await sendInvoiceEmail(invoiceData);
    }
    
    return true;
  } catch (error) {
    console.error("Error generating invoice:", error);
    throw error;
  }
};

const createInvoiceHTML = (invoiceData, letterheadUrl, isAdminDownload = false) => {
  const { invoiceNumber, customer, items, totalAmount, submittedAt, adminStamp } = invoiceData;

  return `
  <div style="
    font-family: Arial, sans-serif;
    font-size: 11px;
    color: #333;
    width: 210mm;
    min-height: 297mm;
    position: relative;
    box-sizing: border-box;
    padding: 20mm 15mm;
    ${letterheadUrl ? `background-image: url('${letterheadUrl}'); background-size: 210mm 297mm; background-repeat: no-repeat; background-position: center;` : ''}
  ">
    <div style="position: relative; z-index: 1;">
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
            <td style="padding:6px 4px;">${item.quantity}</td>
            <td style="padding:6px 4px;">GH₵${item.price}</td>
            <td style="padding:6px 4px;">GH₵${(item.price * item.quantity).toFixed(2)}</td>
          </tr>`
          )
          .join("")}
      </tbody>
    </table>

    <div style="text-align:right; border-top:2px solid #b5a033; margin-top:15px; padding-top:10px;">
      <span style="font-weight:bold; font-size: 1.1em; margin-right:10px;">Total:</span>
      <span style="font-weight:bold; font-size: 1.1em; color:#b5a033;">GH₵${totalAmount.toFixed(2)}</span>
    </div>

    <div style="margin-top:30px; padding:15px; background:rgba(248,249,250,0.8); border-radius:5px; border:1px solid #dee2e6;">
      <h4 style="color:#b5a033; margin:0 0 15px 0; font-size:1.1em;">Bank Payment Details</h4>
      <div style="display:flex; gap:15px; flex-wrap:wrap;">
        <div style="flex:1; text-align:center; padding:10px; background:rgba(248,249,250,0.8); border-radius:5px; border:1px solid #dee2e6;">
          <div style="font-weight:bold; color:#b5a033; font-size:0.9em; margin-bottom:5px;">Ecobank Ghana</div>
          <div style="font-size:0.7em; color:#666; margin-bottom:5px;">Head Office, Ridge – Accra</div>
          <div style="font-weight:bold; font-size:0.8em; margin-bottom:3px;">OGLA SHEA BUTTER & TRADING</div>
          <div style="font-family:'Courier New',monospace; font-size:0.8em; color:#333; background:#f8f9fa; padding:2px 5px; border-radius:3px;">1441002558413</div>
        </div>
        <div style="flex:1; text-align:center; padding:10px; background:rgba(248,249,250,0.8); border-radius:5px; border:1px solid #dee2e6;">
          <div style="font-weight:bold; color:#b5a033; font-size:0.9em; margin-bottom:5px;">First Bank Ghana</div>
          <div style="font-size:0.7em; color:#666; margin-bottom:5px;">Osu Branch – Accra</div>
          <div style="font-weight:bold; font-size:0.8em; margin-bottom:3px;">OGLA SHEA BUTTER & TRADING</div>
          <div style="font-family:'Courier New',monospace; font-size:0.8em; color:#333; background:#f8f9fa; padding:2px 5px; border-radius:3px;">0203400000888</div>
        </div>
        <div style="flex:1; text-align:center; padding:10px; background:rgba(248,249,250,0.8); border-radius:5px; border:1px solid #dee2e6;">
          <div style="font-weight:bold; color:#b5a033; font-size:0.9em; margin-bottom:5px;">Access Bank Ghana</div>
          <div style="font-size:0.7em; color:#666; margin-bottom:5px;">Stadium Branch – Accra</div>
          <div style="font-weight:bold; font-size:0.8em; margin-bottom:3px;">OGLA SHEA BUTTER & TRADING</div>
          <div style="font-family:'Courier New',monospace; font-size:0.8em; color:#333; background:#f8f9fa; padding:2px 5px; border-radius:3px;">100900031728</div>
        </div>
      </div>
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
    
    ${isAdminDownload && adminStamp ? `
    <div style="margin-top:20px; padding:15px; background:rgba(220,53,69,0.1); border:2px solid #dc3545; border-radius:8px;">
      <div style="text-align:center; color:#dc3545; font-weight:bold; font-size:1.2em; margin-bottom:10px;">
        ⚫ ADMIN COPY ⚫
      </div>
      <div style="font-size:0.8em; color:#666;">
        <div><strong>Downloaded by:</strong> ${adminStamp.downloadedBy}</div>
        <div><strong>Download Date:</strong> ${formatDate(adminStamp.downloadedAt)}</div>
        <div><strong>Admin Email:</strong> ${adminStamp.adminEmail}</div>
        <div style="margin-top:8px; font-style:italic;">This copy was generated for administrative purposes.</div>
      </div>
    </div>
    ` : ''}
    </div>
  </div>`;
};

const generatePDF = async (htmlContent) => {
  const { jsPDF } = await import("jspdf");
  const html2canvas = await import("html2canvas");
  
  try {
    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = htmlContent;
    tempDiv.style.position = "absolute";
    tempDiv.style.left = "-9999px";
    tempDiv.style.width = "210mm";
    tempDiv.style.height = "297mm";
    document.body.appendChild(tempDiv);

    // Wait for images to load before rendering (local images should load quickly)
    const images = tempDiv.querySelectorAll('img');
    if (images.length > 0) {
      console.log('🖼️ Found', images.length, 'images, waiting for them to load...');
      await Promise.all(Array.from(images).map((img, index) => {
        if (img.complete && img.naturalHeight !== 0) {
          console.log(`✅ Image ${index + 1} already loaded`);
          return Promise.resolve();
        }
        return new Promise(resolve => {
          img.onload = () => {
            console.log(`✅ Image ${index + 1} loaded successfully`);
            resolve();
          };
          img.onerror = (error) => {
            console.error(`❌ Image ${index + 1} failed to load:`, error);
            resolve(); // Continue even if image fails to load
          };
          // Shorter timeout for local images
          setTimeout(() => {
            console.log(`⏰ Image ${index + 1} load timeout`);
            resolve();
          }, 3000);
        });
      }));
      console.log('🎯 All images processed');
    }

    const canvas = await html2canvas.default(tempDiv, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: "#ffffff",
      allowTaint: true,
      foreignObjectRendering: false,
      imageTimeout: 15000,
      removeContainer: false,
    });

    document.body.removeChild(tempDiv);

    const pdf = new jsPDF("p", "mm", "a4");
    const imgData = canvas.toDataURL("image/jpeg", 0.95);
    pdf.addImage(imgData, "JPEG", 0, 0, 210, 297);

    return pdf.output("blob");
    
  } catch (error) {
    console.error("Error generating PDF:", error);
    
    // Fallback: generate PDF without letterhead
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
  }
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

const invoiceGenerator = {
  generateInvoiceNumber,
  formatPrice,
  formatDate,
  generateProformaInvoice,
};

export default invoiceGenerator;
