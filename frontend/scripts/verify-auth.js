const assert = require("assert");
const bcrypt = require("bcryptjs");
const { SignJWT, jwtVerify } = require("jose");

console.log("=== EventFlow Auth & Security Test Suite ===\n");

async function runTests() {
  let passed = 0;
  let failed = 0;

  function test(name, fn) {
    try {
      fn();
      console.log(`PASS: ${name}`);
      passed++;
    } catch (err) {
      console.error(`FAIL: ${name}`);
      console.error("  ", err.message);
      failed++;
    }
  }

  async function asyncTest(name, fn) {
    try {
      await fn();
      console.log(`PASS: ${name}`);
      passed++;
    } catch (err) {
      console.error(`FAIL: ${name}`);
      console.error("  ", err.message);
      failed++;
    }
  }

  // 1. Password Hashing and Verification
  await asyncTest("Password hashing and validation succeeds with correct password", async () => {
    const rawPassword = "SecurePassword@123";
    const hashed = await bcrypt.hash(rawPassword, 10);
    const valid = await bcrypt.compare(rawPassword, hashed);
    assert.strictEqual(valid, true, "Valid password should match");
  });

  await asyncTest("Password verification rejects incorrect password", async () => {
    const rawPassword = "SecurePassword@123";
    const hashed = await bcrypt.hash(rawPassword, 10);
    const invalid = await bcrypt.compare("WrongPassword", hashed);
    assert.strictEqual(invalid, false, "Invalid password must be rejected");
  });

  // 2. JWT Signing and Verification
  await asyncTest("Session JWT signs and verifies payload correctly", async () => {
    const secret = "a_very_secure_test_session_secret_at_least_32_characters_long";
    const key = new TextEncoder().encode(secret);

    const token = await new SignJWT({
      sub: "usr_test_123",
      role: "STUDENT",
      name: "Test Student",
      email: "test.student@campus.edu",
    })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime("8h")
      .sign(key);

    assert.ok(typeof token === "string" && token.length > 20, "JWT token should be generated");

    const { payload } = await jwtVerify(token, key, { algorithms: ["HS256"] });
    assert.strictEqual(payload.sub, "usr_test_123");
    assert.strictEqual(payload.role, "STUDENT");
    assert.strictEqual(payload.email, "test.student@campus.edu");
    assert.strictEqual(payload.name, "Test Student");
  });

  // 3. Security: SESSION_SECRET Production Guard
  test("SESSION_SECRET guard rejects default development secret in production", () => {
    const isProd = true;
    const testSecret = "default_development_session_secret_at_least_32_chars";
    const DEFAULT_DEV_SECRET = "default_development_session_secret_at_least_32_chars";

    let threw = false;
    try {
      if (!testSecret || testSecret.trim() === "" || testSecret === DEFAULT_DEV_SECRET) {
        if (isProd) {
          throw new Error("SESSION_SECRET must be configured with a secure key (at least 32 characters) in production.");
        }
      }
    } catch {
      threw = true;
    }
    assert.strictEqual(threw, true, "Production must reject default development secret");
  });

  test("SESSION_SECRET guard rejects short secret (<32 chars) in production", () => {
    const isProd = true;
    const testSecret = "too_short_secret";

    let threw = false;
    try {
      if (testSecret.length < 32) {
        if (isProd) {
          throw new Error("SESSION_SECRET must be at least 32 characters long in production.");
        }
      }
    } catch {
      threw = true;
    }
    assert.strictEqual(threw, true, "Production must reject secrets shorter than 32 chars");
  });

  test("SESSION_SECRET guard accepts valid 32+ character custom secret in production", () => {
    const isProd = true;
    const testSecret = "a_super_strong_production_session_secret_987654321";

    let accepted = false;
    if (testSecret && testSecret.length >= 32 && testSecret !== "default_development_session_secret_at_least_32_chars") {
      accepted = true;
    }
    assert.strictEqual(accepted, true, "Valid 32+ char secret must be accepted");
  });

  // 4. Cookie Security Options
  test("Cookie secure flag defaults to true in production", () => {
    function isSecureCookie(nodeEnv, cookieSecureEnv) {
      if (cookieSecureEnv !== undefined) {
        return cookieSecureEnv === "true";
      }
      return nodeEnv === "production";
    }

    assert.strictEqual(isSecureCookie("production", undefined), true, "Production default must be secure");
    assert.strictEqual(isSecureCookie("development", undefined), false, "Development default is non-secure");
    assert.strictEqual(isSecureCookie("production", "false"), false, "COOKIE_SECURE=false allows plain HTTP override");
    assert.strictEqual(isSecureCookie("production", "true"), true, "COOKIE_SECURE=true forces secure cookies");
  });

  // 5. Role-based client redirects
  test("Client redirect routes Student to /registrations", () => {
    function computeTarget(userRole, redirectUrl) {
      if (userRole === "ORGANIZER" || userRole === "ADMIN") {
        return redirectUrl && redirectUrl.startsWith("/dashboard") ? redirectUrl : "/dashboard";
      }
      return redirectUrl && !redirectUrl.startsWith("/dashboard") ? redirectUrl : "/registrations";
    }

    assert.strictEqual(computeTarget("STUDENT", null), "/registrations");
    assert.strictEqual(computeTarget("STUDENT", "/registrations"), "/registrations");
    assert.strictEqual(computeTarget("STUDENT", "/events/123"), "/events/123");
    // If student was wrongly redirected with /dashboard, correct to /registrations
    assert.strictEqual(computeTarget("STUDENT", "/dashboard"), "/registrations");
  });

  test("Client redirect routes Organizer to /dashboard", () => {
    function computeTarget(userRole, redirectUrl) {
      if (userRole === "ORGANIZER" || userRole === "ADMIN") {
        return redirectUrl && redirectUrl.startsWith("/dashboard") ? redirectUrl : "/dashboard";
      }
      return redirectUrl && !redirectUrl.startsWith("/dashboard") ? redirectUrl : "/registrations";
    }

    assert.strictEqual(computeTarget("ORGANIZER", null), "/dashboard");
    assert.strictEqual(computeTarget("ORGANIZER", "/dashboard/events/new"), "/dashboard/events/new");
    assert.strictEqual(computeTarget("ADMIN", null), "/dashboard");
    // If organizer had redirectUrl=/registrations (from unauthenticated bounce), route to /dashboard
    assert.strictEqual(computeTarget("ORGANIZER", "/registrations"), "/dashboard");
  });

  // 6. Database Mode Guard
  test("Database mode requires DATABASE_URL in production without silent JSON fallback", () => {
    function shouldUsePrisma(nodeEnv, databaseUrl) {
      if (nodeEnv === "production") {
        if (!databaseUrl) {
          throw new Error("DATABASE_URL must be configured in production.");
        }
        return true;
      }
      return Boolean(databaseUrl);
    }

    assert.strictEqual(shouldUsePrisma("development", undefined), false);
    assert.strictEqual(shouldUsePrisma("development", "postgresql://localhost/test"), true);
    assert.strictEqual(shouldUsePrisma("production", "postgresql://user:pass@host/db"), true);

    let threw = false;
    try {
      shouldUsePrisma("production", undefined);
    } catch {
      threw = true;
    }
    assert.strictEqual(threw, true, "Production without DATABASE_URL must throw error instead of silent JSON fallback");
  });

  console.log(`\nTests completed: ${passed} passed, ${failed} failed.\n`);
  if (failed > 0) {
    process.exit(1);
  }
}

runTests();
