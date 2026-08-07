import React, { useContext, useState } from 'react';
import { assets } from '../assets/assets';
import { Link, NavLink } from 'react-router-dom';
import { ShopContext } from '../context/ShopContext';

const Navbar = () => {
  const [visible, setVisible] = useState(false);

  const { setShowSearch, getCartCount, navigate, token, setToken, setCartItems } = useContext(ShopContext);

  const logout = () => {
    navigate('/login');
    localStorage.removeItem('token');
    setToken('');
    setCartItems({});
  };

  return (
    <div className='flex items-center justify-between py-5 font-medium relative'>

      <Link to='/'>
        <img
          src={assets.logo}
          className='w-36 transition-transform duration-200 hover:scale-105 active:scale-95'
          alt="Logo"
        />
      </Link>

      <ul className='hidden sm:flex gap-6 text-sm text-gray-700'>
        <NavLink to='/' className='flex flex-col items-center gap-1 group'>
          <p className='group-hover:text-black transition-colors'>HOME</p>
          <hr className='w-0 group-hover:w-full border-none h-[1.5px] bg-gray-800 transition-all duration-300' />
        </NavLink>
        <NavLink to='/collection' className='flex flex-col items-center gap-1 group'>
          <p className='group-hover:text-black transition-colors'>COLLECTION</p>
          <hr className='w-0 group-hover:w-full border-none h-[1.5px] bg-gray-800 transition-all duration-300' />
        </NavLink>
        <NavLink to='/about' className='flex flex-col items-center gap-1 group'>
          <p className='group-hover:text-black transition-colors'>ABOUT</p>
          <hr className='w-0 group-hover:w-full border-none h-[1.5px] bg-gray-800 transition-all duration-300' />
        </NavLink>
        <NavLink to='/contact' className='flex flex-col items-center gap-1 group'>
          <p className='group-hover:text-black transition-colors'>CONTACT</p>
          <hr className='w-0 group-hover:w-full border-none h-[1.5px] bg-gray-800 transition-all duration-300' />
        </NavLink>
      </ul>

      <div className='flex items-center gap-6'>
        <img
          onClick={() => setShowSearch(true)}
          src={assets.search_icon}
          className='w-5 cursor-pointer transition-transform duration-200 hover:scale-125 hover:rotate-12 active:scale-90'
          alt="Search"
        />

        <div className='group relative'>
          <img
            onClick={() => (token ? null : navigate('/login'))}
            className='w-5 cursor-pointer transition-transform duration-200 hover:scale-125 active:scale-90'
            src={assets.profile_icon}
            alt="Profile"
          />

          {/* Animated Dropdown Menu */}
          {token && (
            <div className='group-hover:block hidden absolute dropdown-menu right-0 pt-4 z-50 transition-all duration-200 transform origin-top-right'>
              <div className='flex flex-col gap-2 w-40 py-3 px-5 bg-white text-gray-600 rounded-xl shadow-xl border border-gray-100 text-sm'>
                <p onClick={() => navigate('/profile')} className='cursor-pointer hover:text-black hover:translate-x-1 transition-all duration-150'>
                  My Profile
                </p>
                <p onClick={() => navigate('/orders')} className='cursor-pointer hover:text-black hover:translate-x-1 transition-all duration-150'>
                  Orders
                </p>
                <p onClick={logout} className='cursor-pointer hover:text-red-600 hover:translate-x-1 transition-all duration-150 font-medium'>
                  Logout
                </p>
              </div>
            </div>
          )}
        </div>

        <Link to='/cart' className='relative'>
          <img
            src={assets.cart_icon}
            className='w-5 min-w-5 transition-transform duration-200 hover:scale-125 active:scale-90'
            alt="Cart"
          />
          <span className='absolute right-[-5px] bottom-[-5px] w-4 h-4 bg-black text-white text-[9px] font-bold rounded-full flex items-center justify-center animate-pulse'>
            {getCartCount()}
          </span>
        </Link>

        <img onClick={() => setVisible(true)} src={assets.menu_icon} className='w-5 cursor-pointer sm:hidden transition-transform active:scale-90' alt="Menu" />
      </div>

      {/* Animated Sidebar for Mobile Screens */}
      {visible && (
        <div onClick={() => setVisible(false)} className='fixed inset-0 bg-black/30 backdrop-blur-xs z-40 sm:hidden transition-opacity duration-300' />
      )}

      <div className={`fixed top-0 right-0 h-full bg-white z-50 w-64 shadow-2xl transition-transform duration-300 ease-in-out ${visible ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className='flex flex-col h-full'>
          <div onClick={() => setVisible(false)} className='flex items-center gap-4 p-4 cursor-pointer border-b hover:bg-gray-50 transition-colors'>
            <img className='h-4 rotate-180' src={assets.dropdown_icon} alt="Back" />
            <p className='text-gray-700 font-medium'>Back</p>
          </div>

          <NavLink onClick={() => setVisible(false)} className='py-3.5 px-6 text-gray-700 hover:bg-gray-50 border-b border-gray-100 transition-colors' to='/'>HOME</NavLink>
          <NavLink onClick={() => setVisible(false)} className='py-3.5 px-6 text-gray-700 hover:bg-gray-50 border-b border-gray-100 transition-colors' to='/collection'>COLLECTION</NavLink>
          <NavLink onClick={() => setVisible(false)} className='py-3.5 px-6 text-gray-700 hover:bg-gray-50 border-b border-gray-100 transition-colors' to='/about'>ABOUT</NavLink>
          <NavLink onClick={() => setVisible(false)} className='py-3.5 px-6 text-gray-700 hover:bg-gray-50 border-b border-gray-100 transition-colors' to='/contact'>CONTACT</NavLink>
          {token && (
            <NavLink onClick={() => setVisible(false)} className='py-3.5 px-6 text-black font-semibold hover:bg-gray-50 transition-colors' to='/profile'>MY PROFILE</NavLink>
          )}
        </div>
      </div>

    </div>
  );
};

export default Navbar;
