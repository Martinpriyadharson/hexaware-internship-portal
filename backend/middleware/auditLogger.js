/**
 * Security Audit Logging Helper for Critical Platform Events.
 * Logs events without exposing passwords, hashes, or JWT tokens.
 */
const logSecurityEvent = ({ eventType, userId, userRole, details, ip }) => {
  const timestamp = new Date().toISOString();
  
  // Clean details object to strictly ensure no password or token fields are recorded
  const sanitizedDetails = { ...details };
  delete sanitizedDetails.password;
  delete sanitizedDetails.currentPassword;
  delete sanitizedDetails.newPassword;
  delete sanitizedDetails.token;

  const logEntry = {
    timestamp,
    eventType,
    userId: userId ? String(userId) : 'Anonymous',
    userRole: userRole || 'Unknown',
    ip: ip || 'Local',
    details: sanitizedDetails
  };

  console.log(`[SECURITY AUDIT LOG] [${logEntry.eventType}] User: ${logEntry.userId} (${logEntry.userRole}) | IP: ${logEntry.ip} | Details:`, JSON.stringify(logEntry.details));
};

module.exports = {
  logSecurityEvent
};
