// src/api/services/blogService.js
// Service for fetching live Green Fibre blog posts from backend API

import catalogClient from '../catalogClient';
import {
  normalizeBlog,
  normalizeBlogListResponse,
} from '../../utils/blogNormalize';
import { blogsContent } from '../../data/content';

export const blogService = {
  /**
   * Fetch all published blog posts from backend
   */
  async getBlogs(params = {}) {
    try {
      const response = await catalogClient.get('/blogs/', { params });
      const normalized = normalizeBlogListResponse(response.data);
      if (normalized.length > 0) {
        return normalized;
      }
      // Fallback to bundled content if backend returned empty
      return normalizeBlogListResponse(blogsContent.blogs || []);
    } catch (error) {
      console.warn('Backend blog API error, using fallback:', error.message);
      return normalizeBlogListResponse(blogsContent.blogs || []);
    }
  },

  /**
   * Fetch a single blog post by slug or ID from backend
   */
  async getBlogBySlug(slugOrId) {
    if (!slugOrId) return null;

    try {
      const response = await catalogClient.get(`/blogs/${encodeURIComponent(slugOrId)}`);
      const blogData = response.data?.blog || response.data?.data || response.data;
      if (blogData) {
        return normalizeBlog(blogData);
      }
    } catch (error) {
      console.warn(`Error fetching blog ${slugOrId} from backend:`, error.message);
    }

    // Fallback search in local content if backend request fails
    const local = (blogsContent.blogs || []).find(
      (b) => b.id === slugOrId || b.slug === slugOrId || b._id === slugOrId
    );
    return local ? normalizeBlog(local) : null;
  },
};

export default blogService;
