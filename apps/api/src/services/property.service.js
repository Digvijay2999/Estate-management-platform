import Property from '../models/Property.js';

export async function buildPropertyFilter(query = {}) {
  const filter = {};

  if (query.status) filter.status = query.status;
  if (query.listingType) filter.listingType = query.listingType;
  if (query.country) filter['location.country'] = query.country;
  if (query.city) filter['location.city'] = query.city;
  if (query.propertyType) filter.propertyType = query.propertyType;
  if (query.minPrice || query.maxPrice) {
    filter.price = {};
    if (query.minPrice) filter.price.$gte = Number(query.minPrice);
    if (query.maxPrice) filter.price.$lte = Number(query.maxPrice);
  }

  return filter;
}

export async function getPropertySearchResult(query) {
  const page = Number(query.page || 1);
  const limit = Number(query.limit || 20);
  const filter = await buildPropertyFilter(query);

  const [items, total] = await Promise.all([
    Property.find(filter)
      .populate('propertyType')
      .populate('currency')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit),
    Property.countDocuments(filter),
  ]);

  return {
    items,
    total,
    page,
    limit,
  };
}
