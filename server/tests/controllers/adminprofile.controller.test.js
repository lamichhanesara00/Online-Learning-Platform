import { jest } from "@jest/globals";
import { Admin } from "../../models/Admin.js";
import { getAdminProfile } from "../../controllers/adminprofile.js";

jest.setTimeout(10000);
const mockResponse = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

describe("getAdminProfile Controller", () => {
  beforeEach(() => {
    jest.clearAllMocks();

    // Mock Admin model methods
    Admin.findById = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should return admin profile if admin exists", async () => {
    const admin = {
      _id: 'admin123',
      name: "Test Admin",
      email: "admin@test.com",
    };

    // Admin.findById.mockResolvedValueOnce(admin);
    Admin.findById.mockImplementationOnce(() => {
      return {
        select: jest.fn().mockResolvedValue(admin),
      };
    });

    const req = { admin: { id: admin._id } };
    const res = mockResponse();

    await getAdminProfile(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        _id: admin._id,
        name: "Test Admin",
        email: "admin@test.com",
      })
    );
  });

  it("should return 404 if admin not found", async () => {
    const req = { admin: { id: 'admin123' } };
    const res = mockResponse();

 Admin.findById.mockImplementationOnce(() => {
      return {
        select: jest.fn().mockResolvedValue(null),
      };
    });



    await getAdminProfile(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: "Admin not found" });
  });

  it("should handle internal server errors", async () => {
    const req = { admin: {} };
    const res = mockResponse();

    await getAdminProfile(req, res);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      message: "Unauthorized",
    });
  });
});
