import React, { useState, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { assets } from '../assets/assets'

const navItems = [
  { to: '/add', label: 'Add Items', icon: assets.add_icon },
  { to: '/list', label: 'List Items', icon: assets.list_icon },
  { to: '/orders', label: 'Orders', icon: assets.parcel_icon },
  { to: '/cancelled', label: 'Cancelled', icon: assets.cross_icon },
  { to: '/users', label: 'Users', icon: assets.user_icon },
  { to: '/coupons', label: 'Coupons', icon: assets.tag_icon },
  { to: '/shuffle', label: 'Shuffle', icon: assets.shuffle_icon },
]

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [selectedItem, setSelectedItem] = useState(null)
  const location = useLocation()
  const navigate = useNavigate()

  // Set selected item based on current location
  useEffect(() => {
    const current = navItems.find(item => item.to === location.pathname)
    if (current) {
      setSelectedItem(current)
    }
  }, [location.pathname])

  const handleSelectItem = (item) => {
    setSelectedItem(item)
    navigate(item.to)
    setIsOpen(false)
  }

  return (
    <aside className='lg:w-72'>
      <div className='rounded-2xl border border-slate-200 bg-white p-3 shadow-[0_10px_30px_rgba(15,23,42,0.04)] lg:min-h-[calc(100vh-8rem)]'>
        <div className='relative'>
          <button
            onClick={() => setIsOpen(!isOpen)}
            className='w-full flex items-center justify-between gap-3 rounded-xl border border-slate-900 bg-slate-900 px-3 py-3 text-sm font-medium text-white transition-all hover:bg-slate-800'
          >
            <div className='flex items-center gap-3'>
              <svg className='h-4 w-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M4 6h16M4 12h16M4 18h16' />
              </svg>
              <span>NAVIGATION</span>
            </div>
            <svg
              className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
              fill='none'
              stroke='currentColor'
              viewBox='0 0 24 24'
            >
              <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M19 14l-7 7m0 0l-7-7m7 7V3' />
            </svg>
          </button>

          {isOpen && (
            <div className='absolute left-0 right-0 top-full z-50 mt-2 rounded-xl border border-slate-200 bg-white shadow-lg'>
              <nav className='space-y-1 p-2'>
                {navItems.map((item) => (
                  <button
                    key={item.to}
                    onClick={() => handleSelectItem(item)}
                    className={`w-full flex items-center gap-3 rounded-lg border px-3 py-3 text-left text-sm font-medium transition-all ${
                      selectedItem?.to === item.to
                        ? 'border-slate-900 bg-slate-900 text-white shadow-md'
                        : 'border-transparent bg-slate-50 text-slate-700 hover:border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <img className='h-4 w-4 object-contain' src={item.icon} alt='' />
                    <span>{item.label}</span>
                  </button>
                ))}
              </nav>
            </div>
          )}
        </div>

        {selectedItem && (
          <div className='mt-4 rounded-lg border border-slate-200 bg-slate-50 p-3'>
            <p className='text-[10px] font-semibold uppercase tracking-[0.25em] text-slate-400 mb-2'>Selected</p>
            <div className='flex items-center gap-3 rounded-lg border border-slate-900 bg-slate-900 px-3 py-3'>
              <img className='h-4 w-4 object-contain' src={selectedItem.icon} alt='' />
              <span className='text-sm font-medium text-white'>{selectedItem.label}</span>
            </div>
          </div>
        )}
      </div>
    </aside>
  )
}

export default Sidebar
