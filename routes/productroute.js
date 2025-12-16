const express = require("express");
const {
    createProduct,
    getProduct,
    getProductById,
    updateProduct,
    deleteProduct
} = require("../controllers/productcontroller");

const router = express.Router();

router.post("/", createProduct);
router.get("/", getProduct);
router.get("/:id", getProductById);
router.put("/:id", updateProduct);
router.delete("/:id", deleteProduct);

module.exports = router;