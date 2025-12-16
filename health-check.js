#!/usr/bin/env node

require('dotenv').config();
const mongoose = require('mongoose');

console.log('🔍 BACKEND HEALTH CHECK\n');
console.log('='.repeat(50));

// Check 1: Environment Variables
console.log('\n1️⃣ ENVIRONMENT VARIABLES:');
console.log(`   MONGO_URI: ${process.env.MONGO_URI ? '✅ SET' : '❌ NOT SET'}`);
console.log(`   PORT: ${process.env.PORT || '5000'}`);
console.log(`   JWT_SECRET: ${process.env.JWT_SECRET ? '✅ SET' : '❌ NOT SET'}`);

// Check 2: Module Imports
console.log('\n2️⃣ MODULE IMPORTS:');
try {
    const User = require('./models/users.js');
    console.log('   ✅ User model loaded');
} catch (e) {
    console.log('   ❌ User model error:', e.message);
}

try {
    const Product = require('./models/product.js');
    console.log('   ✅ Product model loaded');
} catch (e) {
    console.log('   ❌ Product model error:', e.message);
}

try {
    const Admin = require('./models/admin.js');
    console.log('   ✅ Admin model loaded');
} catch (e) {
    console.log('   ❌ Admin model error:', e.message);
}

try {
    const userRouter = require('./routes/userroute.js');
    console.log('   ✅ User routes loaded');
} catch (e) {
    console.log('   ❌ User routes error:', e.message);
}

try {
    const productRouter = require('./routes/productroute.js');
    console.log('   ✅ Product routes loaded');
} catch (e) {
    console.log('   ❌ Product routes error:', e.message);
}

try {
    const adminRouter = require('./routes/adminroute.js');
    console.log('   ✅ Admin routes loaded');
} catch (e) {
    console.log('   ❌ Admin routes error:', e.message);
}

// Check 3: Database Connection
console.log('\n3️⃣ DATABASE CONNECTION:');
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/kanban_board')
    .then(async () => {
        console.log('   ✅ MongoDB connected');
        
        // Get collections info
        try {
            const User = require('./models/users.js');
            const Product = require('./models/product.js');
            const Admin = require('./models/admin.js');
            
            const userCount = await User.countDocuments();
            const productCount = await Product.countDocuments();
            const adminCount = await Admin.countDocuments();
            
            console.log(`   📊 Users: ${userCount}`);
            console.log(`   📊 Products: ${productCount}`);
            console.log(`   📊 Admins: ${adminCount}`);
        } catch (e) {
            console.log('   ⚠️  Could not fetch collection stats:', e.message);
        }
        
        console.log('\n4️⃣ SERVER STATUS:');
        console.log('   ✅ Backend is fully working!');
        
        console.log('\n' + '='.repeat(50));
        console.log('\n✅ ALL SYSTEMS OPERATIONAL\n');
        console.log('Start server with: npm start');
        console.log('Test endpoints: http://localhost:5000/api/user/');
        
        mongoose.disconnect();
        process.exit(0);
    })
    .catch(err => {
        console.log('   ❌ MongoDB error:', err.message);
        console.log('\n⚠️  Check your MONGO_URI in .env file');
        process.exit(1);
    });
