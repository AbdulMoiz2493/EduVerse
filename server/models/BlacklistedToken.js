import mongoose from 'mongoose';

const blacklistedTokenSchema = new mongoose.Schema({
  token: {
    type: String,
    required: true,
    unique: true,
  },
  expiresAt: {
    type: Date,
    required: true,
    index: { expires: '0' }, // TTL index to auto-remove expired tokens
  },
});

export default mongoose.model('BlacklistedToken', blacklistedTokenSchema);