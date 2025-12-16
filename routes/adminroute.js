const express = require("express");
const router = express.Router();
const adminController = require("../controllers/admincontroller");
const { protect, authorize } = require("../middleware/auth");

// Public routes
router.post("/register", adminController.registerAdmin);
router.post("/login", adminController.loginAdmin);

// Protected routes - require authentication
router.use(protect);

// Admin profile routes
router.get("/profile", adminController.getProfile);
router.put("/profile", adminController.updateProfile);
router.put("/:id/change-password", adminController.changePassword);

// Admin management routes - requires superadmin
router.use(authorize("superadmin"));

router.get("/", adminController.getAllAdmins);
router.get("/:id", adminController.getAdminById);
router.put("/:id", adminController.updateAdmin);
router.delete("/:id", adminController.deleteAdmin);
router.put("/:id/deactivate", adminController.deactivateAdmin);
router.post("/grant-permission", adminController.grantPermission);
router.post("/revoke-permission", adminController.revokePermission);

module.exports = router;