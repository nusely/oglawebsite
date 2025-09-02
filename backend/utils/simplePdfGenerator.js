// Simple PDF generator using a different approach
const fs = require('fs');
const path = require('path');

// Generate a simple PDF-like content (for now, we'll create a text-based invoice)
const generateInvoicePDF = async (invoiceData) => {
  try {
    console.log('🔄 Starting simple invoice generation for:', invoiceData.invoiceNumber);
    
    const isAdmin = invoiceData.adminStamp;
    
    // Create a simple text-based invoice content
    const invoiceContent = `
PROFORMA INVOICE
================

Invoice #: ${invoiceData.invoiceNumber}
Date: ${new Date(invoiceData.submittedAt).toLocaleDateString()}
Status: ${invoiceData.status || 'PENDING'}

BILL TO:
--------
Name: ${invoiceData.customer.firstName} ${invoiceData.customer.lastName}
Company: ${invoiceData.customer.companyName || 'N/A'}
Email: ${invoiceData.customer.email}
Phone: ${invoiceData.customer.phone || 'N/A'}
Company Type: ${invoiceData.customer.companyType || 'N/A'}
Role: ${invoiceData.customer.companyRole || 'N/A'}

ITEMS:
------
${invoiceData.items.map((item, index) => 
  `${index + 1}. ${item.name || 'Product'}
   Description: ${item.shortDescription || item.description || ''}
   Quantity: ${item.quantity}
   Unit Price: GH₵${item.price}
   Total: GH₵${(item.price * item.quantity).toFixed(2)}
`
).join('\n')}

TOTAL: GH₵${invoiceData.totalAmount.toFixed(2)}

BANK PAYMENT DETAILS:
--------------------
1. Ecobank Ghana
   Head Office, Ridge – Accra
   Account Name: OGLA SHEA BUTTER & TRADING
   Account Number: 1441002558413

2. First Bank Ghana
   Osu Branch – Accra
   Account Name: OGLA SHEA BUTTER & TRADING
   Account Number: 0203400000888

3. Access Bank Ghana
   Stadium Branch – Accra
   Account Name: OGLA SHEA BUTTER & TRADING
   Account Number: 100900031728

TERMS & CONDITIONS:
------------------
• This is a Proforma Invoice and does not constitute a tax invoice
• Prices are subject to change without prior notice
• All disputes are subject to Ghanaian law

${isAdmin ? '\nSYSTEM GENERATED' : ''}
    `.trim();
    
    // Convert to buffer (this creates a text file, but we can enhance it later)
    const buffer = Buffer.from(invoiceContent, 'utf8');
    
    console.log('✅ Simple invoice generated successfully, size:', buffer.length);
    return buffer;
    
  } catch (error) {
    console.error('❌ Simple invoice generation failed:', error);
    throw error;
  }
};

module.exports = {
  generateInvoicePDF
};
