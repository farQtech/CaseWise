const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

const BACKEND_URL = 'http://localhost:3001';
const TEST_PATIENT_ID = 'test-patient-123';

async function testUpload() {
  try {
    console.log('🧪 Testing file upload workflow...');
    
    // Step 1: Login to get authentication
    console.log('🔐 Logging in...');
    const loginResponse = await axios.post(`${BACKEND_URL}/api/auth/login`, {
      email: 'admin@casewise.com',
      password: 'admin'
    }, {
      withCredentials: true
    });
    
    console.log('✅ Login successful');
    
    // Step 2: Create a test file
    const testFilePath = path.join(__dirname, 'test-file.txt');
    fs.writeFileSync(testFilePath, 'This is a test file for upload testing');
    
    // Step 3: Upload the file
    console.log('📤 Uploading test file...');
    const formData = new FormData();
    formData.append('files', fs.createReadStream(testFilePath));
    
    const uploadResponse = await axios.post(`${BACKEND_URL}/api/files/upload/${TEST_PATIENT_ID}`, formData, {
      headers: {
        ...formData.getHeaders(),
        'Cookie': loginResponse.headers['set-cookie']?.join('; ') || ''
      },
      withCredentials: true
    });
    
    console.log('✅ Upload successful:', uploadResponse.data);
    
    // Step 4: Check if file was created in database
    console.log('📋 Checking uploaded files...');
    const filesResponse = await axios.get(`${BACKEND_URL}/api/files/patient/${TEST_PATIENT_ID}`, {
      headers: {
        'Cookie': loginResponse.headers['set-cookie']?.join('; ') || ''
      },
      withCredentials: true
    });
    
    console.log('✅ Files retrieved:', filesResponse.data);
    
    // Step 5: Check pending files (worker endpoint)
    console.log('🔍 Checking pending files for worker...');
    const pendingResponse = await axios.get(`${BACKEND_URL}/api/files/pending`, {
      headers: {
        'x-api-key': 'worker-secret-key'
      }
    });
    
    console.log('✅ Pending files:', pendingResponse.data);
    
    // Cleanup
    fs.unlinkSync(testFilePath);
    console.log('🧹 Test file cleaned up');
    
    console.log('🎉 Upload workflow test completed successfully!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Headers:', error.response.headers);
    }
  }
}

testUpload();
