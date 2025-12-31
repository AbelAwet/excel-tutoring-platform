import ActivityLog from '../models/ActivityLog.js';

// Log user activity
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
            url: req.originalUrl,
            body: req.body
          }
        });
      }
      next();
    } catch (error) {
      // Don't fail the request if logging fails
      console.error('Activity logging error:', error);
      next();
    }
  };
};

// Log activity after response
export const logActivityAfter = (action, getDescription) => {
  return (req, res, next) => {
    const originalSend = res.send;

    res.send = function (data) {
      res.send = originalSend;

      // Log activity asynchronously
      if (req.user && res.statusCode < 400) {
        ActivityLog.create({
          user: req.user._id,
          action,
          description: typeof getDescription === 'function' ? getDescription(req, res) : getDescription,
          ipAddress: req.ip || req.connection.remoteAddress,
          userAgent: req.get('user-agent'),
          metadata: {
            method: req.method,
            url: req.originalUrl,
            statusCode: res.statusCode
          }
        }).catch(err => console.error('Activity logging error:', err));
      }

      return res.send(data);
    };

    next();
  };
};
