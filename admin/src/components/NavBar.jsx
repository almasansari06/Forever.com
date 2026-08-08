import React from 'react'

const Navbar = ({ setToken }) => {
  const logoutHandler = () => {
    localStorage.removeItem('token');
    setToken(''); // Resetting state will automatically unmount/disable admin access
  }

  return (
    <div className='flex items-center py-2 px-[4%] justify-between border-b border-gray-300'>
      <h1 className='text-xl font-bold'>Admin Panel</h1>
      <button onClick={logoutHandler} className='bg-gray-600 text-white px-5 py-2 sm:px-7 sm:py-2 rounded-full text-xs sm:text-sm'>
        Logout
      </button>
    </div>
  )
}

export default Navbar;