/**
 * Middleware to validate base64 or file uploads for candidate resumes.
 * Restricts allowed formats to PDF, DOC, DOCX and caps max size to 5 MB.
 */
const validateResumeUpload = (req, res, next) => {
  const { resumeUrl, resumeName } = req.body;

  // If no resume payload in request, continue to next middleware
  if (!resumeUrl) {
    return next();
  }

  // Check string length / size (5MB base64 is ~6.7MB string length)
  const MAX_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB
  const MAX_BASE64_LENGTH = Math.ceil(MAX_SIZE_BYTES * 1.37);

  if (typeof resumeUrl === 'string' && resumeUrl.length > MAX_BASE64_LENGTH) {
    return res.status(400).json({
      status: 400,
      msg: 'Resume file size exceeds the 5 MB limit. Please upload a smaller document.'
    });
  }

  // Inspect Data URI header or file extension
  if (typeof resumeUrl === 'string' && resumeUrl.startsWith('data:')) {
    const mimeMatch = resumeUrl.match(/^data:(.*?);base64,/);
    if (mimeMatch) {
      const mime = mimeMatch[1].toLowerCase();
      const allowedMimes = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      ];

      if (!allowedMimes.includes(mime)) {
        return res.status(400).json({
          status: 400,
          msg: 'Invalid resume file type. Only PDF, DOC, and DOCX documents are allowed.'
        });
      }
    }
  } else if (resumeName) {
    const ext = resumeName.split('.').pop().toLowerCase();
    if (!['pdf', 'doc', 'docx'].includes(ext)) {
      return res.status(400).json({
        status: 400,
        msg: 'Invalid resume file extension. Only .pdf, .doc, and .docx documents are supported.'
      });
    }
  }

  next();
};

module.exports = {
  validateResumeUpload
};
