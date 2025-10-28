/**
 * API Client with request/response interceptors and error handling
 */
class ApiClient {
  constructor(baseURL = '/api') {
    this.baseURL = baseURL;
    this.requestInterceptors = [];
    this.responseInterceptors = [];
    this.errorInterceptors = [];
  }

  /**
   * Add request interceptor
   * @param {Function} interceptor - Function to modify request before sending
   */
  addRequestInterceptor(interceptor) {
    this.requestInterceptors.push(interceptor);
  }

  /**
   * Add response interceptor
   * @param {Function} interceptor - Function to modify response after receiving
   */
  addResponseInterceptor(interceptor) {
    this.responseInterceptors.push(interceptor);
  }

  /**
   * Add error interceptor
   * @param {Function} interceptor - Function to handle errors
   */
  addErrorInterceptor(interceptor) {
    this.errorInterceptors.push(interceptor);
  }

  /**
   * Apply request interceptors
   * @param {Object} config - Request configuration
   * @returns {Object} Modified request configuration
   */
  async applyRequestInterceptors(config) {
    let modifiedConfig = { ...config };
    
    for (const interceptor of this.requestInterceptors) {
      modifiedConfig = await interceptor(modifiedConfig);
    }
    
    return modifiedConfig;
  }

  /**
   * Apply response interceptors
   * @param {Response} response - Fetch response
   * @param {Object} data - Response data
   * @returns {Object} Modified response data
   */
  async applyResponseInterceptors(response, data) {
    let modifiedData = data;
    
    for (const interceptor of this.responseInterceptors) {
      modifiedData = await interceptor(response, modifiedData);
    }
    
    return modifiedData;
  }

  /**
   * Apply error interceptors
   * @param {Error} error - Error object
   * @returns {Error} Modified error
   */
  async applyErrorInterceptors(error) {
    let modifiedError = error;
    
    for (const interceptor of this.errorInterceptors) {
      modifiedError = await interceptor(modifiedError);
    }
    
    return modifiedError;
  }

  /**
   * Make HTTP request
   * @param {string} endpoint - API endpoint
   * @param {Object} options - Request options
   * @returns {Promise} Response data
   */
  async request(endpoint, options = {}) {
    try {
      // Prepare request configuration
      const config = {
        url: `${this.baseURL}${endpoint}`,
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        ...options
      };

      // Apply request interceptors
      const modifiedConfig = await this.applyRequestInterceptors(config);

      // Make the request
      const response = await fetch(modifiedConfig.url, {
        method: modifiedConfig.method,
        headers: modifiedConfig.headers,
        body: modifiedConfig.body,
        ...modifiedConfig
      });

      // Parse response
      let data;
      const contentType = response.headers.get('content-type');
      
      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else {
        data = await response.text();
      }

      // Handle HTTP errors
      if (!response.ok) {
        const error = new Error(data.message || `HTTP ${response.status}: ${response.statusText}`);
        error.status = response.status;
        error.response = response;
        error.data = data;
        throw error;
      }

      // Apply response interceptors
      const modifiedData = await this.applyResponseInterceptors(response, data);

      return modifiedData;
    } catch (error) {
      // Apply error interceptors
      const modifiedError = await this.applyErrorInterceptors(error);
      throw modifiedError;
    }
  }

  /**
   * GET request
   * @param {string} endpoint - API endpoint
   * @param {Object} options - Request options
   * @returns {Promise} Response data
   */
  get(endpoint, options = {}) {
    return this.request(endpoint, { ...options, method: 'GET' });
  }

  /**
   * POST request
   * @param {string} endpoint - API endpoint
   * @param {Object} data - Request body data
   * @param {Object} options - Request options
   * @returns {Promise} Response data
   */
  post(endpoint, data = null, options = {}) {
    return this.request(endpoint, {
      ...options,
      method: 'POST',
      body: data ? JSON.stringify(data) : null
    });
  }

  /**
   * PUT request
   * @param {string} endpoint - API endpoint
   * @param {Object} data - Request body data
   * @param {Object} options - Request options
   * @returns {Promise} Response data
   */
  put(endpoint, data = null, options = {}) {
    return this.request(endpoint, {
      ...options,
      method: 'PUT',
      body: data ? JSON.stringify(data) : null
    });
  }

  /**
   * DELETE request
   * @param {string} endpoint - API endpoint
   * @param {Object} options - Request options
   * @returns {Promise} Response data
   */
  delete(endpoint, options = {}) {
    return this.request(endpoint, { ...options, method: 'DELETE' });
  }

  /**
   * PATCH request
   * @param {string} endpoint - API endpoint
   * @param {Object} data - Request body data
   * @param {Object} options - Request options
   * @returns {Promise} Response data
   */
  patch(endpoint, data = null, options = {}) {
    return this.request(endpoint, {
      ...options,
      method: 'PATCH',
      body: data ? JSON.stringify(data) : null
    });
  }
}

// Create and configure the default API client
const apiClient = new ApiClient();

// Add authentication interceptor
apiClient.addRequestInterceptor((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers = {
      ...config.headers,
      'Authorization': `Bearer ${token}`
    };
  }
  return config;
});

// Add response logging interceptor (development only)
if (process.env.NODE_ENV === 'development') {
  apiClient.addResponseInterceptor((response, data) => {
    console.log(`API Response [${response.status}]:`, data);
    return data;
  });
}

// Add error handling interceptor
apiClient.addErrorInterceptor((error) => {
  // Handle authentication errors
  if (error.status === 401) {
    // Clear invalid token
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    
    // Redirect to login if not already there
    if (window.location.pathname !== '/signin' && window.location.pathname !== '/') {
      window.location.href = '/signin';
    }
  }
  
  // Log errors in development
  if (process.env.NODE_ENV === 'development') {
    console.error('API Error:', error);
  }
  
  return error;
});

export default apiClient;