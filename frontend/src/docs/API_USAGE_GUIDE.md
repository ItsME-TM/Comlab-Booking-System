# API Usage Guide

This guide provides comprehensive documentation for using the service layer and custom hooks in the Lab Booking System frontend application.

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Service Layer](#service-layer)
3. [Custom Hooks](#custom-hooks)
4. [Usage Examples](#usage-examples)
5. [State Management Patterns](#state-management-patterns)
6. [Error Handling](#error-handling)
7. [Best Practices](#best-practices)

## Architecture Overview

The application follows a layered architecture:

```
Components → Custom Hooks → Services → API Client → Backend API
```

- **API Client**: Handles HTTP requests with interceptors for auth and error handling
- **Services**: Abstraction layer for API endpoints (userService, bookingService, notificationService)
- **Custom Hooks**: React hooks that manage state and provide convenient methods for components
- **Components**: UI components that use hooks to interact with data

## Service Layer

### API Client

The `apiClient` is a custom HTTP client that wraps the Fetch API with interceptors.

**Features:**
- Automatic authentication token injection
- Centralized error handling
- Request/response interceptors
- Support for all HTTP methods (GET, POST, PUT, DELETE, PATCH)

**Example:**
```javascript
import { apiClient } from '../services';

// GET request
const data = await apiClient.get('/users');

// POST request
const newUser = await apiClient.post('/users', { name: 'John', email: 'john@example.com' });

// PUT request
const updated = await apiClient.put('/users/123', { name: 'Jane' });

// DELETE request
await apiClient.delete('/users/123');
```

### User Service

The `userService` provides methods for user management operations.

**Available Methods:**

```javascript
import { userService } from '../services';

// Fetch all users
const users = await userService.getUsers({ role: 'lecturer' });

// Fetch all users (legacy endpoint)
const allUsers = await userService.getAllUsers();

// Get user by ID
const user = await userService.getUserById('userId');

// Get user details
const details = await userService.getUserDetails('userId');

// Get users by role
const lecturers = await userService.getUsersByRole('lecturer');

// Get user names and emails
const names = await userService.getUserNames();

// Get lecturers
const lecturers = await userService.getLecturers();

// Get technical officers
const tos = await userService.getTechnicalOfficers();

// Get instructors
const instructors = await userService.getInstructors();

// Get current authenticated user
const currentUser = await userService.getTokenUser();

// Create new user
const newUser = await userService.createUser({
  firstName: 'John',
  lastName: 'Doe',
  email: 'john@example.com',
  role: 'lecturer'
});

// Add user (legacy endpoint)
const addedUser = await userService.addUser(userData);

// Update user
const updated = await userService.updateUser('userId', { firstName: 'Jane' });

// Update user name
const updated = await userService.updateUserName('userId', { 
  firstName: 'Jane', 
  lastName: 'Smith' 
});

// Delete user
await userService.deleteUser('userId');

// Update profile
const profile = await userService.updateProfile({ bio: 'New bio' });

// Change password
await userService.changePassword({
  currentPassword: 'old',
  newPassword: 'new'
});

// Update password
await userService.updatePassword({
  email: 'user@example.com',
  password: 'newPassword'
});

// Verify email
const otp = await userService.verifyEmail('user@example.com');

// Upload avatar
const formData = new FormData();
formData.append('avatar', file);
await userService.uploadAvatar(file);

// Set user status
await userService.setUserStatus('userId', true); // activate
await userService.setUserStatus('userId', false); // deactivate
```

### Booking Service

The `bookingService` provides methods for booking management operations.

**Available Methods:**

```javascript
import { bookingService } from '../services';

// Fetch all bookings
const bookings = await bookingService.getBookings({ status: 'pending' });

// Get booking by ID
const booking = await bookingService.getBookingById('bookingId');

// Get bookings by status
const pending = await bookingService.getBookingsByStatus('pending');

// Get bookings by date range
const bookings = await bookingService.getBookingsByDateRange({
  startDate: '2024-01-01',
  endDate: '2024-01-31'
});

// Get user's bookings
const myBookings = await bookingService.getUserBookings();
const userBookings = await bookingService.getUserBookings('userId');

// Get upcoming bookings
const upcoming = await bookingService.getUpcomingBookings();

// Get booking statistics
const stats = await bookingService.getBookingStats();

// Get lab schedule
const schedule = await bookingService.getLabSchedule('labId', '2024-01-15');

// Check availability
const available = await bookingService.checkAvailability({
  labId: 'lab123',
  startTime: '2024-01-15T10:00:00',
  endTime: '2024-01-15T12:00:00'
});

// Create booking
const newBooking = await bookingService.createBooking({
  labId: 'lab123',
  startTime: '2024-01-15T10:00:00',
  endTime: '2024-01-15T12:00:00',
  purpose: 'Lab session'
});

// Update booking
const updated = await bookingService.updateBooking('bookingId', {
  purpose: 'Updated purpose'
});

// Edit lab session (legacy)
await bookingService.editLabSession('bookingId', bookingData);

// Cancel booking
await bookingService.cancelBooking('bookingId');

// Cancel lab session (legacy)
await bookingService.cancelLabSession('bookingId');

// Confirm booking
await bookingService.confirmBooking('bookingId');

// Approve booking
await bookingService.approveBooking('bookingId');

// Reject booking
await bookingService.rejectBooking('bookingId', 'Reason for rejection');

// Delete booking
await bookingService.deleteBooking('bookingId');
```

### Notification Service

The `notificationService` provides methods for notification management operations.

**Available Methods:**

```javascript
import { notificationService } from '../services';

// Fetch all notifications
const notifications = await notificationService.getNotifications({ unread: true });

// Get user receiver notifications
const receiverNotifs = await notificationService.getUserReceiverNotifications();

// Get notification by ID
const notification = await notificationService.getNotificationById('notifId');

// Get unread count
const count = await notificationService.getUnreadCount();

// Get attendees by booking ID
const attendees = await notificationService.getAttendeesByBookingId('bookingId');

// Create notification
const newNotif = await notificationService.createNotification({
  userId: 'userId',
  title: 'New Notification',
  message: 'Message content',
  type: 'info'
});

// Mark as read
await notificationService.markAsRead('notifId');

// Mark all as read
await notificationService.markAllAsRead();

// Accept notification
await notificationService.acceptNotification('notifId');

// Reject notification
await notificationService.rejectNotification('notifId');

// Confirm lab
await notificationService.confirmLab('notifId');

// Cancel lab
await notificationService.cancelLab('notifId');

// Update to reminder
await notificationService.updateNotificationsToReminder();

// Delete notification
await notificationService.deleteNotification('notifId');

// Delete all notifications
await notificationService.deleteAllNotifications();

// Send email
await notificationService.sendEmail({
  recipient: 'user@example.com',
  subject: 'Subject',
  template: 'templateName',
  data: { key: 'value' }
});

// Get preferences
const prefs = await notificationService.getPreferences();

// Update preferences
await notificationService.updatePreferences({ emailEnabled: true });

// Subscribe to push
await notificationService.subscribeToPush(subscription);

// Unsubscribe from push
await notificationService.unsubscribeFromPush();
```

## Custom Hooks

### useUsers Hook

The `useUsers` hook provides state management and methods for user operations.

**Usage:**

```javascript
import { useUsers } from '../hooks';

function UserManagementComponent() {
  const {
    users,              // Array of users
    loading,            // Loading state
    error,              // Error message
    fetchUsers,         // Fetch users with filters
    fetchAllUsers,      // Fetch all users
    fetchUserById,      // Fetch single user
    createUser,         // Create new user
    updateUser,         // Update user
    deleteUser,         // Delete user
    // ... more methods
  } = useUsers();

  useEffect(() => {
    fetchAllUsers();
  }, [fetchAllUsers]);

  const handleCreateUser = async (userData) => {
    const result = await createUser(userData);
    if (result.success) {
      console.log('User created:', result.data);
    }
  };

  const handleDeleteUser = async (userId) => {
    const result = await deleteUser(userId);
    if (result.success) {
      console.log('User deleted successfully');
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      {users.map(user => (
        <div key={user._id}>
          {user.firstName} {user.lastName}
          <button onClick={() => handleDeleteUser(user._id)}>Delete</button>
        </div>
      ))}
    </div>
  );
}
```

**Available Methods:**

- `fetchUsers(filters)` - Fetch users with optional filters
- `fetchAllUsers()` - Fetch all users (legacy endpoint)
- `fetchUserById(userId)` - Fetch single user by ID
- `fetchUserDetails(userId)` - Fetch user details
- `fetchUsersByRole(role)` - Fetch users by role
- `fetchUserNames()` - Fetch user names and emails
- `fetchLecturers()` - Fetch all lecturers
- `fetchTechnicalOfficers()` - Fetch all technical officers
- `fetchInstructors()` - Fetch all instructors
- `fetchTokenUser()` - Fetch current authenticated user
- `createUser(userData)` - Create new user
- `addUser(userData)` - Add user (legacy)
- `updateUser(userId, updates)` - Update user
- `updateUserName(userId, nameData)` - Update user name
- `deleteUser(userId)` - Delete user
- `updateProfile(profileData)` - Update profile
- `changePassword(passwordData)` - Change password
- `updatePassword(passwordData)` - Update password
- `verifyEmail(email)` - Verify email and send OTP
- `uploadAvatar(file)` - Upload avatar
- `setUserStatus(userId, isActive)` - Set user status

### useBookings Hook

The `useBookings` hook provides state management and methods for booking operations.

**Usage:**

```javascript
import { useBookings } from '../hooks';

function BookingComponent() {
  const {
    bookings,           // Array of bookings
    loading,            // Loading state
    error,              // Error message
    fetchBookings,      // Fetch bookings
    createBooking,      // Create booking
    updateBooking,      // Update booking
    cancelBooking,      // Cancel booking
    checkAvailability,  // Check availability
    // ... more methods
  } = useBookings();

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  const handleCreateBooking = async (bookingData) => {
    // Check availability first
    const availResult = await checkAvailability({
      labId: bookingData.labId,
      startTime: bookingData.startTime,
      endTime: bookingData.endTime
    });

    if (availResult.success && availResult.data.available) {
      const result = await createBooking(bookingData);
      if (result.success) {
        console.log('Booking created:', result.data);
      }
    }
  };

  return (
    <div>
      {bookings.map(booking => (
        <div key={booking._id}>
          {booking.purpose}
          <button onClick={() => cancelBooking(booking._id)}>Cancel</button>
        </div>
      ))}
    </div>
  );
}
```

**Available Methods:**

- `fetchBookings(filters)` - Fetch bookings with filters
- `fetchBookingById(bookingId)` - Fetch single booking
- `fetchBookingsByStatus(status)` - Fetch bookings by status
- `fetchBookingsByDateRange(dateRange)` - Fetch bookings by date range
- `fetchUserBookings(userId)` - Fetch user's bookings
- `fetchUpcomingBookings()` - Fetch upcoming bookings
- `fetchBookingStats()` - Fetch booking statistics
- `fetchLabSchedule(labId, date)` - Fetch lab schedule
- `checkAvailability(availabilityData)` - Check availability
- `createBooking(bookingData)` - Create booking
- `updateBooking(bookingId, updates)` - Update booking
- `editLabSession(bookingId, bookingData)` - Edit lab session (legacy)
- `cancelBooking(bookingId)` - Cancel booking
- `cancelLabSession(bookingId)` - Cancel lab session (legacy)
- `confirmBooking(bookingId)` - Confirm booking
- `approveBooking(bookingId)` - Approve booking
- `rejectBooking(bookingId, reason)` - Reject booking
- `deleteBooking(bookingId)` - Delete booking

### useNotifications Hook

The `useNotifications` hook provides state management and methods for notification operations.

**Usage:**

```javascript
import { useNotifications } from '../hooks';

function NotificationComponent() {
  const {
    notifications,      // Array of notifications
    loading,            // Loading state
    error,              // Error message
    fetchNotifications, // Fetch notifications
    markAsRead,         // Mark as read
    markAllAsRead,      // Mark all as read
    deleteNotification, // Delete notification
    // ... more methods
  } = useNotifications();

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const handleMarkAsRead = async (notifId) => {
    const result = await markAsRead(notifId);
    if (result.success) {
      console.log('Marked as read');
    }
  };

  return (
    <div>
      <button onClick={markAllAsRead}>Mark All as Read</button>
      {notifications.map(notif => (
        <div key={notif._id}>
          {notif.message}
          <button onClick={() => handleMarkAsRead(notif._id)}>Mark Read</button>
          <button onClick={() => deleteNotification(notif._id)}>Delete</button>
        </div>
      ))}
    </div>
  );
}
```

**Available Methods:**

- `fetchNotifications(filters)` - Fetch notifications
- `fetchUserReceiverNotifications()` - Fetch receiver notifications
- `fetchNotificationById(notificationId)` - Fetch single notification
- `fetchUnreadCount()` - Fetch unread count
- `fetchAttendeesByBookingId(bookingId)` - Fetch attendees
- `createNotification(notificationData)` - Create notification
- `markAsRead(notificationId)` - Mark as read
- `markAllAsRead()` - Mark all as read
- `acceptNotification(notificationId)` - Accept notification
- `rejectNotification(notificationId)` - Reject notification
- `confirmLab(notificationId)` - Confirm lab
- `cancelLab(notificationId)` - Cancel lab
- `updateNotificationsToReminder()` - Update to reminder
- `deleteNotification(notificationId)` - Delete notification
- `deleteAllNotifications()` - Delete all notifications
- `sendEmail(emailData)` - Send email
- `fetchPreferences()` - Fetch preferences
- `updatePreferences(preferences)` - Update preferences
- `subscribeToPush(subscription)` - Subscribe to push
- `unsubscribeFromPush()` - Unsubscribe from push

## Usage Examples

### Example 1: User Management Page

```javascript
import { useUsers } from '../hooks';
import { useState, useEffect } from 'react';

function UserManagementPage() {
  const {
    users,
    loading,
    error,
    fetchAllUsers,
    deleteUser,
    updateUser
  } = useUsers();

  const [selectedRole, setSelectedRole] = useState('lecturer');

  useEffect(() => {
    fetchAllUsers();
  }, [fetchAllUsers]);

  const handleDelete = async (userId) => {
    if (window.confirm('Are you sure?')) {
      await deleteUser(userId);
    }
  };

  const handleEdit = async (userId, updates) => {
    const result = await updateUser(userId, updates);
    if (result.success) {
      alert('User updated successfully');
    }
  };

  const filteredUsers = users.filter(u => u.role === selectedRole);

  if (loading) return <div>Loading users...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <h1>User Management</h1>
      <select value={selectedRole} onChange={e => setSelectedRole(e.target.value)}>
        <option value="lecturer">Lecturers</option>
        <option value="instructor">Instructors</option>
        <option value="to">Technical Officers</option>
      </select>
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredUsers.map(user => (
            <tr key={user._id}>
              <td>{user.firstName} {user.lastName}</td>
              <td>{user.email}</td>
              <td>
                <button onClick={() => handleEdit(user._id, { /* updates */ })}>
                  Edit
                </button>
                <button onClick={() => handleDelete(user._id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
```

### Example 2: Booking Creation Form

```javascript
import { useBookings } from '../hooks';
import { useUsers } from '../hooks';
import { useState, useEffect } from 'react';

function BookingForm() {
  const { createBooking, checkAvailability, loading } = useBookings();
  const { fetchUserNames } = useUsers();
  
  const [formData, setFormData] = useState({
    labId: '',
    startTime: '',
    endTime: '',
    purpose: '',
    attendees: []
  });

  const [availabilityStatus, setAvailabilityStatus] = useState(null);

  const handleCheckAvailability = async () => {
    const result = await checkAvailability({
      labId: formData.labId,
      startTime: formData.startTime,
      endTime: formData.endTime
    });

    if (result.success) {
      setAvailabilityStatus(result.data.available ? 'available' : 'unavailable');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const result = await createBooking(formData);
    
    if (result.success) {
      alert('Booking created successfully!');
      // Reset form or navigate away
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Create Booking</h2>
      
      <input
        type="text"
        placeholder="Lab ID"
        value={formData.labId}
        onChange={e => setFormData({ ...formData, labId: e.target.value })}
      />
      
      <input
        type="datetime-local"
        value={formData.startTime}
        onChange={e => setFormData({ ...formData, startTime: e.target.value })}
      />
      
      <input
        type="datetime-local"
        value={formData.endTime}
        onChange={e => setFormData({ ...formData, endTime: e.target.value })}
      />
      
      <button type="button" onClick={handleCheckAvailability}>
        Check Availability
      </button>
      
      {availabilityStatus && (
        <div className={availabilityStatus}>
          Lab is {availabilityStatus}
        </div>
      )}
      
      <textarea
        placeholder="Purpose"
        value={formData.purpose}
        onChange={e => setFormData({ ...formData, purpose: e.target.value })}
      />
      
      <button type="submit" disabled={loading || availabilityStatus !== 'available'}>
        {loading ? 'Creating...' : 'Create Booking'}
      </button>
    </form>
  );
}
```

### Example 3: Notification Center

```javascript
import { useNotifications } from '../hooks';
import { useEffect } from 'react';

function NotificationCenter() {
  const {
    notifications,
    loading,
    fetchNotifications,
    fetchUnreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification
  } = useNotifications();

  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    fetchNotifications();
    loadUnreadCount();
  }, [fetchNotifications]);

  const loadUnreadCount = async () => {
    const result = await fetchUnreadCount();
    if (result.success) {
      setUnreadCount(result.data.count);
    }
  };

  const handleMarkAsRead = async (notifId) => {
    await markAsRead(notifId);
    loadUnreadCount();
  };

  const handleMarkAllAsRead = async () => {
    await markAllAsRead();
    loadUnreadCount();
  };

  if (loading) return <div>Loading notifications...</div>;

  return (
    <div>
      <h2>Notifications ({unreadCount} unread)</h2>
      <button onClick={handleMarkAllAsRead}>Mark All as Read</button>
      
      <div className="notification-list">
        {notifications.map(notif => (
          <div 
            key={notif._id} 
            className={notif.isRead ? 'read' : 'unread'}
          >
            <h4>{notif.title}</h4>
            <p>{notif.message}</p>
            <div className="actions">
              {!notif.isRead && (
                <button onClick={() => handleMarkAsRead(notif._id)}>
                  Mark as Read
                </button>
              )}
              <button onClick={() => deleteNotification(notif._id)}>
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
```

## State Management Patterns

### Pattern 1: Fetch on Mount

```javascript
function MyComponent() {
  const { data, loading, fetchData } = useCustomHook();

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (loading) return <div>Loading...</div>;
  return <div>{/* render data */}</div>;
}
```

### Pattern 2: Fetch with Dependencies

```javascript
function MyComponent({ userId }) {
  const { data, loading, fetchUserData } = useCustomHook();

  useEffect(() => {
    if (userId) {
      fetchUserData(userId);
    }
  }, [userId, fetchUserData]);

  return <div>{/* render data */}</div>;
}
```

### Pattern 3: Optimistic Updates

```javascript
function MyComponent() {
  const { items, updateItem } = useCustomHook();
  const [localItems, setLocalItems] = useState(items);

  useEffect(() => {
    setLocalItems(items);
  }, [items]);

  const handleUpdate = async (id, updates) => {
    // Optimistic update
    setLocalItems(prev => 
      prev.map(item => item.id === id ? { ...item, ...updates } : item)
    );

    // Actual API call
    const result = await updateItem(id, updates);
    
    if (!result.success) {
      // Revert on failure
      setLocalItems(items);
    }
  };

  return <div>{/* render localItems */}</div>;
}
```

### Pattern 4: Polling

```javascript
function MyComponent() {
  const { fetchData } = useCustomHook();

  useEffect(() => {
    // Initial fetch
    fetchData();

    // Poll every 30 seconds
    const interval = setInterval(() => {
      fetchData();
    }, 30000);

    return () => clearInterval(interval);
  }, [fetchData]);

  return <div>{/* render data */}</div>;
}
```

## Error Handling

All hooks and services automatically handle errors and display them via the notification context. However, you can also handle errors manually:

```javascript
function MyComponent() {
  const { createUser } = useUsers();

  const handleCreate = async (userData) => {
    const result = await createUser(userData);
    
    if (result.success) {
      // Success handling
      console.log('User created:', result.data);
    } else {
      // Error handling
      console.error('Error:', result.error);
      // Custom error UI
    }
  };

  return <div>{/* component UI */}</div>;
}
```

## Best Practices

### 1. Always Use Hooks Instead of Direct Service Calls

❌ **Bad:**
```javascript
import { userService } from '../services';

function MyComponent() {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    userService.getUsers().then(setUsers);
  }, []);

  return <div>{/* ... */}</div>;
}
```

✅ **Good:**
```javascript
import { useUsers } from '../hooks';

function MyComponent() {
  const { users, fetchUsers } = useUsers();

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  return <div>{/* ... */}</div>;
}
```

### 2. Handle Loading States

✅ **Good:**
```javascript
function MyComponent() {
  const { data, loading, error } = useCustomHook();

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage error={error} />;
  
  return <div>{/* render data */}</div>;
}
```

### 3. Use Memoization for Expensive Operations

```javascript
import { useMemo } from 'react';

function MyComponent() {
  const { users } = useUsers();

  const sortedUsers = useMemo(() => {
    return users.sort((a, b) => a.name.localeCompare(b.name));
  }, [users]);

  return <div>{/* render sortedUsers */}</div>;
}
```

### 4. Cleanup on Unmount

```javascript
function MyComponent() {
  const { fetchData } = useCustomHook();

  useEffect(() => {
    let isMounted = true;

    const loadData = async () => {
      const result = await fetchData();
      if (isMounted && result.success) {
        // Update state only if component is still mounted
      }
    };

    loadData();

    return () => {
      isMounted = false;
    };
  }, [fetchData]);

  return <div>{/* ... */}</div>;
}
```

### 5. Avoid Prop Drilling with Context

Instead of passing data through many component levels, use the UserContext:

```javascript
import { useUser } from '../contexts/UserContext';

function DeepNestedComponent() {
  const { user, isAuthenticated } = useUser();

  if (!isAuthenticated) return <div>Please log in</div>;

  return <div>Welcome, {user.firstName}!</div>;
}
```

### 6. Use Role-Based Permissions

```javascript
import { useUser } from '../contexts/UserContext';

function AdminOnlyComponent() {
  const { isAdmin, canManageUsers } = useUser();

  if (!isAdmin()) {
    return <div>Access denied</div>;
  }

  return <div>{/* admin content */}</div>;
}
```

## Migration Guide

### Migrating from Direct Axios Calls

**Before:**
```javascript
import axios from 'axios';

function MyComponent() {
  const [users, setUsers] = useState([]);
  const token = localStorage.getItem('token');

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get('/api/users', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setUsers(response.data);
      } catch (error) {
        console.error('Error:', error);
      }
    };
    fetchUsers();
  }, [token]);

  return <div>{/* ... */}</div>;
}
```

**After:**
```javascript
import { useUsers } from '../hooks';

function MyComponent() {
  const { users, loading, fetchUsers } = useUsers();

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  if (loading) return <div>Loading...</div>;

  return <div>{/* ... */}</div>;
}
```

### Benefits of Migration

1. **Automatic Error Handling**: Errors are automatically displayed via notifications
2. **Loading States**: Built-in loading state management
3. **No Token Management**: Authentication is handled automatically
4. **Consistent API**: All hooks follow the same pattern
5. **Better Testing**: Hooks are easier to test than components with direct API calls
6. **Code Reusability**: Same hook can be used across multiple components

---

For more information or questions, please refer to the service and hook source files or contact the development team.
