import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { backendUrl } from '../App';
import { toast } from 'react-toastify';

const Users = ({ token }) => {
  const [users, setUsers] = useState([]);

  const fetchUsers = async () => {
    try {
      const response = await axios.post(
        backendUrl + '/api/user/all-users',
        {},
        { headers: { token } }
      );
      if (response.data.success) {
        setUsers(response.data.users);
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.log(error);
      toast.error(error.message);
    }
  };

  const toggleStatusHandler = async (userId, currentStatus) => {
    const newStatus = currentStatus === 'disabled' ? 'active' : 'disabled';
    try {
      const response = await axios.post(
        backendUrl + '/api/user/toggle-status',
        { userId, status: newStatus },
        { headers: { token } }
      );
      if (response.data.success) {
        toast.success(response.data.message);
        fetchUsers();
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  const deleteUserHandler = async (userId) => {
    if (!window.confirm("Are you sure you want to permanently delete this user?")) return;
    try {
      const response = await axios.post(
        backendUrl + '/api/user/delete-user',
        { userId },
        { headers: { token } }
      );
      if (response.data.success) {
        toast.success(response.data.message || 'User deleted successfully');
        fetchUsers();
      } else {
        toast.error(response.data.message || 'Failed to delete user');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message || 'An error occurred');
    }
  };

  useEffect(() => {
    if (token) fetchUsers();
  }, [token]);

  return (
    <div className='p-4 bg-white rounded border border-gray-200'>
      <h3 className='text-lg font-bold mb-4'>User Management</h3>
      <div className='space-y-3'>
        {users.length === 0 ? (
          <p>No users found</p>
        ) : (
          users.map((user) => (
            <div key={user._id} className='flex items-center justify-between border-b pb-2'>
              <div>
                <p className='font-semibold'>{user.name}</p>
                <p className='text-sm text-gray-500'>{user.email}</p>
                <p className='text-xs font-bold text-blue-600'>Status: {user.status || 'active'}</p>
              </div>
              <div className='flex gap-2'>
                <button 
                  onClick={() => toggleStatusHandler(user._id, user.status || 'active')}
                  className='bg-amber-500 text-white px-3 py-1 rounded text-xs'
                >
                  {user.status === 'disabled' ? 'Enable' : 'Disable'}
                </button>
                <button 
                  onClick={() => deleteUserHandler(user._id)}
                  className='bg-red-600 text-white px-3 py-1 rounded text-xs'
                >
                  Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Users;
