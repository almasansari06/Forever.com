import React from 'react'
import { NavLink } from 'react-router-dom'
import { assets } from '../assets/assets'

const navItems = [
  { to: '/add', label: 'Add Items', icon: assets.add_icon },
  { to: '/list', label: 'List Items', icon: assets.list_icon },
  { to: '/orders', label: 'Orders', icon: assets.parcel_icon },
  { to: '/cancelled', label: 'Cancelled', icon: assets.cross_icon },
  { to: '/users', label: 'Users', icon: assets.user_icon },
]

const Sidebar = () => {
  return (
    <aside className='lg:w-72'>
      <div className='rounded-2xl border border-slate-200 bg-white p-3 shadow-[0_10px_30px_rgba(15,23,42,0.04)] lg:min-h-[calc(100vh-8rem)]'>
        <p className='mb-4 px-3 text-[10px] font-semibold uppercase tracking-[0.25em] text-slate-400'>Navigation</p>
        <nav className='space-y-2'>
          {navItems.map(({ to, label, icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-xl border px-3 py-3 text-sm font-medium transition-all ${
                  isActive
                    ? 'border-slate-900 bg-slate-900 text-white shadow-md'
                    : 'border-transparent bg-slate-50 text-slate-700 hover:border-slate-200 hover:bg-slate-100'
                }`}
            >
              <img className='h-4 w-4 object-contain' src={icon} alt='' />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>
      </div>
    </aside>
  )
}

export default Sidebar
