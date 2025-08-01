const express = require('express');
const { body, validationResult } = require('express-validator');
const { adminAuth } = require('../middleware/auth');
const {
  EducationRequest,
  EducationProgram,
  EnterpriseMember,
  PreferredDate,
  ConfirmedSchedule,
  Instructor,
  InstructorAssignment,
  InstructorAvailability,
  SubmittedDocument
} = require('../models');

const router = express.Router();

// Dashboard overview
router.get('/dashboard', adminAuth, async (req, res) => {
  try {
    const [
      totalRequests,
      pendingRequests,
      completedRequests,
      totalMembers,
      totalInstructors
    ] = await Promise.all([
      EducationRequest.count(),
      EducationRequest.count({ where: { status: 'pending' } }),
      EducationRequest.count({ where: { status: 'completed' } }),
      EnterpriseMember.count({ where: { isActive: true } }),
      Instructor.count({ where: { isActive: true } })
    ]);

    res.json({
      totalRequests,
      pendingRequests,
      completedRequests,
      totalMembers,
      totalInstructors
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all education requests (with pagination and filtering)
router.get('/requests', adminAuth, async (req, res) => {
  try {
    const { page = 1, limit = 10, status, search } = req.query;
    const offset = (page - 1) * limit;

    let whereClause = {};
    if (status) {
      whereClause.status = status;
    }

    let includeClause = [
      { model: EnterpriseMember, as: 'enterpriseMember' },
      { model: EducationProgram, as: 'program' },
      { model: PreferredDate, as: 'preferredDates' },
      { model: ConfirmedSchedule, as: 'confirmedSchedule' }
    ];

    if (search) {
      includeClause[0].where = {
        [require('sequelize').Op.or]: [
          { companyName: { [require('sequelize').Op.like]: `%${search}%` } },
          { managerName: { [require('sequelize').Op.like]: `%${search}%` } }
        ]
      };
    }

    const { count, rows } = await EducationRequest.findAndCountAll({
      where: whereClause,
      include: includeClause,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['createdAt', 'DESC']]
    });

    res.json({
      requests: rows,
      totalPages: Math.ceil(count / limit),
      currentPage: parseInt(page),
      totalRequests: count
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get single education request with full details
router.get('/requests/:requestId', adminAuth, async (req, res) => {
  try {
    const { requestId } = req.params;

    const request = await EducationRequest.findByPk(requestId, {
      include: [
        { model: EnterpriseMember, as: 'enterpriseMember' },
        { model: EducationProgram, as: 'program' },
        { model: PreferredDate, as: 'preferredDates' },
        {
          model: ConfirmedSchedule,
          as: 'confirmedSchedule',
          include: [{
            model: InstructorAssignment,
            as: 'instructorAssignments',
            include: [{ model: Instructor, as: 'instructor' }]
          }]
        },
        { model: SubmittedDocument, as: 'documents' }
      ]
    });

    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }

    res.json(request);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update request status
router.put('/requests/:requestId/status', adminAuth, [
  body('status').isIn(['pending', 'quote_sent', 'date_selecting', 'confirmed', 'document_pending', 'completed', 'cancelled'])
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { requestId } = req.params;
    const { status } = req.body;

    const request = await EducationRequest.findByPk(requestId);
    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }

    await request.update({ status });
    res.json({ message: 'Status updated successfully', request });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Confirm schedule for education request
router.post('/requests/:requestId/confirm-schedule', adminAuth, [
  body('confirmedDate').isISO8601().toDate(),
  body('startTime').matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
  body('endTime').matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
  body('location').optional().trim(),
  body('onlineLink').optional().isURL()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { requestId } = req.params;
    const { confirmedDate, startTime, endTime, location, onlineLink } = req.body;

    const request = await EducationRequest.findByPk(requestId);
    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }

    // Create confirmed schedule
    const schedule = await ConfirmedSchedule.create({
      educationRequestId: requestId,
      confirmedDate,
      startTime,
      endTime,
      location,
      onlineLink
    });

    // Update request status
    await request.update({ status: 'confirmed' });

    res.status(201).json({ message: 'Schedule confirmed successfully', schedule });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get available instructors for a specific date
router.get('/instructors/available/:date', adminAuth, async (req, res) => {
  try {
    const { date } = req.params;

    const availableInstructors = await Instructor.findAll({
      where: { isActive: true },
      include: [
        {
          model: InstructorAvailability,
          as: 'availabilities',
          where: {
            availableDate: date,
            isAvailable: true
          },
          required: true
        },
        {
          model: InstructorBlackoutDate,
          as: 'blackoutDates',
          where: { blackoutDate: date },
          required: false
        }
      ]
    });

    // Filter out instructors with blackout dates
    const filtered = availableInstructors.filter(instructor => 
      instructor.blackoutDates.length === 0
    );

    res.json(filtered);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all enterprise members
router.get('/members', adminAuth, async (req, res) => {
  try {
    const { page = 1, limit = 10, search } = req.query;
    const offset = (page - 1) * limit;

    let whereClause = {};
    if (search) {
      whereClause = {
        [require('sequelize').Op.or]: [
          { companyName: { [require('sequelize').Op.like]: `%${search}%` } },
          { managerName: { [require('sequelize').Op.like]: `%${search}%` } },
          { email: { [require('sequelize').Op.like]: `%${search}%` } }
        ]
      };
    }

    const { count, rows } = await EnterpriseMember.findAndCountAll({
      where: whereClause,
      attributes: { exclude: ['password'] },
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['createdAt', 'DESC']]
    });

    res.json({
      members: rows,
      totalPages: Math.ceil(count / limit),
      currentPage: parseInt(page),
      totalMembers: count
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Toggle member active status
router.put('/members/:memberId/toggle-status', adminAuth, async (req, res) => {
  try {
    const { memberId } = req.params;

    const member = await EnterpriseMember.findByPk(memberId);
    if (!member) {
      return res.status(404).json({ message: 'Member not found' });
    }

    await member.update({ isActive: !member.isActive });
    res.json({ message: 'Member status updated successfully', member });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get education programs
router.get('/programs', adminAuth, async (req, res) => {
  try {
    const programs = await EducationProgram.findAll({
      order: [['id', 'ASC']]
    });
    res.json(programs);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create or update education program
router.post('/programs', adminAuth, [
  body('programName').trim().isLength({ min: 1 }),
  body('description').optional().trim(),
  body('pricePerPerson').optional().isDecimal(),
  body('duration').optional().trim(),
  body('programLevel').isIn(['basic', 'intermediate', 'advanced', 'custom'])
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const program = await EducationProgram.create(req.body);
    res.status(201).json(program);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;