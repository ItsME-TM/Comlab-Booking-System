import React, { useState, useEffect } from 'react';
import '../components/UserList.css';
//import axios from 'axios';

// Temporarily simulate axios until backend is connected
const axios = {
  get: (url) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        let sampleUsers = [];
        switch (url) {
          case '/users/lecturer':
            sampleUsers = [
              { _id: '1', firstName: 'John', lastName: 'Doe', email: 'john.doe@example.com' },
              { _id: '2', firstName: 'Jane', lastName: 'Smith', email: 'jane.smith@example.com' },
              { _id: '3', firstName: 'Michael', lastName: 'Johnson', email: 'michael.johnson@example.com' },
              { _id: '4', firstName: 'Sarah', lastName: 'Adams', email: 'sarah.adams@example.com' },
              { _id: '5', firstName: 'David', lastName: 'Brown', email: 'david.brown@example.com' },
            ];
            break;
          case '/users/instructor':
            sampleUsers = [
              { _id: '6', firstName: 'Emily', lastName: 'Taylor', email: 'emily.taylor@example.com' },
              { _id: '7', firstName: 'Matthew', lastName: 'Clark', email: 'matthew.clark@example.com' },
              { _id: '8', firstName: 'Olivia', lastName: 'Walker', email: 'olivia.walker@example.com' },
              { _id: '9', firstName: 'Andrew', lastName: 'White', email: 'andrew.white@example.com' },
              { _id: '10', firstName: 'Sophia', lastName: 'Thomas', email: 'sophia.thomas@example.com' },
            ];
            break;
          case '/users/to':
            sampleUsers = [
              { _id: '11', firstName: 'James', lastName: 'Anderson', email: 'james.anderson@example.com' },
              { _id: '12', firstName: 'Emma', lastName: 'Harris', email: 'emma.harris@example.com' },
              { _id: '13', firstName: 'Logan', lastName: 'Martin', email: 'logan.martin@example.com' },
              { _id: '14', firstName: 'Ava', lastName: 'Moore', email: 'ava.moore@example.com' },
              { _id: '15', firstName: 'Lucas', lastName: 'King', email: 'lucas.king@example.com' },
            ];
            break;
          default:
            sampleUsers = [];
        }
        resolve({ data: sampleUsers });
      }, 1000); // Simulating delay for API call
    });
  },
};

const UserList = () => {
  const [users, setUsers] = useState([]);
  const [selectedRole, setSelectedRole] = useState('');

  useEffect(() => {
    // Function to fetch users based on selected role
    const fetchUsers = async () => {
      try {
        const response = await axios.get(`/users/${selectedRole}`);
        setUsers(response.data);
      } catch (error) {
        console.error('Error fetching users:', error);
      }
    };

    fetchUsers();
  }, [selectedRole]);

  const handleRoleSelect = (role) => {
    setSelectedRole(role);
  };

  return (
    <div className="user-list-container">
      <div className="list-left-container">
        <h2 className='list-title'>Users</h2>
        <ul className='role'>
          <button onClick={() => handleRoleSelect('lecturer')} className="role-button">Lecturers</button>
          <button onClick={() => handleRoleSelect('instructor')} className="role-button">Instructors</button>
          <button onClick={() => handleRoleSelect('to')} className="role-button">TOs</button>
        </ul>
      </div>

      <div className="list-right-container">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Email</th>
              
            </tr>
          </thead>
          <tbody>
            {users.map(user => (
              <tr key={user._id}>
                <td>{user._id}</td>
                <td>{user.firstName} {user.lastName}</td>
                <td>{user.email}</td>
                <td>
                  <div className="action-buttons">
                    <button className="action-button">Edit</button>
                    <button className="action-button">Remove</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UserList;
