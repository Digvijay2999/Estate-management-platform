import mongoose from 'mongoose';

const propertyMediaSchema = new mongoose.Schema(
  {
    url: { type: String, required: true },
    fileName: { type: String, trim: true },
    mimeType: { type: String, trim: true },
    kind: {
      type: String,
      enum: ['IMAGE', 'VIDEO', 'FLOOR_PLAN', 'DOCUMENT', 'VIRTUAL_TOUR'],
      default: 'IMAGE',
    },
    isCover: { type: Boolean, default: false },
    size: { type: Number, default: 0 },
  },
  { _id: true }
);

const propertySchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    propertyType: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'PropertyCategory',
      required: true,
    },
    listingType: {
      type: String,
      enum: ['SALE', 'RENT', 'LEASE'],
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: ['DRAFT', 'PENDING_APPROVAL', 'PUBLISHED', 'REJECTED', 'AVAILABLE', 'PENDING', 'SOLD', 'RENTED', 'OFF_MARKET', 'ARCHIVED'],
      default: 'DRAFT',
      index: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    currency: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Currency',
      required: true,
    },
    negotiable: {
      type: Boolean,
      default: false,
    },
    bedrooms: { type: Number, default: 0 },
    bathrooms: { type: Number, default: 0 },
    balconies: { type: Number, default: 0 },
    area: { type: Number, default: 0 },
    areaUnit: { type: String, default: 'sqft' },
    furnished: { type: Boolean, default: false },
    parking: { type: Number, default: 0 },
    constructionYear: { type: Number, default: null },
    facing: { type: String, default: '' },
    ownershipType: { type: String, default: '' },
    amenities: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Amenity' }],
    location: {
      country: { type: mongoose.Schema.Types.ObjectId, ref: 'Location', default: null },
      state: { type: mongoose.Schema.Types.ObjectId, ref: 'Location', default: null },
      city: { type: mongoose.Schema.Types.ObjectId, ref: 'Location', default: null },
      locality: { type: mongoose.Schema.Types.ObjectId, ref: 'Location', default: null },
      address: { type: String, default: '' },
      postalCode: { type: String, default: '' },
      publicLocation: { type: String, default: '' },
      exactAddress: { type: String, default: '' },
      latitude: { type: Number, default: null },
      longitude: { type: Number, default: null },
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      index: true,
    },
    agent: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      index: true,
    },
    seller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      index: true,
    },
    media: [propertyMediaSchema],
    documents: [{ type: String }],
    attributes: [
      {
        key: { type: String, required: true, trim: true },
        value: { type: mongoose.Schema.Types.Mixed },
      },
    ],
    approval: {
      status: { type: String, enum: ['PENDING', 'APPROVED', 'REJECTED'], default: 'PENDING' },
      reviewer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
      reviewedAt: { type: Date, default: null },
      rejectionReason: { type: String, default: '' },
      notes: { type: String, default: '' },
    },
    viewCount: { type: Number, default: 0 },
    favoriteCount: { type: Number, default: 0 },
    verified: { type: Boolean, default: false },
    publishedAt: { type: Date, default: null },
    archivedAt: { type: Date, default: null },
  },
  {
    timestamps: true,
  }
);

propertySchema.index({ status: 1, 'location.city': 1, createdAt: -1 });
propertySchema.index({ listingType: 1, price: 1 });
propertySchema.index({ 'location.country': 1, 'location.city': 1, status: 1 });
propertySchema.index({ agent: 1, status: 1 });
propertySchema.index({ seller: 1, status: 1 });
propertySchema.index({ title: 'text', description: 'text' });

export default mongoose.model('Property', propertySchema);
