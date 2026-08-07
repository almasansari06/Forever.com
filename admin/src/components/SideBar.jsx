import React from 'react'
import { NavLink } from 'react-router-dom'
import { assets } from '../assets/assets'

const Sidebar = () => {
  return (
    <div className='w-[18%] min-h-screen border-r-2 border-gray-200 text-[15px]'>
      <div className='flex flex-col gap-4 pt-6 pl-[20%]'>

        {/* Add Items Link */}
        <NavLink className='flex items-center gap-3 border border-gray-300 border-r-0 px-3 py-2 rounded-l cursor-pointer' to="/add">
          <img className='w-5 h-5' src={assets.add_icon} alt="" />
          <p className='hidden md:block font-medium'>Add Items</p>
        </NavLink>

        {/* List Items Link */}
        <NavLink className='flex items-center gap-3 border border-gray-300 border-r-0 px-3 py-2 rounded-l cursor-pointer' to="/list">
          <img className='w-5 h-5' src={assets.order_icon} alt="" />
          <p className='hidden md:block font-medium'>List Items</p>
        </NavLink>

        {/* Orders Link */}
        <NavLink className='flex items-center gap-3 border border-gray-300 border-r-0 px-3 py-2 rounded-l cursor-pointer' to="/orders">
          <img className='w-5 h-5' src={assets.order_icon} alt="" />
          <p className='hidden md:block font-medium'>Orders</p>
        </NavLink>

        {/* Users Management Link (Naya Option) */}
        <NavLink className='flex items-center gap-3 border border-gray-300 border-r-0 px-3 py-2 rounded-l cursor-pointer' to="/users">
          <img className='w-5 h-5' src={assets.order_icon} alt="" />
          <p className='hidden md:block font-medium'>Users</p>
        </NavLink>

      </div>
    </div>
  )
}

export default Sidebar
