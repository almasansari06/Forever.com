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
    if (!window.confirm('Are you sure you want to permanently delete this user?')) return;
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
    <div className='space-y-4'>
      <div className='mb-4 flex items-center justify-between'>
        <div>
          <p className='text-[10px] font-semibold uppercase tracking-[0.25em] text-slate-400'>Accounts</p>
          <h3 className='mt-1 text-2xl font-bold text-slate-900'>Users</h3>
        </div>
        <span className='rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600'>Total: {users.length}</span>
      </div>

      <div className='overflow-hidden rounded-2xl border border-slate-200 bg-white'>
        {users.length === 0 ? (
          <div className='p-8 text-center text-slate-500'>No users found</div>
        ) : (
          <div className='divide-y divide-slate-200'>
            {users.map((user) => (
              <div
                key={user._id}
                className='flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between'
              >
                <div className='min-w-0 flex-1'>
                  <p className='truncate text-base font-semibold text-slate-800'>{user.name}</p>
                  <p className='mt-1 truncate break-all text-sm text-slate-500'>{user.email}</p>
                  <p className='mt-2 text-xs font-bold uppercase tracking-[0.2em]'>
                    <span className={user.status === 'disabled' ? 'text-red-500' : 'text-emerald-600'}>
                      {user.status || 'active'}
                    </span>
                  </p>
                </div>

                <div className='flex gap-2 sm:shrink-0'>
                  <button
                    onClick={() => toggleStatusHandler(user._id, user.status || 'active')}
                    className='rounded-lg bg-amber-500 px-3 py-2 text-xs font-semibold text-white transition hover:bg-amber-600'
                  >
                    {user.status === 'disabled' ? 'Enable' : 'Disable'}
                  </button>
                  <button
                    onClick={() => deleteUserHandler(user._id)}
                    className='rounded-lg bg-red-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-red-700'
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Users;