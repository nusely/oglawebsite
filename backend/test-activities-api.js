const axios = require('axios');

async function testActivitiesAPI() {
  try {
    console.log('🧪 Testing Activities API endpoint...\n');
    
    // Test the activities endpoint
    const response = await axios.get('http://localhost:5000/api/activities', {
      headers: {
        'Authorization': 'Bearer YOUR_TOKEN_HERE' // You'll need to replace this with a valid token
      }
    });
    
    console.log('✅ Activities API response:');
    console.log('Status:', response.status);
    console.log('Total activities:', response.data.pagination?.total || 'N/A');
    console.log('Activities count:', response.data.activities?.length || 0);
    
    if (response.data.activities && response.data.activities.length > 0) {
      console.log('\n📋 Sample activities:');
      response.data.activities.slice(0, 3).forEach((activity, index) => {
        console.log(`${index + 1}. ${activity.action} - ${activity.entityType}`);
        console.log(`   User: ${activity.user}`);
        console.log(`   IP: ${activity.ipAddress}`);
        console.log(`   Time: ${activity.createdAt}`);
      });
    }
    
  } catch (error) {
    if (error.response) {
      console.error('❌ API Error:');
      console.error('Status:', error.response.status);
      console.error('Message:', error.response.data?.message || 'Unknown error');
    } else {
      console.error('❌ Network Error:', error.message);
    }
  }
}

testActivitiesAPI();

