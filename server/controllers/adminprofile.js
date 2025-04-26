import { Admin } from "../models/Admin.js";

export const getAdminProfile = async (req, res) => {
  try {
    const adminId = req.admin.id;
    if (!adminId) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    const admin = await Admin.findById(adminId).select("-password");

    if (!admin) {
      return res.status(404).json({ message: "Admin not found" });
    }

    res.status(200).json(admin);
  } catch (error) {
    console.error("Error fetching admin profile:", error);
    res.status(500).json({ message: "Failed to fetch admin profile" });
  }
};
