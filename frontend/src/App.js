// App.js
import React from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { NotificationProvider } from './NotificationContext'; // Import the NotificationProvider
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import User from './pages/User';
import AccountCreation from './pages/signup';
import LoginForm from './pages/signIn';
import MyApp from './pages/booking';
import CalendarView from './pages/View';
import Errmsg from './pages/errmsg';
import Notification from './pages/Notification'; // Import the Notification component
import UserSingIn from './pages/userSingIn';
import AdminLogin from './pages/AdminLogin';
import { UserProvider } from './components/UserContext';
import UserList from './pages/UserList';
import AddUser from './pages/AddUser';
import ChangePasswordPage from './pages/ChangePasswordPage';

function App() {
  return (
    <UserProvider>
    <NotificationProvider> {/* Wrap the entire application with NotificationProvider */}
      <div>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/user" element={<User />} />
            <Route path="/signup" element={<AccountCreation />} />
            <Route path="/signin" element={<LoginForm />} />
            <Route path="/booking" element={<MyApp />} />
            <Route path="/view" element={<CalendarView />} />
            <Route path="/errmsg" element={<Errmsg />} />
            <Route path="/notification" element={<Notification />} />
            <Route path="/userSingIn" element={<UserSingIn />} />
            <Route path="/adminlogin" element={<AdminLogin />} />
            <Route path="/UserList" element={<UserList />} />
            <Route path="/AddUser" element={<AddUser />} />
            <Route path="/ChangePasswordPage" element={<ChangePasswordPage />} />
          </Routes>
        </BrowserRouter>
      </div>
    </NotificationProvider>
    </UserProvider>
  );
}

export default App;
