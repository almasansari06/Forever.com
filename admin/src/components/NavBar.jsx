import React from 'react'

const Navbar = ({ setToken }) => {
  const logoutHandler = () => {
    localStorage.removeItem('token');
    setToken('');
  }

  return (
    <header className='border-b border-slate-200 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white'>
      <div className='mx-auto flex max-w-[1600px] items-center justify-between px-4 py-4 lg:px-6'>
        <div>
          <p className='text-[10px] font-medium uppercase tracking-[0.25em] text-slate-300'>Store Management</p>
          <h1 className='mt-1 text-xl font-bold sm:text-2xl'>Admin Panel</h1>
        </div>

        <div className='flex items-center gap-3'>
          <span className='hidden rounded-full border border-emerald-400/40 bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-300 sm:inline-flex'>Online</span>
          <button onClick={logoutHandler} className='rounded-full bg-white/10 px-4 py-2 text-xs font-semibold text-white transition hover:bg-white/20 sm:px-5'>
            Logout
          </button>
        </div>
      </div>
    </header>
  )
}

export default Navbar;