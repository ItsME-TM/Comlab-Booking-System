# Lab Booking System API Documentation

## Table of Contents
- [Authentication](#authentication)
- [Users](#users)
- [Bookings](#bookings)
- [Notifications](#notifications)
- [Error Responses](#error-responses)

## Base URL
```
Development: http://localhost:5000/api
Production: [Your production URL]/api
```

## Authentication

All authenticated endpoints require a JWT token in the Authorization header:
```
Authorization: Bearer <token>
```

### POST /auth/login
Authenticate a user and receive a JWT token.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "507f1f77bcf86cd799439011",
      "email": "user@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "role": "lecturer"
    }
  }
}
```

**Error Response (400 Bad Request):**
```json
{
  "success": false,
  "message": "Invalid email or password"
}
```

### POST /auth/register
Register a new user account.

**Request Body:**
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "user@example.com",
  "password": "password123",
  "role": "lecturer"
}
```

**Valid Roles:** `admin`, `lecturer`, `instructor`, `to` (technical officer)

**Success Response (201 Created):**
```json
{
  "success": true,
  "message": "Registration successful",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "507f1f77bcf86cd799439011",
      "email": "user@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "role": "lecturer"
    }
  }
}
```

**Error Response (400 Bad Request):**
```json
{
  "success": false,
  "message": "User with this email already exists"
}
```

### POST /auth/refresh
Refresh an expired or expiring JWT token.

**Request Body:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "message": "Token refreshed successfully",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "507f1f77bcf86cd799439011",
      "email": "user@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "role": "lecturer"
    }
  }
}
```

### POST /auth/logout
Logout the current user (client-side token removal).

**Headers:**
```
Authorization: Bearer <token>
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

---

## Users

### GET /users
Get all users (Admin only).

**Headers:**
```
Authorization: Bearer <token>
```

**Success Response (200 OK):**
```json
[
  {
    "_id": "507f1f77bcf86cd799439011",
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "role": "lecturer",
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z"
  }
]
```

### GET /users/:id
Get a specific user by ID (Admin only).

**Headers:**
```
Authorization: Bearer <token>
```

**Success Response (200 OK):**
```json
{
  "_id": "507f1f77bcf86cd799439011",
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "role": "lecturer",
  "createdAt": "2024-01-15T10:30:00.000Z",
  "updatedAt": "2024-01-15T10:30:00.000Z"
}
```

**Error Response (404 Not Found):**
```json
{
  "error": "User not found"
}
```

### POST /users
Create a new user (Admin only).

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "firstName": "Jane",
  "lastName": "Smith",
  "email": "jane@example.com",
  "password": "password123",
  "role": "instructor"
}
```

**Success Response (200 OK):**
```json
{
  "message": "User added successfully"
}
```

### PUT /users/:id
Update a user (Admin only).

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "firstName": "Jane",
  "lastName": "Smith",
  "email": "jane.smith@example.com",
  "role": "lecturer"
}
```

**Success Response (200 OK):**
```json
{
  "message": "User updated successfully",
  "user": {
    "_id": "507f1f77bcf86cd799439011",
    "firstName": "Jane",
    "lastName": "Smith",
    "email": "jane.smith@example.com",
    "role": "lecturer"
  }
}
```

### DELETE /users/:id
Delete a user (Admin only).

**Headers:**
```
Authorization: Bearer <token>
```

**Success Response (200 OK):**
```json
{
  "message": "User deleted successfully"
}
```

### GET /users/lecturers
Get all lecturers (Admin only).

**Headers:**
```
Authorization: Bearer <token>
```

**Success Response (200 OK):**
```json
[
  {
    "_id": "507f1f77bcf86cd799439011",
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "role": "lecturer"
  }
]
```

### GET /users/instructors
Get all instructors (Admin only).

### GET /users/technical-officers
Get all technical officers (Admin only).

---

## Bookings

