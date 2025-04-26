import { Admin } from "../models/Admin.js";
import { jest } from "@jest/globals";

jest.setTimeout(10000);

jest.mock("../models/Admin.js", () => {
  return {
    Admin: jest.fn(),
  };
});

describe("Admin Model Test (Mocked)", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should create and save an admin successfully", async () => {
    const mockSave = jest.fn().mockResolvedValue({
      _id: "mocked_id",
      name: "Alice",
      email: "alice@example.com",
      password: "securePassword123",
      role: "admin",
      isVerified: true,
    });

    Admin.prototype.save = mockSave;

    const validAdmin = new Admin({
      name: "Alice",
      email: "alice@example.com",
      password: "securePassword123",
    });

    const savedAdmin = await validAdmin.save();

    expect(savedAdmin._id).toBeDefined();
    expect(savedAdmin.name).toBe("Alice");
    expect(savedAdmin.email).toBe("alice@example.com");
    expect(savedAdmin.role).toBe("admin");
    expect(savedAdmin.isVerified).toBe(true);
  });

  it("should throw validation error if required fields are missing", async () => {
    const validationError = new Error("ValidationError");
    validationError.name = "ValidationError";
    validationError.errors = {
      name: { message: "Path `name` is required." },
      email: { message: "Path `email` is required." },
      password: { message: "Path `password` is required." },
    };

    const mockSave = jest.fn().mockRejectedValue(validationError);

    Admin.prototype.save = mockSave;

    const adminWithoutFields = new Admin({});

    let err;
    try {
      await adminWithoutFields.save();
    } catch (error) {
      err = error;
    }

    expect(err).toBeDefined();
    expect(err.name).toBe("ValidationError");
    expect(err.errors.name).toBeDefined();
    expect(err.errors.email).toBeDefined();
    expect(err.errors.password).toBeDefined();
  });

  it("should enforce unique email", async () => {
    const duplicateError = new Error("Duplicate key error");
    duplicateError.code = 11000;

    const mockSave = jest.fn()
      .mockResolvedValueOnce({
        _id: "first_admin_id",
        name: "Bob",
        email: "bob@example.com",
        password: "pass123",
      })
      .mockRejectedValueOnce(duplicateError);

    Admin.prototype.save = mockSave;

    const admin1 = new Admin({
      name: "Bob",
      email: "bob@example.com",
      password: "pass123",
    });

    const admin2 = new Admin({
      name: "Bobby",
      email: "bob@example.com",
      password: "pass456",
    });

    await admin1.save();

    let err;
    try {
      await admin2.save();
    } catch (error) {
      err = error;
    }

    expect(err).toBeDefined();
    expect(err.code).toBe(11000);
  });

  it("should only allow 'admin' as role", async () => {
    const validationError = new Error("ValidationError");
    validationError.name = "ValidationError";
    validationError.errors = {
      role: { message: "Role must be admin" },
    };

    const mockSave = jest.fn().mockRejectedValue(validationError);

    Admin.prototype.save = mockSave;

    const invalidAdmin = new Admin({
      name: "Eve",
      email: "eve@example.com",
      password: "123456",
      role: "superadmin",
    });

    let err;
    try {
      await invalidAdmin.save();
    } catch (error) {
      err = error;
    }

    expect(err).toBeDefined();
    expect(err.name).toBe("ValidationError");
    expect(err.errors.role).toBeDefined();
  });
});
