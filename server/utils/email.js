function normalizeEmail(email) {
  return String(email || '').trim().toLowerCase();
}

function escapeRegex(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

async function findUserByEmail(User, email) {
  const normalized = normalizeEmail(email);
  if (!normalized) return null;

  let user = await User.findOne({ email: normalized });
  if (!user) {
    user = await User.findOne({ email: new RegExp(`^${escapeRegex(normalized)}$`, 'i') });
  }
  return user;
}

module.exports = {
  normalizeEmail,
  findUserByEmail,
};