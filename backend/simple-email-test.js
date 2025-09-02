const nodemailer = require('nodemailer');

// Test Gmail connection
async function testGmail() {
  console.log('🧪 Testing Gmail connection...');
  console.log('Email User:', 'oglatrade@gmail.com');
  console.log('Email Pass:', 'tdaa xllq ceyc gwdv');
  
  // Remove spaces from app password
  const appPassword = 'tdaa xllq ceyc gwdv'.replace(/\s/g, '');
  console.log('App Password (no spaces):', appPassword);

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'oglatrade@gmail.com',
      pass: appPassword
    }
  });

  try {
    // Verify connection
    await transporter.verify();
    console.log('✅ Gmail connection verified successfully!');
    
    // Try to send a test email
    const info = await transporter.sendMail({
      from: 'Ogla Shea Butter <oglatrade@gmail.com>',
      to: 'oglatrade@gmail.com',
      subject: 'Test Email from Ogla Backend',
      text: 'This is a test email to verify Gmail SMTP is working.',
      html: '<h1>Test Email</h1><p>This is a test email to verify Gmail SMTP is working.</p>'
    });
    
    console.log('✅ Test email sent successfully!');
    console.log('Message ID:', info.messageId);
    
  } catch (error) {
    console.error('❌ Gmail test failed:', error.message);
    
    if (error.code === 'EAUTH') {
      console.log('\n🔧 Gmail Authentication Issues:');
      console.log('1. Make sure 2-Factor Authentication is enabled on your Gmail account');
      console.log('2. Go to Google Account settings > Security > App passwords');
      console.log('3. Generate a new app password for "Mail"');
      console.log('4. Use the 16-character password without spaces');
    }
  }
}

testGmail();
