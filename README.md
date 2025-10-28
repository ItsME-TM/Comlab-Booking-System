# Lab Booking System

Welcome to the Lab Booking System project! This project is developed as part of our final year
computer engineering project. The Lab Booking System allows users to book labs for various purposes
efficiently.

## Table of Contents

- [Introduction](#introduction)
- [Features](#features)
- [Technologies Used](#technologies-used)
- [Installation](#installation)
- [Usage](#usage)
- [Contributing](#contributing)
- [License](#license)
- [Contact](#contact)

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

- Frontend: HTML, CSS, JavaScript, React
- Backend: Node.js, Express.js
- Database: MongoDB
- Authentication: JWT (JSON Web Tokens)
- Deployment: Heroku

## Installation

To get a local copy up and running, follow these simple steps.

1.  Create a .env file and add this line to it -> MONGODB_URL =
2.  Run this in CMD at BACKEND location -> npm install express mongoose dotenv cors nodemon ###IF
    you still get an error due to nodemon run this -> npm install -g nodemon
3.  In cmd navigate to BACKEND folder and run this command (npm run dev )to see if the application
    is successfully connect to the mongoDB server.

4.  **Clone the repository:**

    ```bash
    git clone https://github.com/Anuranga200/Comlab-Booking-System.git
    cd lab-booking-system
    ```

5.  **Install dependencies:**

    ```cmd
    cd frontend
    npm install
    cd backend
    npm install
    ```

6.  **Set up environment variables:**

        Create a `.env` file in the root directory and add the following:

        ```env
        MONGO_URI=
        ```

    Then goto mongoDBCompass and add this mongoDB server to it ->
    mongodb+srv://comLab:comLab123@cluster0.mdfezgy.mongodb.net/

7.  **Start the development server:**

        ```cmd
        npm start
        ```

    Run this in CMD comlab-booking-system folder

## Usage

1. **Register or log in to the system.**
2. **View available labs and time slots.**
3. **Book a lab by selecting the desired time slot and lab.**
4. **Manage your bookings from the user dashboard.**

## License

Distributed under the MIT License. See `LICENSE` for more information.
