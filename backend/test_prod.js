const https = require('https');

function request(url, options, postData) {
    return new Promise((resolve, reject) => {
        const req = https.request(url, options, (res) => {
            let data = '';
            res.on('data', (chunk) => { data += chunk; });
            res.on('end', () => {
                try {
                    resolve({ status: res.statusCode, body: JSON.parse(data) });
                } catch (e) {
                    resolve({ status: res.statusCode, body: data });
                }
            });
        });
        req.on('error', (e) => reject(e));
        if (postData) req.write(postData);
        req.end();
    });
}

async function test() {
    const baseURL = 'https://fitwithdy-api.onrender.com/api';
    console.log('🔗 Testing API:', baseURL);

    const users = [
        { role: 'Admin', email: 'admin@example.com', pass: 'password123' },
        { role: 'Trainer', email: 'trainer@example.com', pass: 'password123' },
        { role: 'Client', email: 'client@example.com', pass: 'password123' }
    ];

    for (const u of users) {
        console.log(`\n🔑 Testing ${u.role} Login...`);
        try {
            const res = await request(`${baseURL}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' }
            }, JSON.stringify({ email: u.email, password: u.pass }));

            if (res.body.token) {
                console.log(`✅ ${u.role} Login SUCCESS`);
                console.log(`   Name: ${res.body.name}`);
                console.log(`   Role: ${res.body.role}`);
            } else {
                console.log(`❌ ${u.role} Login FAILED:`, res.body);
            }
        } catch (e) {
            console.error(`❌ Connection Error:`, e.message);
        }
    }
}

test();
