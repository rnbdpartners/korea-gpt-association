const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const { EnterpriseMember } = require('../models');

const router = express.Router();

// Generate JWT token
const generateToken = (payload) => {
  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE
  });
};

// Register enterprise member
router.post('/register', [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 }),
  body('managerName').trim().isLength({ min: 1 }),
  body('position').trim().isLength({ min: 1 }),
  body('phone').trim().isLength({ min: 1 }),
  body('companyName').trim().isLength({ min: 1 }),
  body('businessNumber').trim().isLength({ min: 1 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      email,
      password,
      managerName,
      position,
      phone,
      companyName,
      businessNumber,
      industry,
      employeeCount
    } = req.body;

    // Check if user already exists
    const existingMember = await EnterpriseMember.findOne({ where: { email } });
    if (existingMember) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create new member
    const member = await EnterpriseMember.create({
      email,
      password: hashedPassword,
      managerName,
      position,
      phone,
      companyName,
      businessNumber,
      industry,
      employeeCount
    });

    // Generate token
    const token = generateToken({
      id: member.id,
      email: member.email,
      role: 'enterprise'
    });

    res.status(201).json({
      message: 'Registration successful',
      token,
      user: {
        id: member.id,
        email: member.email,
        managerName: member.managerName,
        companyName: member.companyName
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Login enterprise member
router.post('/login', [
  body('email').isEmail().normalizeEmail(),
  body('password').exists()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    // Find member
    const member = await EnterpriseMember.findOne({ where: { email } });
    if (!member) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Check if account is active
    if (!member.isActive) {
      return res.status(400).json({ message: 'Account is deactivated' });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, member.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Generate token
    const token = generateToken({
      id: member.id,
      email: member.email,
      role: 'enterprise'
    });

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: member.id,
        email: member.email,
        managerName: member.managerName,
        companyName: member.companyName
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Admin login
router.post('/admin/login', [
  body('email').isEmail().normalizeEmail(),
  body('password').exists()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    // Check admin credentials
    if (email !== process.env.ADMIN_EMAIL || password !== process.env.ADMIN_PASSWORD) {
      return res.status(400).json({ message: 'Invalid admin credentials' });
    }

    // Generate token
    const token = generateToken({
      id: 'admin',
      email: email,
      role: 'admin'
    });

    res.json({
      message: 'Admin login successful',
      token,
      user: {
        id: 'admin',
        email: email,
        role: 'admin'
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;