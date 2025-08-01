const express = require('express');
const { body, validationResult } = require('express-validator');
const { enterpriseAuth } = require('../middleware/auth');
const {
  EducationRequest,
  EducationProgram,
  PreferredDate,
  ConfirmedSchedule,
  SubmittedDocument,
  EnterpriseMember
} = require('../models');

const router = express.Router();

// Get education programs
router.get('/programs', async (req, res) => {
  try {
    const programs = await EducationProgram.findAll({
      where: { isActive: true },
      order: [['id', 'ASC']]
    });
    res.json(programs);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Submit education request
router.post('/request', enterpriseAuth, [
  body('programId').isInt(),
  body('participantsCount').isInt({ min: 1 }),
  body('educationType').isIn(['offline', 'online', 'hybrid']),
  body('duration').optional().trim(),
  body('specialRequest').optional().trim()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      programId,
      participantsCount,
      educationType,
      duration,
      specialRequest
    } = req.body;

    // Get program info for price calculation
    const program = await EducationProgram.findByPk(programId);
    if (!program) {
      return res.status(404).json({ message: 'Program not found' });
    }

    let estimatedAmount = null;
    if (program.pricePerPerson) {
      estimatedAmount = program.pricePerPerson * participantsCount;
    }

    // Create education request
    const request = await EducationRequest.create({
      enterpriseMemberId: req.user.id,
      programId,
      participantsCount,
      educationType,
      duration,
      specialRequest,
      estimatedAmount
    });

    const requestWithDetails = await EducationRequest.findByPk(request.id, {
      include: [
        { model: EducationProgram, as: 'program' },
        { model: EnterpriseMember, as: 'enterpriseMember' }
      ]
    });

    res.status(201).json({
      message: 'Education request submitted successfully',
      request: requestWithDetails
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Submit preferred dates
router.post('/request/:requestId/dates', enterpriseAuth, [
  body('dates').isArray({ min: 1, max: 3 }),
  body('dates.*.date').isISO8601().toDate(),
  body('dates.*.priority').isInt({ min: 1, max: 3 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { requestId } = req.params;
    const { dates } = req.body;

    // Verify request belongs to user
    const request = await EducationRequest.findOne({
      where: {
        id: requestId,
        enterpriseMemberId: req.user.id
      }
    });

    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }

    // Delete existing preferred dates
    await PreferredDate.destroy({
      where: { educationRequestId: requestId }
    });

    // Create new preferred dates
    const preferredDates = await Promise.all(
      dates.map(dateInfo => 
        PreferredDate.create({
          educationRequestId: requestId,
          preferredDate: dateInfo.date,
          priority: dateInfo.priority
        })
      )
    );

    // Update request status
    await request.update({ status: 'date_selecting' });

    res.json({
      message: 'Preferred dates submitted successfully',
      dates: preferredDates
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get user's education requests
router.get('/requests', enterpriseAuth, async (req, res) => {
  try {
    const requests = await EducationRequest.findAll({
      where: { enterpriseMemberId: req.user.id },
      include: [
        { model: EducationProgram, as: 'program' },
        { model: PreferredDate, as: 'preferredDates' },
        { model: ConfirmedSchedule, as: 'confirmedSchedule' }
      ],
      order: [['createdAt', 'DESC']]
    });

    res.json(requests);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get single education request
router.get('/requests/:requestId', enterpriseAuth, async (req, res) => {
  try {
    const { requestId } = req.params;

    const request = await EducationRequest.findOne({
      where: {
        id: requestId,
        enterpriseMemberId: req.user.id
      },
      include: [
        { model: EducationProgram, as: 'program' },
        { model: PreferredDate, as: 'preferredDates' },
        { model: ConfirmedSchedule, as: 'confirmedSchedule' },
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

// Accept confirmed schedule
router.post('/requests/:requestId/accept', enterpriseAuth, async (req, res) => {
  try {
    const { requestId } = req.params;

    const request = await EducationRequest.findOne({
      where: {
        id: requestId,
        enterpriseMemberId: req.user.id,
        status: 'confirmed'
      }
    });

    if (!request) {
      return res.status(404).json({ message: 'Request not found or not confirmed' });
    }

    await request.update({ status: 'document_pending' });

    res.json({ message: 'Schedule accepted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;