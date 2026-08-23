import Favorite from '../models/Favorite.js';
import Inquiry from '../models/Inquiry.js';
import Appointment from '../models/Appointment.js';
import Property from '../models/Property.js';
import { successResponse, errorResponse } from '../utils/response.js';

export async function getCustomerSummary(req, res) {
  try {
    const userId = req.user.sub;

    const [favoritesCount, inquiriesCount, appointmentsCount] = await Promise.all([
      Favorite.countDocuments({ user: userId }),
      Inquiry.countDocuments({ user: userId }),
      Appointment.countDocuments({ user: userId }),
    ]);

    return successResponse(
      res,
      200,
      {
        summary: {
          favoritesCount,
          inquiriesCount,
          appointmentsCount,
        },
      },
      'Customer summary fetched successfully'
    );
  } catch (error) {
    return errorResponse(res, 500, error.message || 'Unable to fetch customer summary', 'CUSTOMER_SUMMARY_FAILED');
  }
}

export async function listFavorites(req, res) {
  try {
    const items = await Favorite.find({ user: req.user.sub })
      .populate({
        path: 'property',
        populate: [
          { path: 'propertyType' },
          { path: 'currency' },
          { path: 'agent', select: 'fullName email' },
        ],
      })
      .sort({ createdAt: -1 });

    return successResponse(res, 200, { items }, 'Favorites fetched successfully');
  } catch (error) {
    return errorResponse(res, 500, error.message || 'Unable to fetch favorites', 'FAVORITES_FETCH_FAILED');
  }
}

export async function toggleFavorite(req, res) {
  try {
    const { propertyId } = req.params;
    const userId = req.user.sub;

    const property = await Property.findById(propertyId);
    if (!property) {
      return errorResponse(res, 404, 'Property not found', 'PROPERTY_NOT_FOUND');
    }

    const existing = await Favorite.findOne({ user: userId, property: propertyId });

    if (existing) {
      await existing.deleteOne();
      await Property.findByIdAndUpdate(propertyId, { $inc: { favoriteCount: -1 } });
      return successResponse(res, 200, { favorited: false }, 'Property removed from favorites');
    }

    await Favorite.create({ user: userId, property: propertyId });
    await Property.findByIdAndUpdate(propertyId, { $inc: { favoriteCount: 1 } });

    return successResponse(res, 201, { favorited: true }, 'Property saved to favorites');
  } catch (error) {
    return errorResponse(res, 500, error.message || 'Unable to update favorite', 'FAVORITE_UPDATE_FAILED');
  }
}

export async function listInquiries(req, res) {
  try {
    const items = await Inquiry.find({ user: req.user.sub })
      .populate('property', 'title price status')
      .sort({ createdAt: -1 });

    return successResponse(res, 200, { items }, 'Inquiries fetched successfully');
  } catch (error) {
    return errorResponse(res, 500, error.message || 'Unable to fetch inquiries', 'INQUIRIES_FETCH_FAILED');
  }
}

export async function createInquiry(req, res) {
  try {
    const { propertyId, message, phone = '' } = req.body;

    if (!propertyId || !message) {
      return errorResponse(res, 400, 'Property and message are required', 'VALIDATION_ERROR');
    }

    const property = await Property.findById(propertyId);
    if (!property) {
      return errorResponse(res, 404, 'Property not found', 'PROPERTY_NOT_FOUND');
    }

    const inquiry = await Inquiry.create({
      user: req.user.sub,
      property: propertyId,
      agent: property.agent || null,
      seller: property.seller || null,
      message,
      phone,
      status: 'NEW',
    });

    return successResponse(res, 201, { inquiry }, 'Inquiry created successfully');
  } catch (error) {
    return errorResponse(res, 500, error.message || 'Unable to create inquiry', 'INQUIRY_CREATE_FAILED');
  }
}

export async function listAppointments(req, res) {
  try {
    const items = await Appointment.find({ user: req.user.sub })
      .populate('property', 'title price status')
      .sort({ scheduledAt: 1 });

    return successResponse(res, 200, { items }, 'Appointments fetched successfully');
  } catch (error) {
    return errorResponse(res, 500, error.message || 'Unable to fetch appointments', 'APPOINTMENTS_FETCH_FAILED');
  }
}

export async function createAppointment(req, res) {
  try {
    const { propertyId, scheduledAt, durationMinutes = 60, notes = '' } = req.body;

    if (!propertyId || !scheduledAt) {
      return errorResponse(res, 400, 'Property and scheduled time are required', 'VALIDATION_ERROR');
    }

    const property = await Property.findById(propertyId);
    if (!property) {
      return errorResponse(res, 404, 'Property not found', 'PROPERTY_NOT_FOUND');
    }

    const appointmentDate = new Date(scheduledAt);
    if (Number.isNaN(appointmentDate.getTime())) {
      return errorResponse(res, 400, 'Please provide a valid appointment date', 'INVALID_DATE');
    }

    const appointment = await Appointment.create({
      user: req.user.sub,
      property: propertyId,
      agent: property.agent || null,
      seller: property.seller || null,
      scheduledAt: appointmentDate,
      durationMinutes,
      notes,
      status: 'PENDING',
    });

    return successResponse(res, 201, { appointment }, 'Appointment created successfully');
  } catch (error) {
    return errorResponse(res, 500, error.message || 'Unable to create appointment', 'APPOINTMENT_CREATE_FAILED');
  }
}
