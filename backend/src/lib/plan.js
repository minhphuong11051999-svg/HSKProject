// PRO can be bought for a set period. Once planExpiresAt has passed the account
// is treated as FREE everywhere, without anyone having to switch it back.
function isExpired(expiresAt) {
  return !!expiresAt && new Date(expiresAt).getTime() <= Date.now();
}

function effectivePlan(user) {
  if (!user) return 'FREE';
  return user.plan === 'PREMIUM' && isExpired(user.planExpiresAt) ? 'FREE' : user.plan;
}

// Access tokens carry the plan and its end time (pexp, ms) so a token issued
// before the end date stops granting PRO the moment the period is over.
function userFromTokenPayload(payload) {
  const plan = payload.plan === 'PREMIUM' && payload.pexp && payload.pexp <= Date.now() ? 'FREE' : payload.plan;
  return { id: payload.sub, role: payload.role, plan };
}

module.exports = { isExpired, effectivePlan, userFromTokenPayload };
