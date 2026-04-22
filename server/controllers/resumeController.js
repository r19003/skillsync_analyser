const pdfParse = require('pdf-parse');
const fs = require('fs');
const path = require('path');

const Resume = require('../models/Resume');
const { parseResume } = require('../services/resumeParserService');

// ─────────────────────────────────────────────
// @desc    Upload resume PDF and extract text
// @route   POST /api/resume/upload
// @access  Protected
// ─────────────────────────────────────────────
const uploadResume = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded. Please attach a PDF.' });
    }

    const filePath = req.file.path;
    const originalFileName = req.file.originalname;

    // Read the uploaded PDF into a buffer
    const fileBuffer = fs.readFileSync(filePath);

    // Extract raw text from PDF
    let extractedText = '';
    let parseWarning = null;

    try {
      const pdfData = await pdfParse(fileBuffer);
      extractedText = pdfData.text || '';
    } catch (parseErr) {
      // Log full error on server for debugging
      console.error('pdf-parse error:', parseErr.message);
      // Return a clear 422 with the actual reason
      return res.status(422).json({
        success: false,
        message: `PDF text extraction failed: ${parseErr.message}. Please upload a text-based PDF (not a scanned image).`,
      });
    }

    // Warn if PDF was parsed but contained no text (likely a scanned image)
    if (!extractedText || extractedText.trim().length < 20) {
      parseWarning = 'Very little text was extracted. If your resume is image-based, analysis quality may be low.';
    }

    // Parse structured data from extracted text
    const parsedData = parseResume(extractedText);

    // Save to database
    const resume = await Resume.create({
      userId: req.user._id,
      originalFileName,
      filePath,
      extractedText,
      parsedData,
    });

    res.status(201).json({
      success: true,
      message: parseWarning || 'Resume uploaded and parsed successfully!',
      resume: {
        id: resume._id,
        originalFileName: resume.originalFileName,
        uploadedAt: resume.uploadedAt,
        parsedData: resume.parsedData,
        extractedTextPreview: extractedText.slice(0, 300) + (extractedText.length > 300 ? '...' : ''),
      },
    });
  } catch (error) {
    next(error);
  }
};

// ─────────────────────────────────────────────
// @desc    Get all resumes for logged-in user
// @route   GET /api/resume/
// @access  Protected
// ─────────────────────────────────────────────
const getMyResumes = async (req, res, next) => {
  try {
    const resumes = await Resume.find({ userId: req.user._id })
      .select('-extractedText')    // Don't send full text in list view
      .sort({ uploadedAt: -1 });   // Newest first

    res.status(200).json({
      success: true,
      count: resumes.length,
      resumes,
    });
  } catch (error) {
    next(error);
  }
};

// ─────────────────────────────────────────────
// @desc    Get a single resume by ID
// @route   GET /api/resume/:id
// @access  Protected
// ─────────────────────────────────────────────
const getResumeById = async (req, res, next) => {
  try {
    const resume = await Resume.findById(req.params.id);

    if (!resume) {
      return res.status(404).json({ success: false, message: 'Resume not found.' });
    }

    // Ensure the resume belongs to the requesting user
    if (resume.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Access denied. This resume does not belong to you.' });
    }

    res.status(200).json({ success: true, resume });
  } catch (error) {
    next(error);
  }
};

// ─────────────────────────────────────────────
// @desc    Delete a resume by ID
// @route   DELETE /api/resume/:id
// @access  Protected
// ─────────────────────────────────────────────
const deleteResume = async (req, res, next) => {
  try {
    const resume = await Resume.findById(req.params.id);

    if (!resume) {
      return res.status(404).json({ success: false, message: 'Resume not found.' });
    }

    if (resume.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Access denied.' });
    }

    // Delete the physical PDF file
    if (fs.existsSync(resume.filePath)) {
      fs.unlinkSync(resume.filePath);
    }

    await resume.deleteOne();

    res.status(200).json({ success: true, message: 'Resume deleted successfully.' });
  } catch (error) {
    next(error);
  }
};

module.exports = { uploadResume, getMyResumes, getResumeById, deleteResume };
