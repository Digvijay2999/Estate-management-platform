import multer from 'multer';
import Property from '../models/Property.js';
import PropertyCategory from '../models/PropertyCategory.js';
import Amenity from '../models/Amenity.js';
import Currency from '../models/Currency.js';
import Location from '../models/Location.js';
import { successResponse, errorResponse } from '../utils/response.js';

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowedMimeTypes = [
      'image/jpeg',
      'image/png',
      'image/webp',
      'image/gif',
      'video/mp4',
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    ];

    if (allowedMimeTypes.includes(file.mimetype)) {
      return cb(null, true);
    }

    return cb(new Error('Unsupported file type. Please upload an image, video, or document.'));
  },
});

export const uploadFiles = upload.array('files', 10);

function createSlug(value = '') {
  return String(value)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 120);
}

export async function listProperties(req, res) {
  try {
    const { status = 'PUBLISHED', limit = 20, page = 1 } = req.query;
    const filter = status ? { status } : {};

    const [items, total] = await Promise.all([
      Property.find(filter)
        .populate('propertyType')
        .populate('currency')
        .populate('agent', 'fullName email')
        .populate('seller', 'fullName email')
        .sort({ createdAt: -1 })
        .limit(Number(limit))
        .skip((Number(page) - 1) * Number(limit)),
      Property.countDocuments(filter),
    ]);

    return successResponse(res, 200, {
      items,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit || 1)),
      },
    }, 'Properties fetched successfully');
  } catch (error) {
    return errorResponse(res, 500, error.message || 'Unable to fetch properties', 'PROPERTY_FETCH_FAILED');
  }
}

export async function getPropertyById(req, res) {
  try {
    const property = await Property.findById(req.params.id)
      .populate('propertyType')
      .populate('currency')
      .populate('agent', 'fullName email role')
      .populate('seller', 'fullName email role');

    if (!property) {
      return errorResponse(res, 404, 'Property not found', 'PROPERTY_NOT_FOUND');
    }

    return successResponse(res, 200, { property }, 'Property fetched successfully');
  } catch (error) {
    return errorResponse(res, 500, error.message || 'Unable to fetch property', 'PROPERTY_FETCH_FAILED');
  }
}

export async function createProperty(req, res) {
  try {
    const payload = { ...req.body };

    if (!payload.title || !payload.description || !payload.price || !payload.propertyType || !payload.listingType) {
      return errorResponse(res, 400, 'Title, description, price, type and listing type are required', 'VALIDATION_ERROR');
    }

    const propertyType = await PropertyCategory.findById(payload.propertyType);
    if (!propertyType) {
      return errorResponse(res, 400, 'Invalid property category', 'INVALID_PROPERTY_TYPE');
    }

    const userId = req.user?.sub || payload.owner || payload.agent || payload.seller;
    const defaultCurrency = await Currency.findOne({ isDefault: true }).lean();
    const effectiveCurrency = payload.currency || (defaultCurrency ? defaultCurrency._id : null);

    if (!effectiveCurrency) {
      return errorResponse(res, 400, 'A valid currency is required', 'INVALID_CURRENCY');
    }

    const normalizedLocation = {
      ...payload.location,
      publicLocation: payload.location?.publicLocation || payload.publicLocation || '',
      address: payload.location?.address || payload.address || '',
      exactAddress: payload.location?.exactAddress || payload.exactAddress || payload.location?.address || payload.address || '',
      postalCode: payload.location?.postalCode || payload.postalCode || '',
    };

    const propertyStatus = payload.draft === true ? 'DRAFT' : 'PENDING_APPROVAL';
    const nextSlug = createSlug(payload.slug || payload.title);
    const finalSlug = nextSlug ? `${nextSlug}-${Date.now()}` : `property-${Date.now()}`;

    const saved = await Property.create({
      ...payload,
      slug: finalSlug,
      owner: payload.owner || (req.user?.role === 'CUSTOMER' ? userId : undefined),
      agent: payload.agent || (req.user?.role === 'AGENT' ? userId : undefined),
      seller: payload.seller || (req.user?.role === 'SELLER' ? userId : undefined),
      currency: effectiveCurrency,
      status: propertyStatus,
      approval: {
        status: propertyStatus === 'DRAFT' ? 'PENDING' : 'PENDING',
      },
      location: normalizedLocation,
      documents: Array.isArray(payload.documents) ? payload.documents : (payload.documents ? [payload.documents] : []),
      price: Number(payload.price),
      bedrooms: Number(payload.bedrooms || 0),
      bathrooms: Number(payload.bathrooms || 0),
      area: Number(payload.area || 0),
      publishedAt: propertyStatus === 'PENDING_APPROVAL' ? new Date() : null,
    });

    return successResponse(res, 201, { property: saved }, 'Property created successfully');
  } catch (error) {
    return errorResponse(res, 500, error.message || 'Unable to create property', 'PROPERTY_CREATE_FAILED');
  }
}

