const express = require('express');
const multer = require('multer');
const path = require('path');
const { enterpriseAuth, adminAuth } = require('../middleware/auth');
const { SubmittedDocument } = require('../models');

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, '..', 'uploads');
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  // Allow specific file types
  const allowedTypes = ['.pdf', '.jpg', '.jpeg', '.png'];
  const fileExt = path.extname(file.originalname).toLowerCase();
  
  if (allowedTypes.includes(fileExt)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only PDF, JPG, JPEG, and PNG files are allowed.'));
  }
};

const upload = multer({
  storage: storage,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 10485760 // 10MB default
  },
  fileFilter: fileFilter
});

// Upload business license document
router.post('/business-license/:requestId', enterpriseAuth, upload.single('businessLicense'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const { requestId } = req.params;
    const { taxEmail, notes } = req.body;

    // Create document record
    const document = await SubmittedDocument.create({
      educationRequestId: requestId,
      documentType: 'business_license',
      fileName: req.file.originalname,
      filePath: req.file.path,
      fileSize: req.file.size,
      mimeType: req.file.mimetype,
      taxEmail,
      notes
    });

    res.status(201).json({
      message: 'File uploaded successfully',
      document: {
        id: document.id,
        fileName: document.fileName,
        fileSize: document.fileSize,
        uploadedAt: document.uploadedAt
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Upload instructor signature
router.post('/instructor-signature/:instructorId', adminAuth, upload.single('signature'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const { instructorId } = req.params;
    const { Instructor } = require('../models');

    const instructor = await Instructor.findByPk(instructorId);
    if (!instructor) {
      return res.status(404).json({ message: 'Instructor not found' });
    }

    // Update instructor with signature path
    await instructor.update({
      signatureImagePath: req.file.path
    });

    res.json({
      message: 'Signature uploaded successfully',
      signaturePath: req.file.filename
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Upload instructor profile image
router.post('/instructor-profile/:instructorId', adminAuth, upload.single('profileImage'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const { instructorId } = req.params;
    const { Instructor } = require('../models');

    const instructor = await Instructor.findByPk(instructorId);
    if (!instructor) {
      return res.status(404).json({ message: 'Instructor not found' });
    }

    // Update instructor with profile image path
    await instructor.update({
      profileImagePath: req.file.path
    });

    res.json({
      message: 'Profile image uploaded successfully',
      profileImagePath: req.file.filename
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get uploaded file
router.get('/file/:filename', (req, res) => {
  try {
    const { filename } = req.params;
    const filePath = path.join(__dirname, '..', 'uploads', filename);
    
    res.sendFile(filePath, (err) => {
      if (err) {
        res.status(404).json({ message: 'File not found' });
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Error handling for multer
router.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ message: 'File too large' });
    }
  }
  
  if (error.message === 'Invalid file type. Only PDF, JPG, JPEG, and PNG files are allowed.') {
    return res.status(400).json({ message: error.message });
  }
  
  next(error);
});

module.exports = router;