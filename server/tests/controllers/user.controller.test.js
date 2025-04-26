import { expect, jest } from "@jest/globals";
import { User } from "../../models/User.js";
import { Admin } from "../../models/Admin.js";
import { register, verifyUser, loginUser, myProfile } from "../../controllers/user.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import sendMail from "../../middlewares/sendMail.js";

jest.mock("bcrypt", () => ({
  hash: jest.fn(),
  compare: jest.fn()
}));

jest.mock("jsonwebtoken", () => ({
  sign: jest.fn(),
  verify: jest.fn()
}));

jest.mock("../../middlewares/sendMail.js", () => {
  return {
    ...jest.requireActual('../../middlewares/sendMail.js'),
    __esModule: true,
    default: jest.fn().mockImplementation(() => {
      return Promise.resolve();
    })
  }
});

describe("User controller", () => {
  const mockResponse = () => {
    const res = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    return res;
  };

  const TEST_USER = {
    _id: "user123",
    name: "Test User",
    email: "test@example.com",
    password: "hashedPassword123",
    role: "user",
    isVerified: false,
    save: jest.fn()
  };

  beforeEach(() => {
    jest.clearAllMocks();
    process.env.JWT_SECRET = "test-secret";
    User.findOne = jest.fn();
    User.findById = jest.fn();
    Admin.findById = jest.fn();
  });

  describe("register", () => {
    it("fails when user already exists", async () => {
      User.findOne.mockResolvedValue(TEST_USER);

      const req = {
        body: {
          name: "Test User",
          email: "test@example.com",
          password: "password123"
        }
      };
      const res = mockResponse();

      await register(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: "User already exists"
      });
    });
  });

  describe("verifyUser", () => {
    it("verifies user successfully with valid OTP", async () => {
      const mockUser = {
        ...TEST_USER,
        otp: "123456",
        otpCreatedAt: new Date(),
        save: jest.fn().mockResolvedValue(true)
      };
      User.findOne.mockResolvedValue(mockUser);
      jest.spyOn(jwt, "verify").mockReturnValue({ email: mockUser.email });

      const req = {
        body: {
          email: "test@example.com",
          otp: "123456",
          activationToken: "valid-token"
        }
      };
      const res = mockResponse();

      await verifyUser(req, res);

      expect(mockUser.save).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: "User verified successfully!"
      });
    });

    it("fails with invalid OTP", async () => {
      const mockUser = {
        ...TEST_USER,
        otp: "123456",
        otpCreatedAt: new Date(),
      };
      User.findOne.mockResolvedValue(mockUser);
      jest.spyOn(jwt, "verify").mockReturnValue({ email: mockUser.email });

      const req = {
        body: {
          email: "test@example.com",
          otp: "wrong-otp",
          activationToken: "valid-token"
        }
      };
      const res = mockResponse();

      await verifyUser(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: "Invalid OTP. Try again."
      });
    });
  });

  describe("loginUser", () => {
    it("logs in user successfully", async () => {
      const mockUser = {
        ...TEST_USER,
        isVerified: true
      };
      User.findOne.mockResolvedValue(mockUser);
      jest.spyOn(bcrypt, "compare").mockResolvedValue(true);
      jest.spyOn(jwt, "sign").mockReturnValue("test-token");

      const req = {
        body: {
          email: "test@example.com",
          password: "password123"
        }
      };
      const res = mockResponse();

      await loginUser(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: "User logged in successfully!",
        token: "test-token",
        user: mockUser
      });
    });

    it("fails with incorrect password", async () => {
      const mockUser = {
        ...TEST_USER,
        isVerified: true
      };
      User.findOne.mockResolvedValue(mockUser);
      bcrypt.compare.mockResolvedValue(false);

      const req = {
        body: {
          email: "test@example.com",
          password: "wrong-password"
        }
      };
      const res = mockResponse();

      await loginUser(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: "Wrong password."
      });
    });
  });

  describe("myProfile", () => {
    it("gets user profile successfully", async () => {
      const mockUser = {
        ...TEST_USER,
        isVerified: true
      };
      User.findById.mockImplementationOnce(() => {
        return {
          select: jest.fn().mockResolvedValue(mockUser)
        }
      })

      const req = {
        user: { _id: "user123", role: "user" }
      };
      const res = mockResponse();

      await myProfile(req, res);

      expect(User.findById).toHaveBeenCalledWith("user123");
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: "User profile fetched successfully!",
        user: mockUser
      });
    });

    it("gets admin profile successfully", async () => {
      const mockAdmin = {
        _id: "admin123",
        name: "Test Admin",
        email: "admin@example.com",
        role: "admin"
      };
      Admin.findById.mockImplementationOnce(() => {
        return {
          select: jest.fn().mockResolvedValue(mockAdmin)
        }
      })

      const req = {
        user: { _id: "admin123", role: "admin" }
      };
      const res = mockResponse();

      await myProfile(req, res);
      expect(Admin.findById).toHaveBeenCalledWith("admin123");
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: "User profile fetched successfully!",
        user: mockAdmin
      });
    });
  });
});