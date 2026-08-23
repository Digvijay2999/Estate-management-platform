import mongoose from 'mongoose';

const locationSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    type: {
      type: String,
      enum: ['COUNTRY', 'STATE', 'CITY', 'LOCALITY'],
      required: true,
      index: true,
    },
    parent: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Location',
      default: null,
    },
    countryCode: {
      type: String,
      trim: true,
      uppercase: true,
      maxlength: 3,
    },
    latitude: {
      type: Number,
      default: null,
    },
    longitude: {
      type: Number,
      default: null,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

locationSchema.index({ type: 1, parent: 1, name: 1 });
locationSchema.index({ countryCode: 1, type: 1 });

export default mongoose.model('Location', locationSchema);
