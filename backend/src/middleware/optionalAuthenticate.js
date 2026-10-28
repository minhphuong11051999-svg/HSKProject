const { verifyAccessToken } = require('../lib/tokens');

function optionalAuthenticate(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;

  if (token) {
    try {
      const payload = verifyAccessToken(token);
      req.user = { id: payload.sub, role: payload.role, plan: payload.plan };
    } catch {
      req.user = null;
    }
  }

  next();
}

module.exports = optionalAuthenticate;
