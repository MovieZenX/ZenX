import { describe, it, after } from "node:test";
import assert from "node:assert/strict";
import { hashPassword, verifyPassword } from "../src/lib/auth/password";
import {
  validateEmail,
  validateUsername,
  validatePassword,
  validateRegistrationInput,
} from "../src/lib/auth/validation";
import { encryptSession, decryptSession, SessionPayload } from "../src/lib/auth/session";
import { prisma } from "../src/lib/db";

describe("Phase 7 — Authentication & User Sessions Tests", () => {
  describe("Password Hashing & Verification Security", () => {
    it("hashes password with bcrypt (not plaintext)", async () => {
      const plaintext = "SuperSecret123!";
      const hash = await hashPassword(plaintext);

      assert.notEqual(hash, plaintext);
      assert.ok(hash.startsWith("$2a$") || hash.startsWith("$2b$"));
    });

    it("verifies correct password against hash", async () => {
      const password = "ValidPassword123";
      const hash = await hashPassword(password);
      const isMatch = await verifyPassword(password, hash);

      assert.equal(isMatch, true);
    });

    it("rejects incorrect password against hash", async () => {
      const password = "ValidPassword123";
      const hash = await hashPassword(password);
      const isMatch = await verifyPassword("WrongPassword999", hash);

      assert.equal(isMatch, false);
    });

    it("uses unique salts for identical passwords", async () => {
      const password = "IdenticalPassword1";
      const hash1 = await hashPassword(password);
      const hash2 = await hashPassword(password);

      assert.notEqual(hash1, hash2);
      assert.equal(await verifyPassword(password, hash1), true);
      assert.equal(await verifyPassword(password, hash2), true);
    });
  });

  describe("Input Validation Rules", () => {
    it("validates correct email addresses", () => {
      assert.equal(validateEmail("user@example.com").isValid, true);
      assert.equal(validateEmail("john.doe+filter@domain.co.uk").isValid, true);
      assert.equal(validateEmail("test_123@sub.domain.org").isValid, true);
    });

    it("rejects invalid email addresses", () => {
      assert.equal(validateEmail("plainaddress").isValid, false);
      assert.equal(validateEmail("@missinguser.com").isValid, false);
      assert.equal(validateEmail("missingdomain@").isValid, false);
      assert.equal(validateEmail("has spaces@example.com").isValid, false);
      assert.equal(validateEmail("").isValid, false);
    });

    it("validates compliant usernames (3-30 chars, alphanumeric + underscores + hyphens)", () => {
      assert.equal(validateUsername("alice").isValid, true);
      assert.equal(validateUsername("bob_123").isValid, true);
      assert.equal(validateUsername("user_name_valid").isValid, true);
    });

    it("rejects invalid usernames", () => {
      assert.equal(validateUsername("ab").isValid, false); // too short
      assert.equal(validateUsername("a".repeat(31)).isValid, false); // too long
      assert.equal(validateUsername("user name").isValid, false); // space not allowed
      assert.equal(validateUsername("user@name").isValid, false); // special char not allowed
      assert.equal(validateUsername("").isValid, false);
    });

    it("validates compliant passwords (relaxed freedom policy, min 4 chars)", () => {
      assert.equal(validatePassword("1234").isValid, true);
      assert.equal(validatePassword("pass").isValid, true);
      assert.equal(validatePassword("SecurePass1").isValid, true);
      assert.equal(validatePassword("nouppercase123").isValid, true);
      assert.equal(validatePassword("NOLOWERCASE123").isValid, true);
      assert.equal(validatePassword("NoNumberPassword").isValid, true);
    });

    it("rejects non-compliant passwords with descriptive error messages", () => {
      const empty = validatePassword("");
      assert.equal(empty.isValid, false);
      assert.match(empty.error || "", /required/i);

      const short = validatePassword("123");
      assert.equal(short.isValid, false);
      assert.match(short.error || "", /at least 4 characters/i);
    });

    it("performs comprehensive registration input validation", () => {
      const valid = validateRegistrationInput({
        email: "user@example.com",
        username: "valid_user",
        password: "StrongPassword1",
        confirmPassword: "StrongPassword1",
      });
      assert.equal(valid.isValid, true);

      const badEmail = validateRegistrationInput({
        email: "bad-email",
        username: "valid_user",
        password: "StrongPassword1",
        confirmPassword: "StrongPassword1",
      });
      assert.equal(badEmail.isValid, false);
      assert.match(badEmail.error || "", /email/i);

      const badUser = validateRegistrationInput({
        email: "user@example.com",
        username: "u",
        password: "StrongPassword1",
        confirmPassword: "StrongPassword1",
      });
      assert.equal(badUser.isValid, false);
      assert.match(badUser.error || "", /username/i);

      const weakPass = validateRegistrationInput({
        email: "user@example.com",
        username: "valid_user",
        password: "123",
        confirmPassword: "123",
      });
      assert.equal(weakPass.isValid, false);
      assert.match(weakPass.error || "", /password/i);

      const mismatch = validateRegistrationInput({
        email: "user@example.com",
        username: "valid_user",
        password: "StrongPassword1",
        confirmPassword: "DifferentPassword1",
      });
      assert.equal(mismatch.isValid, false);
      assert.match(mismatch.error || "", /match/i);
    });
  });

  describe("Session Token Encryption & Verification", () => {
    it("encrypts and decrypts session token payload successfully", () => {
      const now = Date.now();
      const payload: SessionPayload = {
        userId: "usr_test_12345",
        username: "moviefan",
        email: "test@streamvault.local",
        createdAt: now,
        expiresAt: now + 3600 * 1000,
      };

      const token = encryptSession(payload);
      assert.ok(typeof token === "string");
      assert.ok(token.length > 50);

      // Plaintext user data must not be visible in raw encrypted token
      assert.ok(!token.includes("usr_test_12345"));
      assert.ok(!token.includes("moviefan"));
      assert.ok(!token.includes("test@streamvault.local"));

      const decrypted = decryptSession(token);
      assert.ok(decrypted !== null);
      assert.equal(decrypted?.userId, payload.userId);
      assert.equal(decrypted?.username, payload.username);
      assert.equal(decrypted?.email, payload.email);
    });

    it("rejects tampered session tokens (AES-GCM tag verification)", () => {
      const now = Date.now();
      const token = encryptSession({
        userId: "user1",
        username: "alice",
        email: "a@a.com",
        createdAt: now,
        expiresAt: now + 3600 * 1000,
      });

      // Reliably tamper with characters in the authentication tag / ciphertext
      const flipChar = token[30] === "a" ? "b" : "a";
      const tampered = token.slice(0, 30) + flipChar + token.slice(31);
      const result = decryptSession(tampered);
      assert.equal(result, null);
    });

    it("rejects expired session tokens", () => {
      const now = Date.now();
      const token = encryptSession({
        userId: "user1",
        username: "alice",
        email: "a@a.com",
        createdAt: now - 5000,
        expiresAt: now - 1000, // expired 1 sec ago
      });
      const result = decryptSession(token);
      assert.equal(result, null);
    });

    it("rejects malformed token strings", () => {
      assert.equal(decryptSession(""), null);
      assert.equal(decryptSession("invalid.token"), null);
      assert.equal(decryptSession("not-even-base64"), null);
    });
  });

  describe("Database User Creation & Uniqueness Integrity", () => {
    const uniqueSuffix = Date.now();
    const testEmail = `test_${uniqueSuffix}@streamvault.local`;
    const testUsername = `user_${uniqueSuffix}`;
    let createdUserId: string | null = null;

    after(async () => {
      if (createdUserId) {
        await prisma.userPreferences.deleteMany({ where: { userId: createdUserId } });
        await prisma.user.deleteMany({ where: { id: createdUserId } });
      }
    });

    it("creates a user with hashed password and default preferences in SQLite", async () => {
      const hashedPassword = await hashPassword("ValidPassword123!");

      const user = await prisma.user.create({
        data: {
          email: testEmail,
          username: testUsername,
          passwordHash: hashedPassword,
          preferences: {
            create: {
              preferredQuality: "auto",
              autoplay: true,
              subtitlesEnabled: false,
              language: "en",
            },
          },
        },
        include: {
          preferences: true,
        },
      });

      createdUserId = user.id;
      assert.ok(user.id.length > 0);
      assert.equal(user.email, testEmail);
      assert.equal(user.username, testUsername);
      assert.notEqual(user.passwordHash, "ValidPassword123!");
      assert.ok(user.passwordHash.startsWith("$2a$") || user.passwordHash.startsWith("$2b$"));
      assert.ok(user.preferences !== null);
      assert.equal(user.preferences?.preferredQuality, "auto");
    });

    it("enforces unique email constraint in database", async () => {
      assert.ok(createdUserId !== null, "Initial user must exist");
      const hashedPassword = await hashPassword("AnotherPass123!");

      await assert.rejects(
        async () => {
          await prisma.user.create({
            data: {
              email: testEmail, // duplicate email
              username: `diff_${Date.now()}`,
              passwordHash: hashedPassword,
            },
          });
        },
        (err: unknown) => {
          return typeof err === "object" && err !== null && "code" in err && err.code === "P2002";
        }
      );
    });

    it("enforces unique username constraint in database", async () => {
      assert.ok(createdUserId !== null, "Initial user must exist");
      const hashedPassword = await hashPassword("AnotherPass123!");

      await assert.rejects(
        async () => {
          await prisma.user.create({
            data: {
              email: `diff_${Date.now()}@streamvault.local`,
              username: testUsername, // duplicate username
              passwordHash: hashedPassword,
            },
          });
        },
        (err: unknown) => {
          return typeof err === "object" && err !== null && "code" in err && err.code === "P2002";
        }
      );
    });
  });
});