export async function updateProperty(req, res) {
  try {
    const property = await Property.findById(req.params.id);
    if (!property) {
      return errorResponse(res, 404, 'Property not found', 'PROPERTY_NOT_FOUND');
    }

    const isOwner = String(property.agent || property.owner || property.seller) === String(req.user?.sub);
    if (!isOwner && req.user?.role !== 'ADMIN' && req.user?.role !== 'SUPER_ADMIN') {
      return errorResponse(res, 403, 'You are not allowed to update this property', 'FORBIDDEN');
    }

    Object.assign(property, req.body);
    if (req.body.location) {
      property.location = { ...property.location, ...req.body.location };
    }
    if (req.body.status) {
      property.status = req.body.status;
    }
    const updated = await property.save();

    return successResponse(res, 200, { property: updated }, 'Property updated successfully');
  } catch (error) {
    return errorResponse(res, 500, error.message || 'Unable to update property', 'PROPERTY_UPDATE_FAILED');
  }
}

export async function uploadPropertyFiles(req, res) {
  try {
    const property = await Property.findById(req.params.id);
    if (!property) {
      return errorResponse(res, 404, 'Property not found', 'PROPERTY_NOT_FOUND');
    }

    const isOwner = String(property.agent || property.owner || property.seller) === String(req.user?.sub);
    if (!isOwner && req.user?.role !== 'ADMIN' && req.user?.role !== 'SUPER_ADMIN') {
      return errorResponse(res, 403, 'You are not allowed to update this property', 'FORBIDDEN');
    }

    const files = Array.isArray(req.files) ? req.files : [];
    if (!files.length) {
      return errorResponse(res, 400, 'At least one file is required', 'NO_FILES');
    }

    const mediaFiles = [];
    const documentFiles = [];

    for (const file of files) {
      const base64 = file.buffer.toString('base64');
      const payload = {
        url: `data:${file.mimetype};base64,${base64}`,
        fileName: file.originalname,
        mimeType: file.mimetype,
        size: file.size,
      };

      if (file.mimetype.startsWith('image/') || file.mimetype.startsWith('video/')) {
        mediaFiles.push({
          ...payload,
          kind: file.mimetype.startsWith('video/') ? 'VIDEO' : 'IMAGE',
          isCover: property.media.length === 0,
        });
      } else {
        documentFiles.push(file.originalname);
      }
    }

    if (mediaFiles.length) {
      property.media.push(...mediaFiles);
    }
    if (documentFiles.length) {
      property.documents.push(...documentFiles);
    }

    await property.save();

    return successResponse(res, 200, {
      media: mediaFiles,
      documents: documentFiles,
      property,
    }, 'Files uploaded successfully');
  } catch (error) {
    return errorResponse(res, 500, error.message || 'Unable to upload files', 'PROPERTY_UPLOAD_FAILED');
  }
}