### POST /bookings/check-availability
Check if a time slot is available for booking.

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "startTime": "2024-02-15T10:00:00.000Z",
  "endTime": "2024-02-15T12:00:00.000Z"
}
```

**Success Response (200 OK):**
```json
{
  "message": "Time slot is available",
  "available": true
}
```

**Error Response (400 Bad Request):**
```json
{
  "error": "Time slot conflicts with existing bookings",
  "available": false,
  "conflicts": [
    {
      "id": "507f1f77bcf86cd799439011",
      "title": "Lab Session A",
      "status": "confirmed",
      "startTime": "2024-02-15T09:00:00.000Z",
      "endTime": "2024-02-15T11:00:00.000Z"
    }
  ]
}
```

### POST /bookings
Create a new booking.

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "title": "Advanced Programming Lab",
  "startTime": "2024-02-15T10:00:00.000Z",
  "endTime": "2024-02-15T12:00:00.000Z",
  "description": "Lab session for CS301 students",
  "attendees": ["student1@example.com", "student2@example.com"]
}
```

**Success Response (201 Created):**
```json
{
  "message": "Booking created successfully",
  "booking": {
    "_id": "507f1f77bcf86cd799439011",
    "title": "Advanced Programming Lab",
    "startTime": "2024-02-15T10:00:00.000Z",
    "endTime": "2024-02-15T12:00:00.000Z",
    "description": "Lab session for CS301 students",
    "attendees": ["student1@example.com", "student2@example.com"],
    "status": "pending",
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z"
  }
}
```

**Error Response (400 Bad Request):**
```json
{
  "error": "Validation failed: Title is required, Start time cannot be in the past"
}
```

### GET /bookings
Get all bookings.

**Headers:**
```
Authorization: Bearer <token>
```

**Query Parameters:**
- `includeInactive` (optional): Set to "true" to include cancelled bookings

**Success Response (200 OK):**
```json
{
  "message": "Bookings retrieved successfully",
  "bookings": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "title": "Advanced Programming Lab",
      "startTime": "2024-02-15T10:00:00.000Z",
      "endTime": "2024-02-15T12:00:00.000Z",
      "status": "confirmed",
      "attendees": ["student1@example.com"]
    }
  ],
  "count": 1
}
```

### GET /bookings/:id
Get a specific booking by ID.

**Headers:**
```
Authorization: Bearer <token>
```

**Success Response (200 OK):**
```json
{
  "message": "Booking retrieved successfully",
  "booking": {
    "_id": "507f1f77bcf86cd799439011",
    "title": "Advanced Programming Lab",
    "startTime": "2024-02-15T10:00:00.000Z",
    "endTime": "2024-02-15T12:00:00.000Z",
    "description": "Lab session for CS301 students",
    "attendees": ["student1@example.com", "student2@example.com"],
    "status": "confirmed"
  }
}
```

### GET /bookings/status/:status
Get bookings by status.

**Headers:**
```
Authorization: Bearer <token>
```

**Valid Status Values:** `pending`, `confirmed`, `cancelled`

**Success Response (200 OK):**
```json
{
  "message": "confirmed bookings retrieved successfully",
  "bookings": [...],
  "count": 5
}
```

### GET /bookings/date-range
Get bookings within a date range.

**Headers:**
```
Authorization: Bearer <token>
```

**Query Parameters:**
- `startDate` (required): Start date in ISO format
- `endDate` (required): End date in ISO format

**Example:**
```
GET /bookings/date-range?startDate=2024-02-01T00:00:00.000Z&endDate=2024-02-28T23:59:59.000Z
```

**Success Response (200 OK):**
```json
{
  "message": "Bookings retrieved successfully",
  "bookings": [...],
  "count": 10,
  "dateRange": {
    "startDate": "2024-02-01T00:00:00.000Z",
    "endDate": "2024-02-28T23:59:59.000Z"
  }
}
```

