const { verifyAccessToken } = require('../lib/tokens');

function authenticate(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;

  if (!token) {
    return res.status(401).json({ message: 'Missing access token' });
  }

  try {
    const payload = verifyAccessToken(token);
    req.user = { id: payload.sub, role: payload.role, plan: payload.plan };
    next();
  } catch {
    return res.status(401).json({ message: 'Invalid or expired access token' });
  }
}

module.exports = authenticate;
