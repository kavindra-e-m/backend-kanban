const jwt = require("jsonwebtoken");
const Admin = require("../models/admin");

// Protect routes - verify JWT token
exports.protect = async (req, res, next) => {
  try {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      return res.status(401).json({ message: "Not authorized to access this route" });
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || "your_secret_key");
      req.admin = decoded;
      
      // Optionally verify admin still exists and is active
      const admin = await Admin.findById(decoded.id);
      if (!admin || !admin.isActive) {
        return res.status(401).json({ message: "Admin account is inactive or deleted" });
      }

      next();
    } catch (error) {
      return res.status(401).json({ message: "Not authorized to access this route" });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Authorize specific roles
exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.admin.role)) {
      return res.status(403).json({ 
        message: `User role '${req.admin.role}' is not authorized to access this route` 
      });
    }
    next();
  };
};

// Authorize specific permissions
exports.authorizePermission = (...permissions) => {
  return async (req, res, next) => {
    try {
      const admin = await Admin.findById(req.admin.id);
      
      const hasPermission = permissions.some(permission => 
        admin.permissions.includes(permission)
      );

      if (!hasPermission) {
        return res.status(403).json({ 
          message: "You do not have permission to access this resource" 
        });
      }

      next();
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };
};
