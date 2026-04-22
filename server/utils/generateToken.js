const jwt = require('jsonwebtoken');

/**
 * Generate a signed JWT token for a given user ID.
 * The token embeds the userId as the payload — verified later by auth middleware.
 *
 * @param {string} userId - MongoDB User document _id
 * @returns {string} Signed JWT token
 */
const generateToken = (userId) => {
  return jwt.sign(
    { id: userId },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE || '7d' }
  );
};

module.exports = generateToken;
