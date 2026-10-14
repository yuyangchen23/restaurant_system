import { describe, it, expect, vi } from "vitest";
import { prisma } from "../../src/lib/prisma";
import { loginUser, registerUser } from "../../src/services/authServices"
import bcrypt from "bcryptjs";

vi.mock("../../src/lib/prisma", () => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
      create: vi.fn(),
    },
  },
}));

// vi.mock("")

describe("User login checkpoint", () => {

  it("logs in with the valid account", async () => {
    const password = "password123";
    const fakeUser = {
      id: "test-user-id-1",
      email: "testtest123@gmail.com",
      passwordHash: await bcrypt.hash(password, 4),
      roleId: 3,
      role: { name: "Staff" },
      createdAt: new Date(),
      updatedAt: new Date()
    };

    vi.mocked(prisma.user.findUnique).mockResolvedValue(fakeUser);

    const result = await loginUser(fakeUser.email, password);

    expect(result).toMatchObject({
      id: fakeUser.id,
      email: fakeUser.email,
      role: { name: "Staff" },
    });
    expect(result).not.toHaveProperty("passwordHash");
  });

  it("Login with invlaid account", async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue(null);

    await expect(
      loginUser("fakeinvalid@gmail.com", "invalid12345")
    ).rejects.toMatchObject({
      statusCode: 401,
      message: "Invalid email or password"
    });
  });

  it("Log in with a wrong password", async () => {
    const password = "password123";
    const fakeUser = {
      id: "test-fake-id-2",
      email: "testtest@gmail.com",
      passwordHash: await bcrypt.hash(password, 4),
      roleId: 3,
      role: { name: "Staff" },
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    vi.mocked(prisma.user.findUnique).mockResolvedValue(fakeUser);

    await expect(
      loginUser(fakeUser.email, "password12")
    ).rejects.toMatchObject({
      statusCode: 401,
      message: "Invalid email or password",
    });
  });
});

describe("Register user checkpoint", () => {
    it("login with a valid credential", async () => {
      const password = "testtest123";
      const fakeUser = {
        id: "test-id-3",
        email: "testtest@gmail.com",
        passwordHash: await bcrypt.hash(password, 4),
        roleId: 3,
        role: { name: "Staff" },
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      vi.mocked(prisma.user.create).mockResolvedValue(fakeUser);

      const result = await registerUser(fakeUser.email, password, "Staff");

      expect(prisma.user.create).toHaveBeenCalledOnce();
      expect(result.id).toBe(fakeUser.id);
      expect(result.email).toBe(fakeUser.email);
      expect(result.role).toBe(fakeUser.role);
    });
  });