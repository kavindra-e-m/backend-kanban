const Product = require('../models/product');

// Create Product
exports.createProduct = async (req, res) => {
    try {
        const { name, price, description, category, stock } = req.body;

        // Validation
        if (!name || !price) {
            return res.status(400).json({ message: "Name and price are required" });
        }

        const product = await Product.create({
            name,
            price,
            description: description || "",
            category: category || "General",
            stock: stock || 0
        });

        res.status(201).json({
            message: "Product created successfully",
            product
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get All Products
exports.getProduct = async (req, res) => {
    try {
        const products = await Product.find({});
        res.json({
            count: products.length,
            products
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get Product By ID
exports.getProductById = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);

        if (!product) {
            return res.status(404).json({ message: "Product not found" });
        }

        res.json(product);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Update Product
exports.updateProduct = async (req, res) => {
    try {
        const { name, price, description, category, stock } = req.body;

        const updateData = {};
        if (name) updateData.name = name;
        if (price) updateData.price = price;
        if (description !== undefined) updateData.description = description;
        if (category) updateData.category = category;
        if (stock !== undefined) updateData.stock = stock;

        const product = await Product.findByIdAndUpdate(
            req.params.id,
            updateData,
            { new: true, runValidators: true }
        );

        if (!product) {
            return res.status(404).json({ message: "Product not found" });
        }

        res.json({
            message: "Product updated successfully",
            product
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Delete Product
exports.deleteProduct = async (req, res) => {
    try {
        const product = await Product.findByIdAndDelete(req.params.id);

        if (!product) {
            return res.status(404).json({ message: "Product not found" });
        }

        res.json({ message: "Product deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
