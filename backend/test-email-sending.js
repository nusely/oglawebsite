require('dotenv').config();
const { sendEmail } = require('./utils/email');

async function testEmailSending() {
  console.log('🧪 Testing email sending...');
  
  // Check environment variables
  console.log('\n📧 Email Configuration:');
  console.log('EMAIL_USER:', process.env.EMAIL_USER ? '✅ Set' : '❌ Missing');
  console.log('EMAIL_PASS:', process.env.EMAIL_PASS ? '✅ Set' : '❌ Missing');
  console.log('EMAIL_FROM:', process.env.EMAIL_FROM ? '✅ Set' : '❌ Missing');
  console.log('FRONTEND_URL:', process.env.FRONTEND_URL || 'Not set');

  // Test sending a verification email
  try {
    console.log('\n📤 Sending test verification email...');
    
    const result = await sendEmail({
      to: 'test@example.com', // You can change this to your email
      template: 'welcome-verification',
      data: {
        firstName: 'Test User',
        companyName: 'Test Company',
        verificationToken: 'test-token-123'
      }
    });
    
    console.log('✅ Email sent successfully!');
    console.log('Message ID:', result.messageId);
    
  } catch (error) {
    console.error('❌ Email sending failed:');
    console.error('Error message:', error.message);
    console.error('Error code:', error.code);
    
    if (error.code === 'EAUTH') {
      console.log('\n💡 Authentication failed. Please check:');
      console.log('1. Gmail App Password is correct');
      console.log('2. 2-Factor Authentication is enabled on Gmail');
      console.log('3. App Password is 16 characters without spaces');
    }
  }
}

testEmailSending();