### PUT /bookings/:id
Update a booking.

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "title": "Updated Lab Session",
  "startTime": "2024-02-15T11:00:00.000Z",
  "endTime": "2024-02-15T13:00:00.000Z",
  "description": "Updated description",
  "attendees": ["student1@example.com", "student3@example.com"]
}
```

**Success Response (200 OK):**
```json
{
  "message": "Booking updated successfully",
  "booking": {
    "_id": "507f1f77bcf86cd799439011",
    "title": "Updated Lab Session",
    "startTime": "2024-02-15T11:00:00.000Z",
    "endTime": "2024-02-15T13:00:00.000Z",
    "status": "pending"
  }
}
```

### PUT /bookings/:id/cancel
Cancel a booking.

**Headers:**
```
Authorization: Bearer <token>
```

**Success Response (200 OK):**
```json
{
  "message": "Booking cancelled successfully",
  "booking": {
    "_id": "507f1f77bcf86cd799439011",
    "title": "Advanced Programming Lab",
    "status": "cancelled"
  }
}
```

### PUT /bookings/:id/confirm
Confirm a booking.

**Headers:**
```
Authorization: Bearer <token>
```

**Success Response (200 OK):**
```json
{
  "message": "Booking confirmed successfully",
  "booking": {
    "_id": "507f1f77bcf86cd799439011",
    "title": "Advanced Programming Lab",
    "status": "confirmed"
  }
}
```

### DELETE /bookings/:id
Permanently delete a booking (Admin only).

**Headers:**
```
Authorization: Bearer <token>
```

**Success Response (200 OK):**
```json
{
  "message": "Booking deleted permanently"
}
```

### GET /bookings/stats
Get booking statistics (Admin and Lecturer only).

**Headers:**
```
Authorization: Bearer <token>
```

**Success Response (200 OK):**
```json
{
  "message": "Booking statistics retrieved successfully",
  "stats": {
    "total": 50,
    "pending": 10,
    "confirmed": 35,
    "cancelled": 5
  }
}
```

### GET /bookings/upcoming
Get upcoming bookings.

**Headers:**
```
Authorization: Bearer <token>
```

**Query Parameters:**
- `limit` (optional): Maximum number of bookings to return (default: 10)

**Success Response (200 OK):**
```json
{
  "message": "Upcoming bookings retrieved successfully",
  "bookings": [...],
  "count": 10
}
```

---

## Notifications

### POST /notifications
Create a new notification (Lecturer and Instructor only).

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "title": "Lab Session Booking",
  "startTime": "10:00 AM",
  "endTime": "12:00 PM",
  "description": "Please confirm your attendance",
  "attendees": ["student1@example.com", "student2@example.com"],
  "uEmail": "lecturer@example.com",
  "uDate": "2024-02-15",
  "bookingId": "507f1f77bcf86cd799439011"
}
```

**Success Response (201 Created):**
```json
[
  {
    "_id": "507f1f77bcf86cd799439012",
    "bookingId": "507f1f77bcf86cd799439011",
    "senderEmail": "lecturer@example.com",
    "receiverEmail": "student1@example.com",
    "labSessionTitle": "Lab Session Booking",
    "labDate": "2024-02-15",
    "labStartTime": "10:00 AM",
    "labEndTime": "12:00 PM",
    "message": "Please confirm your attendance",
    "type": "request",
    "isRead": false,
    "isReceiverConfirm": false,
    "IsLabWillGoingOn": true
  }
]
```

### GET /notifications
Get notifications for the authenticated user.

**Headers:**
```
Authorization: Bearer <token>
```

**Success Response (200 OK):**
```json
[
  {
    "_id": "507f1f77bcf86cd799439012",
    "bookingId": "507f1f77bcf86cd799439011",
    "senderEmail": "lecturer@example.com",
    "receiverEmail": "student@example.com",
    "labSessionTitle": "Lab Session Booking",
    "labDate": "2024-02-15",
    "labStartTime": "10:00 AM",
    "labEndTime": "12:00 PM",
    "message": "Please confirm your attendance",
    "type": "request",
    "isRead": false,
    "createdAt": "2024-01-15T10:30:00.000Z"
  }
]
```

### GET /notifications/sent
Get notifications sent by the authenticated user.

**Headers:**
```
Authorization: Bearer <token>
```

**Success Response (200 OK):**
```json
[
  {
    "_id": "507f1f77bcf86cd799439012",
    "receiverEmail": "student@example.com",
    "labSessionTitle": "Lab Session Booking",
    "type": "booking_confirmation",
    "isRead": true
  }
]
```

