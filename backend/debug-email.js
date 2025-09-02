const nodemailer = require('nodemailer');

// Test email configuration
process.env.EMAIL_HOST = 'smtp.gmail.com';
process.env.EMAIL_PORT = '587';
process.env.EMAIL_USER = 'oglatrade@gmail.com';
process.env.EMAIL_PASS = 'vqyh jghi nivm bfnh';
process.env.EMAIL_FROM = 'Ogla Shea Butter <oglatrade@gmail.com>';

async function debugEmail() {
  try {
    console.log('🧪 Debugging email configuration...');
    console.log('Email Host:', process.env.EMAIL_HOST);
    console.log('Email Port:', process.env.EMAIL_PORT);
    console.log('Email User:', process.env.EMAIL_USER);
    console.log('Email Pass:', process.env.EMAIL_PASS ? '***' : 'NOT SET');
    
    // Test 1: Create transporter
    console.log('\n📧 Creating transporter...');
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });
    
    // Test 2: Verify connection
    console.log('🔍 Verifying connection...');
    await transporter.verify();
    console.log('✅ Connection verified successfully!');
    
    // Test 3: Send test email
    console.log('📤 Sending test email...');
    const info = await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to: 'oglatrade@gmail.com',
      subject: 'Test Email from Ogla Backend',
      text: 'This is a test email to verify the email functionality is working.',
      html: '<h1>Test Email</h1><p>This is a test email to verify the email functionality is working.</p>'
    });
    
    console.log('✅ Test email sent successfully!');
    console.log('Message ID:', info.messageId);
    console.log('📧 Check your email inbox for the test message.');
    
  } catch (error) {
    console.error('❌ Email debug failed:', error.message);
    console.error('Full error:', error);
  }
}

debugEmail();
