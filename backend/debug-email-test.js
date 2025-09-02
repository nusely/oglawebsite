const { sendEmail } = require('./utils/email');

// Set environment variables
process.env.NODE_ENV = 'development';
process.env.EMAIL_USER = 'oglatrade@gmail.com';
process.env.EMAIL_PASS = 'tdaa xllq ceyc gwdv';
process.env.EMAIL_FROM = 'Ogla Shea Butter <oglatrade@gmail.com>';
process.env.FRONTEND_URL = 'http://localhost:3000';

async function testEmail() {
  try {
    console.log('🧪 Testing email functionality...');
    console.log('Environment:', process.env.NODE_ENV);
    console.log('Email User:', process.env.EMAIL_USER);
    console.log('Email Pass:', process.env.EMAIL_PASS ? '***SET***' : 'NOT SET');

    // Test with a simple email
    await sendEmail({
      to: 'oglatrade@gmail.com',
      subject: 'Test Email from Ogla Backend',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background-color: #8B6914; color: white; padding: 20px; text-align: center;">
            <h1>Test Email</h1>
          </div>
          <div style="padding: 20px;">
            <h2>Hello!</h2>
            <p>This is a test email from the Ogla Shea Butter backend.</p>
            <p>If you receive this email, the email functionality is working correctly!</p>
            <p>Best regards,<br>The Ogla Team</p>
          </div>
        </div>
      `
    });

    console.log('✅ Test email sent successfully!');
    console.log('📧 Check your email inbox for the test message.');

  } catch (error) {
    console.error('❌ Email test failed:', error.message);
    console.error('Full error:', error);

    if (error.code === 'EAUTH') {
      console.log('\n🔧 Troubleshooting Gmail Authentication:');
      console.log('1. Make sure 2-Factor Authentication is enabled on your Gmail account');
      console.log('2. Generate a new App Password from Google Account settings');
      console.log('3. Use the 16-character app password (without spaces)');
      console.log('4. Make sure "Less secure app access" is enabled (if not using app passwords)');
    }
  }
}

testEmail();
