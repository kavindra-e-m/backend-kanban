const Admin = require("../models/admin");
const jwt = require("jsonwebtoken");

// Register Admin
exports.registerAdmin = async (req, res) => {
  try {
    const { name, email, password, role, permissions } = req.body;

    // Check if admin already exists
    const adminExists = await Admin.findOne({ email });
    if (adminExists) {
      return res.status(400).json({ message: "Admin already exists with this email" });
    }

    // Create new admin
    const admin = await Admin.create({
      name,
      email,
      password,
      role: role || "admin",
      permissions: permissions || ["read_users", "read_products"]
    });

    res.status(201).json({ 
      message: "Admin registered successfully",
      admin: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        role: admin.role
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Login Admin
exports.loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Please provide email and password" });
    }

    // Check for admin (include password field)
    const admin = await Admin.findOne({ email }).select("+password");
    
    if (!admin) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Check if password matches
    const isMatch = await admin.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Update last login
    admin.lastLogin = new Date();
    await admin.save();

    // Create JWT token
    const token = jwt.sign(
      { id: admin._id, role: admin.role },
      process.env.JWT_SECRET || "your_secret_key",
      { expiresIn: "7d" }
    );

    res.json({
      message: "Login successful",
      token,
      admin: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
        permissions: admin.permissions
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get All Admins
exports.getAllAdmins = async (req, res) => {
  try {
    const admins = await Admin.find({ isActive: true }).select("-password");
    res.json({
      count: admins.length,
      admins
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get Single Admin
exports.getAdminById = async (req, res) => {
  try {
    const admin = await Admin.findById(req.params.id).select("-password");
    
    if (!admin) {
      return res.status(404).json({ message: "Admin not found" });
    }

    res.json(admin);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update Admin
exports.updateAdmin = async (req, res) => {
  try {
    const { name, email, role, permissions, isActive } = req.body;
    const adminId = req.params.id;

    // Check if email is already taken by another admin
    if (email) {
      const existingAdmin = await Admin.findOne({ email, _id: { $ne: adminId } });
      if (existingAdmin) {
        return res.status(400).json({ message: "Email already in use" });
      }
    }

    const updateData = {};
    if (name) updateData.name = name;
    if (email) updateData.email = email;
    if (role) updateData.role = role;
    if (permissions) updateData.permissions = permissions;
    if (isActive !== undefined) updateData.isActive = isActive;

    const admin = await Admin.findByIdAndUpdate(
      adminId,
      updateData,
      { new: true, runValidators: true }
    ).select("-password");

    if (!admin) {
      return res.status(404).json({ message: "Admin not found" });
    }

    res.json({
      message: "Admin updated successfully",
      admin
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Change Password
exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const adminId = req.params.id;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: "Current and new password required" });
    }

    const admin = await Admin.findById(adminId).select("+password");

    if (!admin) {
      return res.status(404).json({ message: "Admin not found" });
    }

    // Verify current password
    const isMatch = await admin.matchPassword(currentPassword);
    if (!isMatch) {
      return res.status(401).json({ message: "Current password is incorrect" });
    }

    // Update password
    admin.password = newPassword;
    await admin.save();

    res.json({ message: "Password changed successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Delete Admin
exports.deleteAdmin = async (req, res) => {
  try {
    const admin = await Admin.findByIdAndDelete(req.params.id);

    if (!admin) {
      return res.status(404).json({ message: "Admin not found" });
    }

    res.json({ message: "Admin deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Deactivate Admin
exports.deactivateAdmin = async (req, res) => {
  try {
    const admin = await Admin.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    ).select("-password");

    if (!admin) {
      return res.status(404).json({ message: "Admin not found" });
    }

    res.json({
      message: "Admin deactivated successfully",
      admin
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get Admin Profile
exports.getProfile = async (req, res) => {
  try {
    const admin = await Admin.findById(req.admin.id).select("-password");
    
    if (!admin) {
      return res.status(404).json({ message: "Admin not found" });
    }

    res.json(admin);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update Own Profile
exports.updateProfile = async (req, res) => {
  try {
    const { name, email } = req.body;

    if (email) {
      const existingAdmin = await Admin.findOne({ email, _id: { $ne: req.admin.id } });
      if (existingAdmin) {
        return res.status(400).json({ message: "Email already in use" });
      }
    }

    const admin = await Admin.findByIdAndUpdate(
      req.admin.id,
      { name, email },
      { new: true, runValidators: true }
    ).select("-password");

    res.json({
      message: "Profile updated successfully",
      admin
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Grant Permissions
exports.grantPermission = async (req, res) => {
  try {
    const { adminId, permission } = req.body;

    const admin = await Admin.findById(adminId);
    
    if (!admin) {
      return res.status(404).json({ message: "Admin not found" });
    }

    if (!admin.permissions.includes(permission)) {
      admin.permissions.push(permission);
      await admin.save();
    }

    res.json({
      message: "Permission granted successfully",
      admin
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Revoke Permission
exports.revokePermission = async (req, res) => {
  try {
    const { adminId, permission } = req.body;

    const admin = await Admin.findById(adminId);
    
    if (!admin) {
      return res.status(404).json({ message: "Admin not found" });
    }

    admin.permissions = admin.permissions.filter(p => p !== permission);
    await admin.save();

    res.json({
      message: "Permission revoked successfully",
      admin
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
