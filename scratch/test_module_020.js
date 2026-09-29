const http = require('http');

function makeRequest(options, postData = null) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => (body += chunk));
      res.on('end', () => {
        try {
          const parsed = JSON.parse(body);
          resolve({ status: res.statusCode, headers: res.headers, body: parsed });
        } catch (e) {
          resolve({ status: res.statusCode, headers: res.headers, body });
        }
      });
    });
    req.on('error', (err) => reject(err));
    if (postData) {
      req.write(typeof postData === 'string' ? postData : JSON.stringify(postData));
    }
    req.end();
  });
}

async function runTests() {
  console.log('--- Starting Module 020 Integration & Automated Tests ---');

  // 1. Admin Login
  console.log('1. Logging in as SuperAdmin/Admin...');
  const adminLogin = await makeRequest(
    {
      hostname: 'localhost',
      port: 3000,
      path: '/api/auth/login',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    },
    { phone: '9999999999', password: 'SuperAdminPassword123!' }
  );

  if (adminLogin.status !== 200) {
    console.error('FAILED: Admin login failed', adminLogin.body);
    process.exit(1);
  }
  const adminCookie = adminLogin.headers['set-cookie'];
  const adminToken = adminLogin.body.data?.token;
  console.log('SUCCESS: Admin logged in successfully.');

  // 2. Customer Login
  console.log('2. Logging in as Customer...');
  const customerLogin = await makeRequest(
    {
      hostname: 'localhost',
      port: 3000,
      path: '/api/auth/login',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    },
    { phone: '9876501234', password: 'password123' }
  );

  if (customerLogin.status !== 200) {
    console.error('FAILED: Customer login failed', customerLogin.body);
    process.exit(1);
  }
  const customerCookie = customerLogin.headers['set-cookie'];
  const customerToken = customerLogin.body.data?.token;
  console.log('SUCCESS: Customer logged in successfully.');

  // 3. GET /api/dashboard/summary
  console.log('3. Testing GET /api/dashboard/summary (Admin)...');
  const summaryRes = await makeRequest({
    hostname: 'localhost',
    port: 3000,
    path: '/api/dashboard/summary',
    method: 'GET',
    headers: {
      Authorization: `Bearer ${adminToken}`,
      Cookie: adminCookie ? adminCookie.join('; ') : '',
    },
  });

  if (summaryRes.status !== 200 || !summaryRes.body.data?.kpis) {
    console.error('FAILED: GET /api/dashboard/summary failed', summaryRes.body);
    process.exit(1);
  }
  console.log('SUCCESS: Dashboard KPIs received:', summaryRes.body.data.kpis);

  // 4. GET /api/dashboard/recent-activity
  console.log('4. Testing GET /api/dashboard/recent-activity...');
  const activityRes = await makeRequest({
    hostname: 'localhost',
    port: 3000,
    path: '/api/dashboard/recent-activity',
    method: 'GET',
    headers: {
      Authorization: `Bearer ${adminToken}`,
      Cookie: adminCookie ? adminCookie.join('; ') : '',
    },
  });

  if (activityRes.status !== 200 || !Array.isArray(activityRes.body.data?.activities)) {
    console.error('FAILED: GET /api/dashboard/recent-activity failed', activityRes.body);
    process.exit(1);
  }
  console.log(`SUCCESS: Received ${activityRes.body.data.activities.length} activity feed items.`);

  // 5. GET /api/dashboard/alerts
  console.log('5. Testing GET /api/dashboard/alerts...');
  const alertsRes = await makeRequest({
    hostname: 'localhost',
    port: 3000,
    path: '/api/dashboard/alerts',
    method: 'GET',
    headers: {
      Authorization: `Bearer ${adminToken}`,
      Cookie: adminCookie ? adminCookie.join('; ') : '',
    },
  });

  if (alertsRes.status !== 200 || !Array.isArray(alertsRes.body.data?.alerts)) {
    console.error('FAILED: GET /api/dashboard/alerts failed', alertsRes.body);
    process.exit(1);
  }
  console.log(`SUCCESS: Received ${alertsRes.body.data.totalAlerts} operational alerts.`);

  // 6. GET /api/admin/audit-logs
  console.log('6. Testing GET /api/admin/audit-logs...');
  const auditRes = await makeRequest({
    hostname: 'localhost',
    port: 3000,
    path: '/api/admin/audit-logs?page=1&limit=10',
    method: 'GET',
    headers: {
      Authorization: `Bearer ${adminToken}`,
      Cookie: adminCookie ? adminCookie.join('; ') : '',
    },
  });

  if (auditRes.status !== 200 || !Array.isArray(auditRes.body.data?.auditLogs)) {
    console.error('FAILED: GET /api/admin/audit-logs failed', auditRes.body);
    process.exit(1);
  }
  console.log(`SUCCESS: Audit logs paginated response received. Total: ${auditRes.body.data.pagination?.total}`);

  // 7. GET /api/customer/dashboard-summary
  console.log('7. Testing GET /api/customer/dashboard-summary...');
  const custDashRes = await makeRequest({
    hostname: 'localhost',
    port: 3000,
    path: '/api/customer/dashboard-summary',
    method: 'GET',
    headers: {
      Authorization: `Bearer ${customerToken}`,
      Cookie: customerCookie ? customerCookie.join('; ') : '',
    },
  });

  if (custDashRes.status !== 200 || custDashRes.body.data?.serviceRequestsCount === undefined) {
    console.error('FAILED: GET /api/customer/dashboard-summary failed', custDashRes.body);
    process.exit(1);
  }
  console.log('SUCCESS: Customer dashboard summary received:', custDashRes.body.data);

  console.log('\n--- ALL MODULE 020 INTEGRATION TESTS PASSED 100%! ---');
}

runTests().catch((err) => {
  console.error('UNCAUGHT TEST ERROR:', err);
  process.exit(1);
});
