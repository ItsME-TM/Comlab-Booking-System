import apiClient from '../apiClient';

// Mock fetch
global.fetch = jest.fn();

describe('ApiClient', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
    // Reset fetch mock
    fetch.mockClear();
  });

  describe('request method', () => {
    test('makes successful GET request', async () => {
      const mockResponse = { data: 'test' };
      fetch.mockResolvedValue({
        ok: true,
        status: 200,
        headers: new Map([['content-type', 'application/json']]),
        json: () => Promise.resolve(mockResponse)
      });

      const result = await apiClient.get('/test');

      expect(fetch).toHaveBeenCalledWith('/api/test', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      expect(result).toEqual(mockResponse);
    });

    test('makes successful POST request with data', async () => {
      const mockResponse = { success: true };
      const requestData = { name: 'test' };
      
      fetch.mockResolvedValue({
        ok: true,
        status: 201,
        headers: new Map([['content-type', 'application/json']]),
        json: () => Promise.resolve(mockResponse)
      });

      const result = await apiClient.post('/test', requestData);

      expect(fetch).toHaveBeenCalledWith('/api/test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestData)
      });
      expect(result).toEqual(mockResponse);
    });

    test('includes authorization header when token exists', async () => {
      localStorage.setItem('token', 'test-token');
      
      fetch.mockResolvedValue({
        ok: true,
        status: 200,
        headers: new Map([['content-type', 'application/json']]),
        json: () => Promise.resolve({})
      });

      await apiClient.get('/test');

      expect(fetch).toHaveBeenCalledWith('/api/test', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer test-token'
        }
      });
    });

    test('handles HTTP error responses', async () => {
      const errorResponse = { message: 'Not found' };
      fetch.mockResolvedValue({
        ok: false,
        status: 404,
        statusText: 'Not Found',
        headers: new Map([['content-type', 'application/json']]),
        json: () => Promise.resolve(errorResponse)
      });

      await expect(apiClient.get('/test')).rejects.toThrow('Not found');
    });

    test('handles network errors', async () => {
      fetch.mockRejectedValue(new Error('Network error'));

      await expect(apiClient.get('/test')).rejects.toThrow('Network error');
    });

    test('handles non-JSON responses', async () => {
      const textResponse = 'Plain text response';
      fetch.mockResolvedValue({
        ok: true,
        status: 200,
        headers: new Map([['content-type', 'text/plain']]),
        text: () => Promise.resolve(textResponse)
      });

      const result = await apiClient.get('/test');
      expect(result).toBe(textResponse);
    });
  });

  describe('HTTP methods', () => {
    beforeEach(() => {
      fetch.mockResolvedValue({
        ok: true,
        status: 200,
        headers: new Map([['content-type', 'application/json']]),
        json: () => Promise.resolve({ success: true })
      });
    });

    test('PUT request', async () => {
      const data = { id: 1, name: 'updated' };
      await apiClient.put('/test/1', data);

      expect(fetch).toHaveBeenCalledWith('/api/test/1', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });
    });

    test('DELETE request', async () => {
      await apiClient.delete('/test/1');

      expect(fetch).toHaveBeenCalledWith('/api/test/1', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        }
      });
    });

    test('PATCH request', async () => {
      const data = { name: 'patched' };
      await apiClient.patch('/test/1', data);

      expect(fetch).toHaveBeenCalledWith('/api/test/1', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });
    });
  });

  describe('interceptors', () => {
    test('applies request interceptors', async () => {
      const testClient = new (apiClient.constructor)();
      
      testClient.addRequestInterceptor((config) => ({
        ...config,
        headers: { ...config.headers, 'X-Custom': 'test' }
      }));

      fetch.mockResolvedValue({
        ok: true,
        status: 200,
        headers: new Map([['content-type', 'application/json']]),
        json: () => Promise.resolve({})
      });

      await testClient.get('/test');

      expect(fetch).toHaveBeenCalledWith('/api/test', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'X-Custom': 'test'
        }
      });
    });

    test('applies response interceptors', async () => {
      const testClient = new (apiClient.constructor)();
      
      testClient.addResponseInterceptor((response, data) => ({
        ...data,
        intercepted: true
      }));

      fetch.mockResolvedValue({
        ok: true,
        status: 200,
        headers: new Map([['content-type', 'application/json']]),
        json: () => Promise.resolve({ original: true })
      });

      const result = await testClient.get('/test');
      expect(result).toEqual({ original: true, intercepted: true });
    });

    test('applies error interceptors', async () => {
      const testClient = new (apiClient.constructor)();
      
      testClient.addErrorInterceptor((error) => {
        error.intercepted = true;
        return error;
      });

      fetch.mockRejectedValue(new Error('Test error'));

      try {
        await testClient.get('/test');
      } catch (error) {
        expect(error.intercepted).toBe(true);
      }
    });
  });

  describe('authentication error handling', () => {
    test('clears storage and redirects on 401 error', async () => {
      localStorage.setItem('token', 'invalid-token');
      localStorage.setItem('user', JSON.stringify({ id: 1 }));
      
      // Mock window.location
      delete window.location;
      window.location = { pathname: '/dashboard', href: '' };

      fetch.mockResolvedValue({
        ok: false,
        status: 401,
        statusText: 'Unauthorized',
        headers: new Map([['content-type', 'application/json']]),
        json: () => Promise.resolve({ message: 'Unauthorized' })
      });

      await expect(apiClient.get('/test')).rejects.toThrow();
      
      expect(localStorage.getItem('token')).toBeNull();
      expect(localStorage.getItem('user')).toBeNull();
      expect(window.location.href).toBe('/signin');
    });

    test('does not redirect if already on signin page', async () => {
      localStorage.setItem('token', 'invalid-token');
      
      // Mock window.location
      delete window.location;
      window.location = { pathname: '/signin', href: '/signin' };

      fetch.mockResolvedValue({
        ok: false,
        status: 401,
        statusText: 'Unauthorized',
        headers: new Map([['content-type', 'application/json']]),
        json: () => Promise.resolve({ message: 'Unauthorized' })
      });

      await expect(apiClient.get('/test')).rejects.toThrow();
      
      expect(localStorage.getItem('token')).toBeNull();
      expect(window.location.href).toBe('/signin'); // Should remain unchanged
    });
  });
});