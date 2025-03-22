import jwt from "jsonwebtoken";

export const verifyAdmin = (req, res, next) => {
  const token = req.header("Authorization");

  if (!token) {
    console.log(`Unauthorized - No token provided`);
    return res
      .status(401)
      .json({ message: "Unauthorized - No token provided" });
  }

  try {
    const decoded = jwt.verify(
      token.replace("Bearer ", ""),
      process.env.JWT_SECRET
    );
    if (decoded.role !== "admin") {
      console.log(`Access denied - Admins only`);
      return res.status(403).json({ message: "Access denied - Admins only" });
    }
    req.admin = decoded;
    next();
  } catch (error) {
    console.error("Error verifying token:", error);
    res.status(401).json({ message: "Invalid token" });
  }
};
