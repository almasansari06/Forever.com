import React from 'react'
import { assets } from '../assets/assets'
import { Link } from 'react-router-dom'

const Footer = () => {
  return (
    <div>
      <div className='flex flex-col sm:grid grid-cols-[3fr_1fr_1fr] gap-14 my-10 mt-40 text-sm'>
        <div>
          <img src={assets.logo} className='mb-5 w-32' alt="Forever Logo" />
          <p className='w-full md:w-2/3 text-gray-600 leading-relaxed'>
            Elevating your everyday wardrobe with timeless designs, premium quality fabrics, and effortless style. Crafted to keep you confident for every occasion.
          </p>
        </div>

        <div>
          <p className='text-xl font-medium mb-5 text-gray-800'>COMPANY</p>
          <ul className='flex flex-col gap-2 text-gray-600'>
            <li className='hover:text-black cursor-pointer transition-colors'>
              <Link to='/'>Home</Link>
            </li>
            <li className='hover:text-black cursor-pointer transition-colors'>
              <Link to='/about'>About Us</Link>
            </li>
            <li className='hover:text-black cursor-pointer transition-colors'>Delivery & Returns</li>
            <li className='hover:text-black cursor-pointer transition-colors'>Privacy Policy</li>
          </ul>
        </div>

        <div>
          <p className='text-xl font-medium mb-5 text-gray-800'>GET IN TOUCH</p>
          <ul className='flex flex-col gap-2 text-gray-600'>
            <li className='hover:text-black transition-colors'>+91 999915299</li>
            <li className='hover:text-black transition-colors'>+976 50-523-4444</li>
            <li className='hover:text-black transition-colors'>forevernew@forever.com</li>
          </ul>
        </div>
      </div>

      <div>
        <hr className='border-gray-200' />
        <p className='py-5 text-sm text-center text-gray-500'>
          Copyright {new Date().getFullYear()} @ forever.com - All Rights Reserved.
        </p>
      </div>
    </div>
  )
}

export default Footer