export async function deleteProperty(req, res) {
  try {
    const property = await Property.findById(req.params.id);
    if (!property) {
      return errorResponse(res, 404, 'Property not found', 'PROPERTY_NOT_FOUND');
    }

    const isOwner = String(property.agent || property.owner || property.seller) === String(req.user?.sub);
    if (!isOwner && req.user?.role !== 'ADMIN' && req.user?.role !== 'SUPER_ADMIN') {
      return errorResponse(res, 403, 'You are not allowed to delete this property', 'FORBIDDEN');
    }

    await property.deleteOne();
    return successResponse(res, 200, {}, 'Property deleted successfully');
  } catch (error) {
    return errorResponse(res, 500, error.message || 'Unable to delete property', 'PROPERTY_DELETE_FAILED');
  }
}

export async function listCategories(req, res) {
  try {
    const categories = await PropertyCategory.find({ isActive: true }).sort({ name: 1 });
    return successResponse(res, 200, { items: categories }, 'Property categories fetched successfully');
  } catch (error) {
    return errorResponse(res, 500, error.message || 'Unable to fetch categories', 'CATEGORIES_FETCH_FAILED');
  }
}

export async function listAmenities(req, res) {
  try {
    const amenities = await Amenity.find({ isActive: true }).sort({ name: 1 });
    return successResponse(res, 200, { items: amenities }, 'Amenities fetched successfully');
  } catch (error) {
    return errorResponse(res, 500, error.message || 'Unable to fetch amenities', 'AMENITIES_FETCH_FAILED');
  }
}

export async function listMyProperties(req, res) {
  try {
    const { role } = req.user;
    const ownerField = role === 'AGENT' ? 'agent' : role === 'SELLER' ? 'seller' : 'owner';

    const items = await Property.find({ [ownerField]: req.user.sub })
      .populate('propertyType')
      .populate('currency')
      .sort({ updatedAt: -1 });

    return successResponse(res, 200, { items }, 'My properties fetched successfully');
  } catch (error) {
    return errorResponse(res, 500, error.message || 'Unable to fetch your properties', 'MY_PROPERTIES_FETCH_FAILED');
  }
}

export async function listPendingProperties(req, res) {
  try {
    const items = await Property.find({
      status: { $in: ['DRAFT', 'PENDING_APPROVAL', 'REJECTED'] },
    })
      .populate('propertyType')
      .populate('agent', 'fullName email')
      .populate('seller', 'fullName email')
      .sort({ updatedAt: -1 });

    return successResponse(res, 200, { items }, 'Pending properties fetched successfully');
  } catch (error) {
    return errorResponse(res, 500, error.message || 'Unable to fetch pending properties', 'PENDING_PROPERTIES_FETCH_FAILED');
  }
}

export async function updatePropertyApproval(req, res) {
  try {
    const { propertyId } = req.params;
    const { status, rejectionReason = '', notes = '' } = req.body;

    if (!['APPROVED', 'REJECTED', 'PENDING_APPROVAL'].includes(status)) {
      return errorResponse(res, 400, 'Invalid approval status', 'INVALID_APPROVAL_STATUS');
    }

    const property = await Property.findById(propertyId);
    if (!property) {
      return errorResponse(res, 404, 'Property not found', 'PROPERTY_NOT_FOUND');
    }

    const nextStatus = status === 'APPROVED' ? 'PUBLISHED' : status === 'REJECTED' ? 'REJECTED' : 'PENDING_APPROVAL';

    property.status = nextStatus;
    property.approval = {
      ...property.approval,
      status: status === 'APPROVED' ? 'APPROVED' : status === 'REJECTED' ? 'REJECTED' : 'PENDING',
      reviewer: req.user.sub,
      reviewedAt: new Date(),
      rejectionReason: status === 'REJECTED' ? String(rejectionReason || '').trim() : '',
      notes: String(notes || '').trim(),
    };

    if (status === 'PENDING_APPROVAL') {
      property.status = 'PENDING_APPROVAL';
      property.approval.status = 'PENDING';
      property.approval.rejectionReason = '';
    }

    await property.save();

    return successResponse(res, 200, { property }, 'Property approval updated successfully');
  } catch (error) {
    return errorResponse(res, 500, error.message || 'Unable to update property approval', 'PROPERTY_APPROVAL_UPDATE_FAILED');
  }
}
