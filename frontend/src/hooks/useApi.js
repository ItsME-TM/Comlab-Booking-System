import { useState, useCallback } from 'react';
import { useNotification } from '../contexts/NotificationContext';

/**
 * Custom hook for API calls with loading, error, and success states
 * @param {Function} apiFunction - The API function to call
 * @param {Object} options - Configuration options
 * @returns {Object} - API state and execute function
 */
export const useApi = (apiFunction, options = {}) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { showError, showSuccess } = useNotification();

  const {
    showSuccessMessage = false,
    showErrorMessage = true,
    successMessage = 'Operation completed successfully',
    onSuccess,
    onError,
  } = options;

  const execute = useCallback(
    async (...args) => {
      try {
        setLoading(true);
        setError(null);

        const result = await apiFunction(...args);
        setData(result);

        if (showSuccessMessage) {
          showSuccess(successMessage);
        }

        if (onSuccess) {
          onSuccess(result);
        }

        return { success: true, data: result };
      } catch (err) {
        const errorMessage = err.message || 'An error occurred';
        setError(errorMessage);

        if (showErrorMessage) {
          showError(errorMessage);
        }

        if (onError) {
          onError(err);
        }

        return { success: false, error: errorMessage };
      } finally {
        setLoading(false);
      }
    },
    [
      apiFunction,
      showSuccessMessage,
      showErrorMessage,
      successMessage,
      onSuccess,
      onError,
      showError,
      showSuccess,
    ],
  );

  const reset = useCallback(() => {
    setData(null);
    setError(null);
    setLoading(false);
  }, []);

  return {
    data,
    loading,
    error,
    execute,
    reset,
  };
};
