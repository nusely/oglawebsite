const axios = require('axios');

const API_BASE = 'http://localhost:3001/api';

async function testAuthAndDelete() {
  try {
    console.log('Testing authentication and delete functionality...\n');

    // Step 1: Login as admin
    console.log('1. Logging in as admin...');
    const loginResponse = await axios.post(`${API_BASE}/auth/login`, {
      email: 'admin@ogla.com',
      password: 'admin123'
    });

    if (loginResponse.data.success) {
      const token = loginResponse.data.data.token;
      console.log('✅ Login successful');
      console.log('Token:', token.substring(0, 20) + '...');

      // Step 2: Test brands endpoint with auth
      console.log('\n2. Testing brands endpoint with authentication...');
      const brandsResponse = await axios.get(`${API_BASE}/brands`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (brandsResponse.data.success) {
        console.log('✅ Brands endpoint accessible');
        const brands = brandsResponse.data.data;
        console.log(`Found ${brands.length} brands`);

        if (brands.length > 0) {
          const firstBrand = brands[0];
          console.log(`Testing delete for brand: ${firstBrand.name} (ID: ${firstBrand.id})`);

          // Step 3: Test delete endpoint
          console.log('\n3. Testing delete endpoint...');
          try {
            const deleteResponse = await axios.delete(`${API_BASE}/brands/${firstBrand.id}`, {
              headers: {
                'Authorization': `Bearer ${token}`
              }
            });

            if (deleteResponse.data.success) {
              console.log('✅ Delete successful');
              console.log('Response:', deleteResponse.data.message);

              // Step 4: Verify the brand is soft deleted
              console.log('\n4. Verifying soft delete...');
              const brandsAfterDelete = await axios.get(`${API_BASE}/brands`, {
                headers: {
                  'Authorization': `Bearer ${token}`
                }
              });

              const remainingBrands = brandsAfterDelete.data.data;
              console.log(`Brands after delete: ${remainingBrands.length}`);
              
              const deletedBrand = remainingBrands.find(b => b.id === firstBrand.id);
              if (!deletedBrand) {
                console.log('✅ Brand successfully soft deleted (not in active list)');
              } else {
                console.log('❌ Brand still appears in active list');
              }
            }
          } catch (deleteError) {
            console.log('❌ Delete failed');
            console.log('Error:', deleteError.response?.data || deleteError.message);
          }
        }
      }
    } else {
      console.log('❌ Login failed');
      console.log('Response:', loginResponse.data);
    }

  } catch (error) {
    console.log('❌ Test failed');
    console.log('Error:', error.response?.data || error.message);
  }
}

testAuthAndDelete();
