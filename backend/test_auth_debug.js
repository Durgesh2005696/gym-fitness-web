const axios = require('axios');

async function testAuth() {
    const API_URL = 'http://localhost:5000/api/auth';
    const email = `testuser_${Date.now()}@example.com`;
    const password = 'password123';

    console.log('--- Testing Registration ---');
    try {
        const regRes = await axios.post(`${API_URL}/register`, {
            name: 'Test User',
            email,
            password,
            role: 'CLIENT'
        });
        console.log('Registration Success:', regRes.status, regRes.data);
    } catch (error) {
        console.error('Registration Failed:', error.response ? error.response.data : error.message);
    }

    console.log('\n--- Testing Login ---');
    try {
        const loginRes = await axios.post(`${API_URL}/login`, {
            email,
            password
        });
        console.log('Login Success:', loginRes.status, loginRes.data.token ? 'Token Received' : 'No Token');
    } catch (error) {
        console.error('Login Failed:', error.response ? error.response.data : error.message);
    }
}

testAuth();
