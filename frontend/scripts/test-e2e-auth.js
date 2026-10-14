const assert = require("assert");

async function runE2ETests() {
  console.log("=== EventFlow End-to-End Live HTTP Auth Test Suite ===\n");
  const BASE_URL = "http://localhost:3000";

  let studentCookie = null;
  let organizerCookie = null;

  // 1. Invalid Login Rejected
  console.log("1. Testing login rejection with invalid credentials...");
  const invalidLoginRes = await fetch(`${BASE_URL}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "Origin": BASE_URL },
    body: JSON.stringify({ email: "nonexistent@campus.edu", password: "WrongPassword@123" }),
  });
  const invalidLoginData = await invalidLoginRes.json();
  assert.strictEqual(invalidLoginRes.status, 401, "Expected 401 for invalid login");
  assert.strictEqual(invalidLoginData.error, "Email or password is incorrect.");
  console.log("PASS: Invalid credentials correctly rejected with 401\n");

  // 2. Student Signup
  const testStudentEmail = `e2e_student_${Date.now()}@campus.edu`;
  console.log(`2. Testing student signup (${testStudentEmail})...`);
  const studentSignupRes = await fetch(`${BASE_URL}/api/auth/signup`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "Origin": BASE_URL },
    body: JSON.stringify({
      name: "E2E Student",
      email: testStudentEmail,
      password: "StudentPassword@123",
      role: "student",
    }),
  });
  const studentSignupData = await studentSignupRes.json();
  assert.strictEqual(studentSignupRes.status, 201, "Expected 201 for signup");
  assert.strictEqual(studentSignupData.user.email, testStudentEmail);
  assert.strictEqual(studentSignupData.user.role, "STUDENT");

  // Verify Set-Cookie header is returned
  const setCookieHeader = studentSignupRes.headers.get("set-cookie");
  assert.ok(setCookieHeader, "Expected set-cookie header in signup response");
  assert.ok(setCookieHeader.includes("eventflow_session="), "Cookie must contain eventflow_session");
  assert.ok(setCookieHeader.toLowerCase().includes("httponly"), "Cookie must be HttpOnly");
  assert.ok(setCookieHeader.toLowerCase().includes("samesite=lax"), "Cookie must be SameSite=Lax");
  console.log("PASS: Student created with 201 and Set-Cookie received with HttpOnly & SameSite=Lax\n");

  // Extract cookie for subsequent requests
  const match = setCookieHeader.match(/eventflow_session=([^;]+)/);
  assert.ok(match, "Failed to parse session token from Set-Cookie");
  studentCookie = `eventflow_session=${match[1]}`;

  // 3. Duplicate Signup Rejection
  console.log("3. Testing duplicate email signup rejection...");
  const dupSignupRes = await fetch(`${BASE_URL}/api/auth/signup`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "Origin": BASE_URL },
    body: JSON.stringify({
      name: "Duplicate User",
      email: testStudentEmail,
      password: "AnotherPassword@123",
      role: "student",
    }),
  });
  assert.strictEqual(dupSignupRes.status, 409, "Expected 409 Conflict for duplicate email");
  console.log("PASS: Duplicate email correctly rejected with 409\n");

  // 4. Check Unauthenticated /api/auth/me
  console.log("4. Testing /api/auth/me without session cookie...");
  const unauthMeRes = await fetch(`${BASE_URL}/api/auth/me`);
  assert.strictEqual(unauthMeRes.status, 401, "Expected 401 when unauthenticated");
  console.log("PASS: Unauthenticated /api/auth/me returns 401\n");

  // 5. Check Authenticated /api/auth/me with Cookie
  console.log("5. Testing /api/auth/me with active student session cookie...");
  const authMeRes = await fetch(`${BASE_URL}/api/auth/me`, {
    headers: { Cookie: studentCookie },
  });
  assert.strictEqual(authMeRes.status, 200, "Expected 200 for authenticated /api/auth/me");
  const authMeData = await authMeRes.json();
  assert.strictEqual(authMeData.user.email, testStudentEmail);
  assert.strictEqual(authMeData.user.role, "STUDENT");
  console.log(`PASS: /api/auth/me returned authenticated user: ${authMeData.user.name} (${authMeData.user.role})\n`);

  // 6. Verify Protected Route (/registrations) with Session Cookie
  console.log("6. Testing access to protected /registrations page with student cookie...");
  const regPageRes = await fetch(`${BASE_URL}/registrations`, {
    headers: { Cookie: studentCookie },
  });
  assert.strictEqual(regPageRes.status, 200, "Expected 200 for /registrations with valid session");
  const regPageHtml = await regPageRes.text();
  assert.ok(regPageHtml.includes("E2E Student") || regPageHtml.includes("Student Ticket Wallet"), "Expected page to render student greeting");
  console.log("PASS: /registrations rendered successfully for authenticated student\n");

  // 7. Test Logout
  console.log("7. Testing /api/auth/logout...");
  const logoutRes = await fetch(`${BASE_URL}/api/auth/logout`, {
    method: "POST",
    headers: { "Origin": BASE_URL, Cookie: studentCookie },
  });
  assert.strictEqual(logoutRes.status, 200, "Expected 200 for logout");
  const logoutCookieHeader = logoutRes.headers.get("set-cookie");
  assert.ok(logoutCookieHeader && (logoutCookieHeader.includes("Max-Age=0") || logoutCookieHeader.includes("expires=")), "Logout must clear cookie with Max-Age=0");
  console.log("PASS: Logout cleared cookie successfully\n");

  // 8. Organizer Signup and Verification
  const testOrganizerEmail = `e2e_organizer_${Date.now()}@campus.edu`;
  console.log(`8. Testing organizer signup (${testOrganizerEmail})...`);
  const orgSignupRes = await fetch(`${BASE_URL}/api/auth/signup`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "Origin": BASE_URL },
    body: JSON.stringify({
      name: "E2E Organizer",
      email: testOrganizerEmail,
      password: "OrganizerPassword@123",
      role: "organizer",
    }),
  });
  const orgSignupData = await orgSignupRes.json();
  assert.strictEqual(orgSignupRes.status, 201);
  assert.strictEqual(orgSignupData.user.role, "ORGANIZER");

  const orgSetCookie = orgSignupRes.headers.get("set-cookie");
  const orgMatch = orgSetCookie.match(/eventflow_session=([^;]+)/);
  organizerCookie = `eventflow_session=${orgMatch[1]}`;

  // 9. Organizer /api/auth/me Verification
  console.log("9. Testing organizer /api/auth/me session check...");
  const orgMeRes = await fetch(`${BASE_URL}/api/auth/me`, {
    headers: { Cookie: organizerCookie },
  });
  assert.strictEqual(orgMeRes.status, 200);
  const orgMeData = await orgMeRes.json();
  assert.strictEqual(orgMeData.user.role, "ORGANIZER");
  console.log(`PASS: Organizer session confirmed: ${orgMeData.user.email} (${orgMeData.user.role})\n`);

  // 10. Organizer Dashboard Access
  console.log("10. Testing organizer /dashboard access...");
  const dashRes = await fetch(`${BASE_URL}/dashboard`, {
    headers: { Cookie: organizerCookie },
  });
  assert.strictEqual(dashRes.status, 200, "Expected 200 for /dashboard with organizer session");
  console.log("PASS: Organizer dashboard loaded successfully\n");

  // 11. Student Login with Created Credentials
  console.log("11. Testing student login with credentials created during test...");
  const loginRes = await fetch(`${BASE_URL}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "Origin": BASE_URL },
    body: JSON.stringify({
      email: testStudentEmail,
      password: "StudentPassword@123",
    }),
  });
  assert.strictEqual(loginRes.status, 200, "Expected 200 for valid login");
  const loginData = await loginRes.json();
  assert.strictEqual(loginData.user.email, testStudentEmail);
  assert.strictEqual(loginData.user.role, "STUDENT");
  console.log("PASS: Student login succeeded and returned valid user\n");

  console.log("==================================================");
  console.log("ALL 11 END-TO-END HTTP INTEGRATION TESTS PASSED!");
  console.log("==================================================");
}

runE2ETests().catch((err) => {
  console.error("E2E Test Failed:", err);
  process.exit(1);
});
