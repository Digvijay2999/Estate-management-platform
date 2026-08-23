import mongoose from 'mongoose';

const agentProfileSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
      index: true,
    },
    agencyName: {
      type: String,
      trim: true,
    },
    experienceYears: {
      type: Number,
      min: 0,
      default: 0,
    },
    licenseNumber: {
      type: String,
      trim: true,
      default: '',
    },
    serviceLocations: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Location' }],
    specializations: [{ type: String, trim: true }],
    website: {
      type: String,
      trim: true,
      default: '',
    },
    socialLinks: {
      linkedin: { type: String, default: '' },
      facebook: { type: String, default: '' },
      instagram: { type: String, default: '' },
    },
    verificationStatus: {
      type: String,
      enum: ['PENDING_APPROVAL', 'APPROVED', 'REJECTED', 'SUSPENDED'],
      default: 'PENDING_APPROVAL',
      index: true,
    },
    ratingAverage: {
      type: Number,
      default: 0,
    },
    reviewCount: {
      type: Number,
      default: 0,
    },
    bio: {
      type: String,
      default: '',
    },
    profileImage: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model('AgentProfile', agentProfileSchema);
