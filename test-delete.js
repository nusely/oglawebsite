const fetch = require('node-fetch');

const API_BASE = 'http://localhost:3001/api';

async function testDelete() {
  try {
    console.log('Testing delete functionality...\n');

    // Step 1: Login as admin
    console.log('1. Logging in as admin...');
    const loginResponse = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'admin@ogla.com',
        password: 'admin123'
      })
    });

    const loginData = await loginResponse.json();
    
    if (loginData.success) {
      const token = loginData.data.token;
      console.log('✅ Login successful');
      console.log('Token:', token.substring(0, 20) + '...');

      // Step 2: Get brands
      console.log('\n2. Getting brands...');
      const brandsResponse = await fetch(`${API_BASE}/brands`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const brandsData = await brandsResponse.json();
      
      if (brandsData.success) {
        console.log('✅ Brands endpoint accessible');
        const brands = brandsData.data;
        console.log(`Found ${brands.length} brands`);

        if (brands.length > 0) {
          const firstBrand = brands[0];
          console.log(`Testing delete for brand: ${firstBrand.name} (ID: ${firstBrand.id})`);

          // Step 3: Test delete
          console.log('\n3. Testing delete...');
          const deleteResponse = await fetch(`${API_BASE}/brands/${firstBrand.id}`, {
            method: 'DELETE',
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });

          const deleteData = await deleteResponse.json();
          
          if (deleteData.success) {
            console.log('✅ Delete successful!');
            console.log('Response:', deleteData.message);
          } else {
            console.log('❌ Delete failed');
            console.log('Response:', deleteData);
          }
        }
      } else {
        console.log('❌ Failed to get brands');
        console.log('Response:', brandsData);
      }
    } else {
      console.log('❌ Login failed');
      console.log('Response:', loginData);
    }

  } catch (error) {
    console.log('❌ Test failed');
    console.log('Error:', error.message);
  }
}

testDelete();
