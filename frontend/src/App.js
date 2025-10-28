// App.js
import React from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { NotificationProvider, UserProvider } from './contexts';

// Import organized components
import { Home, Dashboard } from './pages/common';
import { SignIn, UserSignIn, AdminLogin, ForgotPassword } from './pages/auth';
import { LabBooking } from './pages/booking';

// Import remaining pages (to be organized in future tasks)
import User from './pages/User';
import CalendarView from './pages/View';
import Errmsg from './pages/errmsg';
import Notification from './pages/Notification';
import AdminHome from './pages/AdminHome';
import AdminProfile from './pages/AdminProfile';
import AddUser from './pages/AddUser';
import ViewUser from './pages/ViewUser';
import UserList from './pages/UserList';
import EditUser from './pages/editUser';
import ToHome from './pages/ToHome';
import CalendarViewTo from './pages/ToView';
import ToProfile from './pages/ToProfile';
import ToNotification from './pages/ToNotification';
import LecturerInstructorProfile from './pages/LecturerInstructorProfile';
import EditImg from './pages/EditImg';

// Import centralized styles
import './styles/index.css';

function App() {
  return (
    <UserProvider>
      <NotificationProvider>
        {' '}
        {/* Wrap the entire application with NotificationProvider */}
        <div>
          <BrowserRouter>
            <Routes>
              <Route path='/' element={<Home />} />
              <Route path='/dashboard' element={<Dashboard />} />
              <Route path='/user' element={<User />} />
              <Route path='/signin' element={<SignIn />} />
              <Route path='/booking' element={<LabBooking />} />
              <Route path='/view' element={<CalendarView />} />
              <Route path='/errmsg' element={<Errmsg />} />
              <Route path='/notification' element={<Notification />} />
              <Route path='/userSingIn' element={<UserSignIn />} />
              <Route path='/adminlogin' element={<AdminLogin />} />
              <Route path='/forgotpassword' element={<ForgotPassword />} />
              <Route path='/adminhome' element={<AdminHome />} />
              <Route path='/adminprofile' element={<AdminProfile />} />
              <Route path='/adduser' element={<AddUser />} />
              <Route path='/viewuser' element={<ViewUser />} />
              <Route path='/UserList' element={<UserList />} />
              <Route path='/editUser' element={<EditUser />} />
              <Route path='/toHome' element={<ToHome />} />
              <Route path='/ToView' element={<CalendarViewTo />} />
              <Route path='/toProfile' element={<ToProfile />} />
              <Route
                path='/lecturerInstructorProfile'
                element={<LecturerInstructorProfile />}
              />
              <Route path='toNotification' element={<ToNotification />} />
              <Route path='/editImg' element={<EditImg />} />
            </Routes>
          </BrowserRouter>
        </div>
      </NotificationProvider>
    </UserProvider>
  );
}

export default App;
