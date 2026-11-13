const { verifyAccessToken } = require('../lib/tokens');
const { userFromTokenPayload } = require('../lib/plan');

function optionalAuthenticate(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;

  if (token) {
    try {
      const payload = verifyAccessToken(token);
      req.user = userFromTokenPayload(payload);
    } catch {
      req.user = null;
    }
  }

  next();
}

module.exports = optionalAuthenticate;
