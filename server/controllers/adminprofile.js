import { Admin } from "../models/Admin.js"; // ✅ Ensure correct model import

export const getAdminProfile = async (req, res) => {
  try {
    const adminId = req.admin.id; // ✅ Ensure the ID is extracted from auth middleware
    const admin = await Admin.findById(adminId).select("-password"); // ✅ Exclude password field

    if (!admin) {
      return res.status(404).json({ message: "Admin not found" });
    }

    res.status(200).json(admin);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch admin profile" });
  }
};
