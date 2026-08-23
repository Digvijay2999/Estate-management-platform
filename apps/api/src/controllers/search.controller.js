import { getPropertySearchResult } from '../services/property.service.js';
import { successResponse, errorResponse } from '../utils/response.js';

export async function searchProperties(req, res) {
  try {
    const result = await getPropertySearchResult(req.query);
    return successResponse(res, 200, result, 'Search results fetched successfully');
  } catch (error) {
    return errorResponse(res, 500, error.message || 'Unable to perform search', 'SEARCH_FAILED');
  }
}

export async function savedSearches(req, res) {
  try {
    return successResponse(res, 200, {
      items: [],
      message: 'Saved searches are not yet persisted to database',
    }, 'Saved searches fetched successfully');
  } catch (error) {
    return errorResponse(res, 500, error.message || 'Unable to fetch saved searches', 'SAVED_SEARCH_FAILED');
  }
}
