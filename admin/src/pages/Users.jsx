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
    <div className='p-4 bg-white rounded border border-gray-200 w-full max-w-4xl mx-auto'>
      <h3 className='text-lg font-bold mb-4'>User Management</h3>
      <div className='space-y-3'>
        {users.length === 0 ? (
          <p className='text-gray-500'>No users found</p>
        ) : (
          users.map((user) => (
            <div 
              key={user._id} 
              className='flex flex-col sm:flex-row sm:items-center justify-between border-b pb-3 pt-1 gap-3'
            >
              <div className='min-w-0 flex-1'>
                <p className='font-semibold text-gray-800 truncate'>{user.name}</p>
                <p className='text-sm text-gray-500 truncate break-all'>{user.email}</p>
                <p className='text-xs font-bold text-blue-600 mt-1'>
                  Status: <span className={user.status === 'disabled' ? 'text-red-500' : 'text-green-600'}>{user.status || 'active'}</span>
                </p>
              </div>
              <div className='flex gap-2 shrink-0'>
                <button 
                  onClick={() => toggleStatusHandler(user._id, user.status || 'active')}
                  className='bg-amber-500 hover:bg-amber-600 text-white px-3 py-1.5 rounded text-xs transition duration-200'
                >
                  {user.status === 'disabled' ? 'Enable' : 'Disable'}
                </button>
                <button 
                  onClick={() => deleteUserHandler(user._id)}
                  className='bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 rounded text-xs transition duration-200'
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