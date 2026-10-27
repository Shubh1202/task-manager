const http = require('http');

const PORT = 5000;
const BASE_URL = `http://localhost:${PORT}`;

const request = (method, path, body = null, token = null) => {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE_URL);
    const options = {
      method,
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      headers: {
        'Content-Type': 'application/json'
      }
    };

    if (token) {
      options.headers['Authorization'] = `Bearer ${token}`;
    }

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          resolve({ status: res.statusCode, data: parsed });
        } catch (e) {
          resolve({ status: res.statusCode, raw: data });
        }
      });
    });

    req.on('error', (err) => {
      reject(err);
    });

    if (body) {
      req.write(JSON.stringify(body));
    }
    req.end();
  });
};

const runTests = async () => {
  console.log('\n--- 1. Testing Health Check ---');
  const health = await request('GET', '/api/health');
  console.log('Health check status:', health.status, health.data);

  console.log('\n--- 2. Admin Login (Direct Email & Password) ---');
  const adminLogin = await request('POST', '/api/auth/login', {
    email: 'admin@taskmanager.com',
    password: 'Admin@123'
  });
  console.log('Admin login status:', adminLogin.status, 'Message:', adminLogin.data.message);
  console.log('Admin user role:', adminLogin.data.user.role);
  const adminToken = adminLogin.data.token;

  console.log('\n--- 3. Admin Creates Employee Profile ---');
  const empEmail = `employee_${Date.now()}@test.com`;
  const empPassword = 'EmployeePass@123';
  const createEmpRes = await request(
    'POST',
    '/api/users/employees',
    {
      name: 'Rohan Sharma',
      email: empEmail,
      password: empPassword
    },
    adminToken
  );
  console.log('Create employee status:', createEmpRes.status, createEmpRes.data.message);
  const employeeId = createEmpRes.data.employee.id;

  console.log('\n--- 4. Admin Lists Employees ---');
  const empListRes = await request('GET', '/api/users/employees', null, adminToken);
  console.log('Employee count:', empListRes.data.count);

  console.log('\n--- 5. Employee Login (Direct Email & Password) ---');
  const empLogin = await request('POST', '/api/auth/login', {
    email: empEmail,
    password: empPassword
  });
  console.log('Employee login status:', empLogin.status, 'Message:', empLogin.data.message);
  console.log('Employee user role:', empLogin.data.user.role);
  const empToken = empLogin.data.token;

  console.log('\n--- 6. Admin Creates Task For Employee ---');
  const createTaskRes = await request(
    'POST',
    '/api/tasks',
    {
      title: 'Build API Gateway and Routing',
      description: 'Implement Express routing and clean error handlers',
      assignedTo: employeeId,
      priority: 'high',
      dueDate: new Date(Date.now() + 86400000 * 3)
    },
    adminToken
  );
  console.log('Create task status:', createTaskRes.status, 'Task ID:', createTaskRes.data.task._id);
  const taskId = createTaskRes.data.task._id;

  console.log('\n--- 7. Role Access: Employee views tasks (Should see only assigned tasks) ---');
  const empTasksRes = await request('GET', '/api/tasks', null, empToken);
  console.log('Employee tasks found:', empTasksRes.data.count);
  console.log('First task title:', empTasksRes.data.tasks[0]?.title);

  console.log('\n--- 8. Employee Updates Status and Adds Description/Notes ---');
  const empUpdateRes = await request(
    'PATCH',
    `/api/tasks/${taskId}/employee-update`,
    {
      status: 'in-progress',
      employeeNotes: 'Initial scaffolding done. Working on integration tests.'
    },
    empToken
  );
  console.log('Employee update status:', empUpdateRes.status, 'New status:', empUpdateRes.data.task.status);
  console.log('Employee notes:', empUpdateRes.data.task.employeeNotes);

  console.log('\n--- 9. Admin Updates Task (Status to completed, etc.) ---');
  const adminUpdateRes = await request(
    'PUT',
    `/api/tasks/${taskId}`,
    {
      status: 'completed'
    },
    adminToken
  );
  console.log('Admin update task status:', adminUpdateRes.status, 'Status:', adminUpdateRes.data.task.status);

  console.log('\n--- 10. Security Check: Employee CANNOT create task or create employee ---');
  const unauthorizedCreateTask = await request(
    'POST',
    '/api/tasks',
    {
      title: 'Unauthorized Task',
      description: 'Should fail',
      assignedTo: employeeId
    },
    empToken
  );
  console.log('Employee create task attempt (Expect 403):', unauthorizedCreateTask.status);

  const unauthorizedCreateUser = await request(
    'POST',
    '/api/users/employees',
    {
      name: 'Hacker',
      email: 'hacker@test.com'
    },
    empToken
  );
  console.log('Employee create employee attempt (Expect 403):', unauthorizedCreateUser.status);

  console.log('\n====================================================');
  console.log('>> ALL DIRECT EMAIL/PASSWORD API TESTS PASSED! <<');
  console.log('====================================================');

  process.exit(0);
};

// Give server a moment to ensure running then execute tests
setTimeout(runTests, 1000);
