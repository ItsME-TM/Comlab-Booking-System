import apiClient from './apiClient';

/**
 * Image service for handling image operations
 */
class ImageService {
  /**
   * Get image by user ID
   * @param {string} userId - User ID
   * @returns {Promise<Object>} Image data
   */
  async getImageByUserId(userId) {
    try {
      const response = await apiClient.get(`/images/get/${userId}`);
      return response;
    } catch (error) {
      throw new Error(error.message || 'Failed to fetch image');
    }
  }

  /**
   * Upload/edit user image
   * @param {FormData} formData - Form data containing image file
   * @returns {Promise<Object>} Upload response
   */
  async uploadImage(formData) {
    try {
      const response = await apiClient.request('/images/edit', {
        method: 'POST',
        body: formData,
        headers: {
          // Don't set Content-Type, let browser set it with boundary
        },
      });
      return response;
    } catch (error) {
      throw new Error(error.message || 'Failed to upload image');
    }
  }
}

// Export singleton instance
export default new ImageService();