### PUT /notifications/:id/read
Mark a notification as read.

**Headers:**
```
Authorization: Bearer <token>
```

**Success Response (200 OK):**
```json
{
  "_id": "507f1f77bcf86cd799439012",
  "isRead": true,
  "labSessionTitle": "Lab Session Booking"
}
```

### PUT /notifications/:notificationId/accept
Accept a notification (confirm attendance).

**Headers:**
```
Authorization: Bearer <token>
```

**Success Response (200 OK):**
```json
{
  "message": "Notification accepted successfully",
  "notification": {
    "_id": "507f1f77bcf86cd799439012",
    "isReceiverConfirm": true,
    "type": "booking_confirmation"
  }
}
```

### PUT /notifications/:notificationId/reject
Reject a notification (decline attendance).

**Headers:**
```
Authorization: Bearer <token>
```

**Success Response (200 OK):**
```json
{
  "message": "Notification rejected successfully",
  "notification": {
    "_id": "507f1f77bcf86cd799439012",
    "type": "rejected",
    "IsLabWillGoingOn": true
  }
}
```

### PUT /notifications/:notificationId/confirm-lab
Confirm a lab session (Lecturer, Instructor, Admin only).

**Headers:**
```
Authorization: Bearer <token>
```

**Success Response (200 OK):**
```json
{
  "message": "Lab confirmed successfully",
  "updatedNotifications": 5,
  "notification": {
    "_id": "507f1f77bcf86cd799439012",
    "type": "confirmed",
    "IsLabWillGoingOn": true
  }
}
```

### PUT /notifications/:notificationId/cancel-lab
Cancel a lab session (Lecturer, Instructor, Admin only).

**Headers:**
```
Authorization: Bearer <token>
```

**Success Response (200 OK):**
```json
{
  "message": "Lab cancelled successfully",
  "updatedNotifications": 5
}
```

### GET /notifications/booking/:bookingId/attendees
Get attendees and their response status for a booking.

**Headers:**
```
Authorization: Bearer <token>
```

**Success Response (200 OK):**
```json
[
  {
    "student1@example.com": "booking_confirmation"
  },
  {
    "student2@example.com": "rejected"
  }
]
```

---

## Error Responses

### Common HTTP Status Codes

- **200 OK**: Request succeeded
- **201 Created**: Resource created successfully
- **400 Bad Request**: Invalid request data or validation error
- **401 Unauthorized**: Missing or invalid authentication token
- **403 Forbidden**: Insufficient permissions
- **404 Not Found**: Resource not found
- **500 Internal Server Error**: Server error

### Error Response Format

**Development Environment:**
```json
{
  "success": false,
  "message": "Error message",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "path": "/api/bookings",
  "method": "POST",
  "stack": "Error: ...\n    at ..."
}
```

**Production Environment:**
```json
{
  "success": false,
  "message": "Error message",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "path": "/api/bookings",
  "method": "POST"
}
```

### Validation Errors

When validation fails, the error message includes details:
```json
{
  "success": false,
  "message": "Validation failed: Title is required, Start time cannot be in the past"
}
```

### Authentication Errors

**Missing Token:**
```json
{
  "success": false,
  "message": "Access denied. No token provided."
}
```

**Invalid Token:**
```json
{
  "success": false,
  "message": "Invalid or expired token"
}
```

**Insufficient Permissions:**
```json
{
  "success": false,
  "message": "Access denied. Insufficient permissions."
}
```

---

## Notification Types

- `request`: Initial booking request notification
- `booking_confirmation`: Attendee confirmed attendance
- `confirmed`: Lab session officially confirmed
- `rejected`: Attendee declined attendance
- `cancellation`: Lab session cancelled
- `reminder`: Reminder for upcoming lab session

---

## Rate Limiting

Currently, there are no rate limits implemented. This may be added in future versions.

---

## Versioning

Current API Version: v1

The API version is not currently included in the URL path but may be added in future releases.

---

## Support

For API support or questions, please contact the development team or refer to the project repository.
