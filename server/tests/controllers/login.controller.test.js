import { expect, jest } from "@jest/globals";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { Admin } from "../../models/Admin.js";
import { loginAdmin } from "../../controllers/login.js";

jest.mock("bcrypt", () => ({
  compare: jest.fn().mockImplementation((password, hash) => {
    return Promise.resolve(password === hash);
  }),
  hash: jest.fn().mockImplementation((password, salt) => {
    return Promise.resolve(`hashed_${password}_${salt}`);
  }),
}));
jest.mock("jsonwebtoken", () => ({ sign: jest.fn() }));

// jest.mock("bcrypt", () => ({
//   __esModule: true,
//   default: {
//     compare: jest.fn(),
//   },
// }));

// jest.mock("jsonwebtoken", () => ({
//   __esModule: true,
//   default: {
//     sign: jest.fn(),
//   },
// }));

describe("loginAdmin controller", () => {
  const mockResponse = () => {
    const res = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json   = jest.fn().mockReturnValue(res);
    return res;
  };

  const TEST_ADMIN = {
    _id:       "admin123",
    name:      "Test Admin",
    email:     "admin@test.com",
    password:  "hashedPassword123",
    isVerified:true,
    role:      "admin",
  };

  beforeEach(() => {
    jest.clearAllMocks();
    process.env.JWT_SECRET = "test-secret";

    Admin.findOne = jest.fn();
  });

  it("logs in an admin successfully", async () => {
    Admin.findOne.mockResolvedValue(TEST_ADMIN);

    const req = {
      body: { email: "admin@test.com", password: "hashedPassword123" }
    };
    const res = mockResponse();

    jest.spyOn(bcrypt, "compare").mockResolvedValue(true);
    jest.spyOn(jwt, "sign").mockReturnValue("test-token");

    await loginAdmin(req, res);

    expect(Admin.findOne)
      .toHaveBeenCalledWith({ email: "admin@test.com" });

    expect(bcrypt.compare).toHaveBeenCalledWith(
      "hashedPassword123",
      TEST_ADMIN.password
    );
    expect(jwt.sign).toHaveBeenCalledWith(
      { id: TEST_ADMIN._id, role: TEST_ADMIN.role },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      message: "Admin login successful!",
      token:   "test-token",
      admin:   { 
        id:    TEST_ADMIN._id,
        name:  TEST_ADMIN.name,
        email: TEST_ADMIN.email
      },
    });
  });

  it("rejects an unverified admin", async () => {
    const unverified = { ...TEST_ADMIN, isVerified: false };
    Admin.findOne.mockResolvedValue(unverified);

    const req = { body: { email: "admin@test.com", password: "password123" } };
    const res = mockResponse();

    await loginAdmin(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      message: "Admin is not verified.",
    });
  });

  it("rejects when the password is wrong", async () => {
    Admin.findOne.mockResolvedValue(TEST_ADMIN);

    const req = { body: { email: "admin@test.com", password: "wrongpass" } };
    const res = mockResponse();
    jest.spyOn(bcrypt, "compare").mockResolvedValue(false);

    await loginAdmin(req, res);

    expect(bcrypt.compare).toHaveBeenCalledWith(
      "wrongpass",
      TEST_ADMIN.password
    );
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      message: "Wrong password.",
    });
  });

  it("rejects a non-existent admin", async () => {
    Admin.findOne.mockResolvedValue(null);

    const req = { body: { email: "noone@test.com", password: "pw" } };
    const res = mockResponse();

    await loginAdmin(req, res);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({
      message: "Access denied. Not an admin.",
    });
  });

  it("handles database errors", async () => {
    Admin.findOne.mockRejectedValue(new Error("DB Error"));

    const req = { body: { email: "admin@test.com", password: "pw" } };
    const res = mockResponse();

    await loginAdmin(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      message: "Internal Server Error",
      error:   "DB Error",
    });
  });

  it("trims and lower-cases the email before lookup", async () => {
    Admin.findOne.mockResolvedValue(TEST_ADMIN);
    jwt.sign.mockReturnValue("test-token");

    const req = {
      body: { email: "  ADMIN@TEST.COM  ", password: "password123" }
    };
    const res = mockResponse();

    await loginAdmin(req, res);

    expect(Admin.findOne)
      .toHaveBeenCalledWith({ email: "admin@test.com" });
  });
});
