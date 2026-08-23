import mongoose from 'mongoose';

const customerProfileSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
      index: true,
    },
    profileImage: {
      type: String,
      default: '',
    },
    preferredLanguage: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Language',
      default: null,
    },
    preferredCurrency: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Currency',
      default: null,
    },
    country: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Location',
      default: null,
    },
    bio: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model('CustomerProfile', customerProfileSchema);
