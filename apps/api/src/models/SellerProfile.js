import mongoose from 'mongoose';

const sellerProfileSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
      index: true,
    },
    businessName: {
      type: String,
      trim: true,
      default: '',
    },
    companyRegistrationNumber: {
      type: String,
      trim: true,
      default: '',
    },
    primaryAgent: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    serviceLocations: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Location' }],
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

export default mongoose.model('SellerProfile', sellerProfileSchema);
