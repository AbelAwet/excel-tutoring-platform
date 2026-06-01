import ActivityLog from '../models/ActivityLog.js';

// Sensitive fields that must never be logged
const SENSITIVE_FIELDS = ['password', 'currentPassword', 'newPassword', 'otp', 'token', 'refreshToken'];

const sanitizeBody = (body) => {
  if (!body || typeof body !== 'object') return {};
  const sanitized = { ...body };
  SENSITIVE_FIELDS.forEach((field) => {
    if (sanitized[field] !== undefined) {
      sanitized[field] = '[REDACTED]';
    }
  });
  return sanitized;
};

// Log user activity before response
export const logActivity = (action, description) => {
  return async (req, res, next) => {
    try {
      if (req.user) {
        await ActivityLog.create({
          user: req.user._id,
          action,
          description,
          ipAddress: req.ip || req.connection.remoteAddress,
          userAgent: req.get('user-agent'),
          metadata: {
            method: req.method,
            url: req.originalUrl
          }
        });
      }
      next();
    } catch (error) {
      // Never fail the request because of logging
      console.error('Activity logging error:', error);
      next();
    }
  };
};

// Log activity after successful response
export const logActivityAfter = (action, getDescription) => {
  return (req, res, next) => {
    const originalSend = res.send;

    res.send = function (data) {
      res.send = originalSend;

      if (req.user && res.statusCode < 400) {
        ActivityLog.create({
          user: req.user._id,
          action,
          description:
            typeof getDescription === 'function'
              ? getDescription(req, res)
              : getDescription,
          ipAddress: req.ip || req.connection.remoteAddress,
          userAgent: req.get('user-agent'),
          metadata: {
            method: req.method,
            url: req.originalUrl,
            statusCode: res.statusCode
          }
        }).catch((err) => console.error('Activity logging error:', err));
      }

      return res.send(data);
    };

    next();
  };
};
