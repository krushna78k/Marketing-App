const AuditLog = require('../models/AuditLog');

const audit = (actionDescription) => {
  return async (req, res, next) => {
    // We capture the original send function to execute logic AFTER the request finishes
    const originalSend = res.send;

    res.send = function (data) {
      res.send = originalSend; // restore original

      // Only log if the request was successful and user is authenticated
      if (res.statusCode >= 200 && res.statusCode < 300 && req.user) {
        try {
          const log = new AuditLog({
            user: req.user.id,
            action: actionDescription,
            details: {
              method: req.method,
              url: req.originalUrl,
              body: req.method !== 'GET' ? req.body : undefined
            },
            ipAddress: req.ip
          });
          log.save().catch(err => console.error('Failed to save audit log', err));
        } catch (error) {
          console.error('Audit Logging Error:', error);
        }
      }
      return res.send(data);
    };

    next();
  };
};

module.exports = audit;
