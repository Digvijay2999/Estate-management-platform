import User from '../models/User.js';
import Property from '../models/Property.js';
import Appointment from '../models/Appointment.js';
import Inquiry from '../models/Inquiry.js';
import SellerAgentAssignment from '../models/SellerAgentAssignment.js';
import { successResponse, errorResponse } from '../utils/response.js';

export async function getAgentDashboardSummary(req, res) {
  try {
    const userId = req.user.sub;

    const [totalListings, activeListings, leadsCount, visitsCount] = await Promise.all([
      Property.countDocuments({ agent: userId }),
      Property.countDocuments({ agent: userId, status: { $in: ['PUBLISHED', 'AVAILABLE', 'ACTIVE'] } }),
      Inquiry.countDocuments({ agent: userId }),
      Appointment.countDocuments({ agent: userId }),
    ]);

    return successResponse(
      res,
      200,
      {
        summary: {
          totalListings,
          activeListings,
          leadsCount,
          visitsCount,
        },
      },
      'Agent dashboard summary fetched successfully'
    );
  } catch (error) {
    return errorResponse(res, 500, error.message || 'Unable to fetch agent dashboard summary', 'AGENT_SUMMARY_FAILED');
  }
}

export async function getSellerDashboardSummary(req, res) {
  try {
    const userId = req.user.sub;

    const [myProperties, scheduledVisits, assignment] = await Promise.all([
      Property.countDocuments({ seller: userId }),
      Appointment.countDocuments({ seller: userId, status: { $in: ['PENDING', 'CONFIRMED'] } }),
      SellerAgentAssignment.findOne({ seller: userId, status: 'ACTIVE' }).populate('agent', 'fullName email'),
    ]);

    return successResponse(
      res,
      200,
      {
        summary: {
          myProperties,
          assignedAgent: assignment?.agent || null,
          scheduledVisits,
        },
      },
      'Seller dashboard summary fetched successfully'
    );
  } catch (error) {
    return errorResponse(res, 500, error.message || 'Unable to fetch seller dashboard summary', 'SELLER_SUMMARY_FAILED');
  }
}

export async function getAdminDashboardSummary(req, res) {
  try {
    const [totalUsers, pendingApprovals, totalProperties, totalReports] = await Promise.all([
      User.countDocuments({ softDeleted: false }),
      User.countDocuments({ status: 'PENDING_APPROVAL' }),
      Property.countDocuments({}),
      0,
    ]);

    return successResponse(
      res,
      200,
      {
        summary: {
          totalUsers,
          pendingApprovals,
          totalProperties,
          totalReports,
        },
      },
      'Admin dashboard summary fetched successfully'
    );
  } catch (error) {
    return errorResponse(res, 500, error.message || 'Unable to fetch admin dashboard summary', 'ADMIN_SUMMARY_FAILED');
  }
}

export async function listAdminUsers(req, res) {
  try {
    const users = await User.find({ softDeleted: false })
      .sort({ createdAt: -1 })
      .limit(100)
      .select('fullName email role status createdAt');

    return successResponse(res, 200, { items: users }, 'Users fetched successfully');
  } catch (error) {
    return errorResponse(res, 500, error.message || 'Unable to fetch users', 'ADMIN_USERS_FETCH_FAILED');
  }
}

export async function updateUserApproval(req, res) {
  try {
    const { userId } = req.params;
    const { status } = req.body;

    if (!['ACTIVE', 'PENDING_APPROVAL', 'SUSPENDED', 'BANNED'].includes(status)) {
      return errorResponse(res, 400, 'Invalid user status', 'INVALID_STATUS');
    }

    const user = await User.findById(userId);
    if (!user) {
      return errorResponse(res, 404, 'User not found', 'USER_NOT_FOUND');
    }

    user.status = status;
    await user.save();

    return successResponse(res, 200, { user }, 'User status updated successfully');
  } catch (error) {
    return errorResponse(res, 500, error.message || 'Unable to update user status', 'USER_STATUS_UPDATE_FAILED');
  }
}
