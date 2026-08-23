import mongoose from 'mongoose';

const sellerAgentAssignmentSchema = new mongoose.Schema(
  {
    seller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    agent: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    primary: {
      type: Boolean,
      default: true,
    },
    status: {
      type: String,
      enum: ['ACTIVE', 'PENDING', 'REVOKED'],
      default: 'ACTIVE',
    },
    assignedAt: {
      type: Date,
      default: Date.now,
    },
    notes: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

sellerAgentAssignmentSchema.index({ seller: 1, agent: 1 }, { unique: true });

export default mongoose.model('SellerAgentAssignment', sellerAgentAssignmentSchema);
