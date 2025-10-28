import { useUser } from '../contexts/UserContext';
import { useNotification } from '../contexts/NotificationContext';
import { authService } from '../services';

/**
 * Custom hook for authentication-related operations
 */
export const useAuth = () => {
  const { user, isAuthenticated, setUser, clearUser, setLoading, setError } = useUser();
  const { showSuccess, showError } = useNotification();

  const login = async (credentials) => {
    try {
      setLoading(true);
      setError(null);

      const data = await authService.login(credentials);
      
      // Set user data
      setUser(data.user);
      
      showSuccess('Login successful');
      return { success: true, user: data.user };
    } catch (error) {
      const errorMessage = error.message || 'Login failed';
      setError(errorMessage);
      showError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      setLoading(true);
      
      await authService.logout();
      clearUser();
      showSuccess('Logged out successfully');
      return { success: true };
    } catch (error) {
      // Even if logout API fails, clear local data
      clearUser();
      console.error('Logout error:', error);
      return { success: true }; // Still return success since user is logged out locally
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData) => {
    try {
      setLoading(true);
      setError(null);

      const data = await authService.register(userData);
      
      showSuccess('Registration successful');
      return { success: true, user: data.user };
    } catch (error) {
      const errorMessage = error.message || 'Registration failed';
      setError(errorMessage);
      showError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const checkAuthStatus = () => {
    const token = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    
    if (token && savedUser && !isAuthenticated) {
      try {
        const user = JSON.parse(savedUser);
        setUser(user);
        return true;
      } catch (error) {
        console.error('Error parsing saved user:', error);
        clearUser();
        return false;
      }
    }
    
    return isAuthenticated;
  };

  const hasRole = (requiredRole) => {
    return user?.role === requiredRole;
  };

  const hasAnyRole = (roles) => {
    return roles.includes(user?.role);
  };

  return {
    user,
    isAuthenticated,
    login,
    logout,
    register,
    checkAuthStatus,
    hasRole,
    hasAnyRole
  };
};