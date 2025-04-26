import { expect, jest } from "@jest/globals";
import { Admin } from "../../models/Admin.js";
import { registerAdmin } from "../../controllers/register.js";
import jwt from "jsonwebtoken";

jest.mock("bcrypt", () => ({
  hash: jest.fn().mockImplementation((password, salt) => {
    return Promise.resolve(`hashed_${password}_${salt}`);
  }),
}));

describe("registerAdmin controller", () => {
  const mockResponse = () => {
    const res = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    return res;
  };

  beforeEach(() => {
    jest.clearAllMocks();
    Admin.findOne = jest.fn();
  });

  it("registers a new admin successfully", async () => {
    Admin.findOne.mockResolvedValue(null);
    Admin.prototype.save = jest.fn().mockResolvedValue({
      _id: "680cb7b7cef35dbd053c7bc4",
      name: "Test Admin",
      email: "test@example.com",
      password: "hashedPassword123"
    });

    const req = {
      body: {
        name: "Test Admin",
        email: "test@example.com",
        password: "password123"
      }
    };
    const res = mockResponse();

    jest.spyOn(jwt, "sign").mockReturnValue("test-token");
    await registerAdmin(req, res);

    expect(Admin.findOne).toHaveBeenCalledWith({ email: "test@example.com" });
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        message: "Admin registered successfully!",
        token: "test-token",
      })
    );
  });

  it("fails when admin already exists", async () => {
    Admin.findOne.mockResolvedValue({
      _id: "680cb7b7cef35dbd053c7bc4",
      name: "Existing Admin",
      email: "test@example.com",
      password: "hashedPassword123"
    });

    const req = {
      body: {
        name: "Test Admin",
        email: "test@example.com",
        password: "password123"
      }
    };
    const res = mockResponse();

    jest.spyOn(jwt, "sign").mockReturnValue("test-token");
    await registerAdmin(req, res);

    expect(Admin.findOne).toHaveBeenCalledWith({ email: "test@example.com" });
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        message: "Admin email already exists."
      })
    );
  });
});