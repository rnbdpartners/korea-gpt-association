const express = require('express');
const { body, validationResult } = require('express-validator');
const { adminAuth } = require('../middleware/auth');
const {
  Instructor,
  InstructorAvailability,
  InstructorAssignment,
  InstructorLectureHistory,
  InstructorSpecialty,
  InstructorBlackoutDate,
  EducationProgram,
  ConfirmedSchedule,
  EducationRequest,
  EnterpriseMember
} = require('../models');

const router = express.Router();

// Get all instructors
router.get('/', adminAuth, async (req, res) => {
  try {
    const instructors = await Instructor.findAll({
      where: { isActive: true },
      include: [
        { model: InstructorSpecialty, as: 'specialties', include: [{ model: EducationProgram, as: 'program' }] }
      ],
      order: [['name', 'ASC']]
    });
    res.json(instructors);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create new instructor
router.post('/', adminAuth, [
  body('name').trim().isLength({ min: 1 }),
  body('birthDate').isISO8601().toDate(),
  body('phone').trim().isLength({ min: 1 }),
  body('email').isEmail().normalizeEmail(),
  body('carModel').optional().trim(),
  body('carNumber').optional().trim(),
  body('specialty').optional().trim(),
  body('bio').optional().trim(),
  body('hourlyRate').optional().isDecimal()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // Check if email already exists
    const existingInstructor = await Instructor.findOne({
      where: { email: req.body.email }
    });

    if (existingInstructor) {
      return res.status(400).json({ message: 'Instructor with this email already exists' });
    }

    const instructor = await Instructor.create(req.body);
    res.status(201).json(instructor);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update instructor
router.put('/:instructorId', adminAuth, async (req, res) => {
  try {
    const { instructorId } = req.params;
    const instructor = await Instructor.findByPk(instructorId);

    if (!instructor) {
      return res.status(404).json({ message: 'Instructor not found' });
    }

    await instructor.update(req.body);
    res.json(instructor);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get instructor availability calendar
router.get('/availability/:year/:month', adminAuth, async (req, res) => {
  try {
    const { year, month } = req.params;
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);

    const availability = await InstructorAvailability.findAll({
      where: {
        availableDate: {
          [require('sequelize').Op.between]: [startDate, endDate]
        }
      },
      include: [
        { model: Instructor, as: 'instructor', where: { isActive: true } }
      ],
      order: [['availableDate', 'ASC'], ['startTime', 'ASC']]
    });

    res.json(availability);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Set instructor availability
router.post('/:instructorId/availability', adminAuth, [
  body('availableDate').isISO8601().toDate(),
  body('startTime').matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
  body('endTime').matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
  body('isAvailable').optional().isBoolean(),
  body('notes').optional().trim()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { instructorId } = req.params;
    const { availableDate, startTime, endTime, isAvailable = true, notes } = req.body;

    const instructor = await Instructor.findByPk(instructorId);
    if (!instructor) {
      return res.status(404).json({ message: 'Instructor not found' });
    }

    const availability = await InstructorAvailability.create({
      instructorId,
      availableDate,
      startTime,
      endTime,
      isAvailable,
      notes
    });

    res.status(201).json(availability);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Set blackout dates
router.post('/:instructorId/blackout', adminAuth, [
  body('blackoutDate').isISO8601().toDate(),
  body('reason').optional().trim()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { instructorId } = req.params;
    const { blackoutDate, reason } = req.body;

    const blackout = await InstructorBlackoutDate.create({
      instructorId,
      blackoutDate,
      reason
    });

    res.status(201).json(blackout);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Assign instructor to confirmed schedule
router.post('/assign', adminAuth, [
  body('confirmedScheduleId').isInt(),
  body('instructorId').isInt(),
  body('assignmentType').optional().isIn(['main', 'assistant']),
  body('notes').optional().trim()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { confirmedScheduleId, instructorId, assignmentType = 'main', notes } = req.body;

    // Check if schedule and instructor exist
    const schedule = await ConfirmedSchedule.findByPk(confirmedScheduleId);
    const instructor = await Instructor.findByPk(instructorId);

    if (!schedule || !instructor) {
      return res.status(404).json({ message: 'Schedule or instructor not found' });
    }

    // Check if instructor is available on that date
    const isAvailable = await instructor.isAvailableOn(schedule.confirmedDate);
    if (!isAvailable) {
      return res.status(400).json({ message: 'Instructor is not available on this date' });
    }

    const assignment = await InstructorAssignment.create({
      confirmedScheduleId,
      instructorId,
      assignmentType,
      assignedBy: req.user.id,
      notes
    });

    res.status(201).json(assignment);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get instructor lecture history
router.get('/:instructorId/history', adminAuth, async (req, res) => {
  try {
    const { instructorId } = req.params;
    const { startDate, endDate } = req.query;

    let whereClause = { instructorId };
    if (startDate && endDate) {
      whereClause.lectureDate = {
        [require('sequelize').Op.between]: [startDate, endDate]
      };
    }

    const history = await InstructorLectureHistory.findAll({
      where: whereClause,
      include: [
        {
          model: EducationRequest,
          as: 'educationRequest',
          include: [{ model: EnterpriseMember, as: 'enterpriseMember' }]
        }
      ],
      order: [['lectureDate', 'DESC']]
    });

    res.json(history);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get instructor monthly stats
router.get('/:instructorId/stats/:year/:month', adminAuth, async (req, res) => {
  try {
    const { instructorId, year, month } = req.params;
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);

    const stats = await InstructorLectureHistory.calculateInstructorStats(
      instructorId,
      startDate,
      endDate
    );

    res.json(stats);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;