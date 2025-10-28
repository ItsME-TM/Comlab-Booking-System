# Lab Booking System

Welcome to the Lab Booking System project! This project is developed as part of our final year
computer engineering project. The Lab Booking System allows users to book labs for various purposes
efficiently.

## Table of Contents

- [Introduction](#introduction)
- [Features](#features)
- [Technologies Used](#technologies-used)
- [Project Structure](#project-structure)
- [Installation](#installation)
- [Configuration](#configuration)
- [Running the Application](#running-the-application)
- [Testing](#testing)
- [API Documentation](#api-documentation)
- [Development Workflow](#development-workflow)
- [Contributing](#contributing)
- [License](#license)

## Introduction

The Lab Booking System is designed to help students, faculty, and staff at the university to book
labs easily and efficiently. The system provides a user-friendly interface and various
functionalities to manage lab bookings, check availability, and handle cancellations.

## Features

- User authentication and authorization
- View available labs and time slots
- Book, update, and cancel lab reservations
- Admin panel for managing labs and bookings
- Email notifications for booking confirmations and reminders

## Technologies Used

### Frontend

- **React** - UI library for building user interfaces
- **React Router** - Client-side routing
- **Axios** - HTTP client for API requests
- **CSS3** - Styling and responsive design

### Backend

- **Node.js** - JavaScript runtime
- **Express.js** - Web application framework
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB object modeling
- **JWT** - JSON Web Tokens for authentication
- **bcrypt** - Password hashing
- **Nodemailer** - Email notifications

### Development Tools

- **ESLint** - Code linting
- **Prettier** - Code formatting
- **Jest** - Testing framework
- **Husky** - Git hooks for code quality

## Project Structure

```
lab-booking-system/
├── backend/                    # Backend application
│   ├── src/
│   │   ├── config/            # Configuration files
│   │   ├── controllers/       # HTTP request handlers
│   │   ├── middleware/        # Express middleware
│   │   ├── models/           # Database schemas
│   │   ├── repositories/     # Data access layer
│   │   ├── routes/           # API route definitions
│   │   ├── services/         # Business logic layer
│   │   ├── utils/            # Utility functions
│   │   └── app.js            # Express app setup
│   ├── tests/                # Backend tests
│   ├── server.js             # Entry point
│   ├── package.json
│   └── .env                  # Environment variables
├── frontend/                  # Frontend application
│   ├── src/
│   │   ├── components/       # React components
│   │   │   ├── atoms/        # Basic UI elements
│   │   │   ├── molecules/    # Component combinations
│   │   │   └── organisms/    # Complex components
│   │   ├── pages/           # Page components
│   │   ├── hooks/           # Custom React hooks
│   │   ├── contexts/        # React contexts
│   │   ├── services/        # API service layer
│   │   ├── utils/           # Utility functions
│   │   ├── styles/          # Global styles
│   │   └── assets/          # Static assets
│   ├── public/              # Public assets
│   └── package.json
├── .kiro/                    # Kiro configuration
├── scripts/                  # Utility scripts
├── package.json             # Root package.json
└── README.md
```

## Installation

### Prerequisites

- **Node.js** (v14 or higher)
- **npm** (v6 or higher)
- **MongoDB** (v4.4 or higher)
- **Git**

### Steps

1. **Clone the repository:**

   ```bash
   git clone https://github.com/Anuranga200/Comlab-Booking-System.git
   cd lab-booking-system
   ```

2. **Install root dependencies:**

   ```bash
   npm install
   ```

3. **Install backend dependencies:**

   ```bash
   cd backend
   npm install
   cd ..
   ```

4. **Install frontend dependencies:**

   ```bash
   cd frontend
   npm install
   cd ..
   ```

## Configuration

### Backend Environment Variables

Create a `.env` file in the `backend` directory with the following variables:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database
MONGODB_URL=mongodb://localhost:27017/lab-booking-system
# Or use MongoDB Atlas:
# MONGODB_URL=mongodb+srv://username:password@cluster.mongodb.net/lab-booking-system

# JWT Configuration
JWT_SECRET=your-secret-key-here
JWT_EXPIRES_IN=3d

# Email Configuration (for notifications)
EMAIL_ENABLED=true
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password

# Logging
LOG_LEVEL=info
```

### Frontend Configuration

The frontend uses environment variables for API configuration. Create a `.env` file in the
`frontend` directory:

```env
REACT_APP_API_URL=http://localhost:5000/api
```

### MongoDB Setup

**Option 1: Local MongoDB**

1. Install MongoDB on your machine
2. Start MongoDB service
3. Use connection string: `mongodb://localhost:27017/lab-booking-system`

**Option 2: MongoDB Atlas (Cloud)**

1. Create a free account at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a new cluster
3. Get your connection string
4. Add it to your `.env` file

## Running the Application

### Development Mode

**Start Backend:**

```bash
cd backend
npm run dev
```

The backend server will start on `http://localhost:5000`

**Start Frontend:**

```bash
cd frontend
npm start
```

The frontend will start on `http://localhost:3000`

**Start Both (from root):**

```bash
npm run dev
```

### Production Mode

**Build Frontend:**

```bash
cd frontend
npm run build
```

**Start Backend:**

```bash
cd backend
npm start
```

## Testing

### Backend Tests

Run all backend tests:

```bash
cd backend
npm test
```

Run tests with coverage:

```bash
cd backend
npm run test:coverage
```

Run tests in watch mode:

```bash
cd backend
npm run test:watch
```

### Frontend Tests

Run all frontend tests:

```bash
cd frontend
npm test
```

Run tests with coverage:

```bash
cd frontend
npm run test:coverage
```

### Test Coverage Goals

The project maintains a minimum of 80% test coverage for both frontend and backend code.

## API Documentation

Comprehensive API documentation is available in the `backend/API_DOCUMENTATION.md` file.

### Quick API Reference

**Base URL:** `http://localhost:5000/api`

**Authentication Endpoints:**

- `POST /auth/login` - User login
- `POST /auth/register` - User registration
- `POST /auth/refresh` - Refresh JWT token
- `POST /auth/logout` - User logout

**User Endpoints:**

- `GET /users` - Get all users (Admin)
- `GET /users/:id` - Get user by ID
- `POST /users` - Create user (Admin)
- `PUT /users/:id` - Update user (Admin)
- `DELETE /users/:id` - Delete user (Admin)

**Booking Endpoints:**

- `GET /bookings` - Get all bookings
- `POST /bookings` - Create booking
- `GET /bookings/:id` - Get booking by ID
- `PUT /bookings/:id` - Update booking
- `DELETE /bookings/:id` - Delete booking
- `POST /bookings/check-availability` - Check time slot availability

**Notification Endpoints:**

- `GET /notifications` - Get user notifications
- `POST /notifications` - Create notification
- `PUT /notifications/:id/read` - Mark as read

For detailed request/response examples, see `backend/API_DOCUMENTATION.md`.

## Development Workflow

### Code Quality

The project uses ESLint and Prettier for code quality and formatting:

**Lint Code:**

```bash
npm run lint
```

**Fix Linting Issues:**

```bash
npm run lint:fix
```

**Format Code:**

```bash
npm run format
```

### Git Hooks

Pre-commit hooks automatically run linting and formatting before each commit using Husky.

### Branch Strategy

- `main` - Production-ready code
- `develop` - Development branch
- `feature/*` - Feature branches
- `bugfix/*` - Bug fix branches

### Commit Messages

Follow conventional commit format:

```
type(scope): subject

body

footer
```

Types: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`

Example:

```
feat(booking): add availability checking

Implement time slot availability checking before booking creation
to prevent double bookings.

Closes #123
```

## Usage

### User Roles

1. **Admin** - Full system access, user management
2. **Lecturer** - Create and manage lab bookings
3. **Instructor** - Create and manage lab bookings
4. **Technical Officer (TO)** - Receive and respond to booking requests

### Basic Workflow

1. **Register or log in** to the system
2. **View available labs** and time slots
3. **Create a booking** by selecting date, time, and attendees
4. **Manage bookings** from your dashboard
5. **Receive notifications** for booking confirmations and reminders

### Admin Functions

- Add, edit, and delete users
- View all bookings and statistics
- Manage system settings

## Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'feat: add amazing feature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

Please ensure:

- All tests pass
- Code follows ESLint and Prettier rules
- Commit messages follow conventional commit format
- Documentation is updated

## Troubleshooting

### Common Issues

**MongoDB Connection Error:**

- Ensure MongoDB is running
- Check connection string in `.env`
- Verify network access if using MongoDB Atlas

**Port Already in Use:**

- Change PORT in backend `.env` file
- Kill process using the port: `npx kill-port 5000`

**Module Not Found:**

- Delete `node_modules` and `package-lock.json`
- Run `npm install` again

**Email Notifications Not Working:**

- Verify EMAIL_USER and EMAIL_PASS in `.env`
- For Gmail, use an App Password instead of your regular password
- Set EMAIL_ENABLED=true

## License

Distributed under the MIT License. See `LICENSE` for more information.

## Support

For issues, questions, or contributions, please:

- Open an issue on GitHub
- Contact the development team
- Refer to the documentation in `backend/API_DOCUMENTATION.md`

---

**Built with ❤️ by the Lab Booking System Team**
