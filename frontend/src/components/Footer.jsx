import React, { useContext } from 'react'
import { assets } from '../assets/assets'
import { Link } from 'react-router-dom'
import { ShopContext } from '../context/ShopContext';
import { translations } from '../data/translations';

const Footer = () => {
  const { language } = useContext(ShopContext);
  const t = translations[language] || translations.en;

  return (
    <div className='transition-colors duration-300'>
      <div className='flex flex-col sm:grid grid-cols-[3fr_1fr_1fr] gap-14 my-10 mt-40 text-sm'>
        <div>
          <img src={assets.logo} className='mb-5 w-32' alt="Forever Logo" />
          <p className='w-full md:w-2/3 text-gray-600 leading-relaxed dark:text-slate-300'>
            Elevating your everyday wardrobe with timeless designs, premium quality fabrics, and effortless style. Crafted to keep you confident for every occasion.
          </p>
        </div>

        <div>
          <p className='text-xl font-medium mb-5 text-gray-800 dark:text-slate-100'>{t.company}</p>
          <ul className='flex flex-col gap-2 text-gray-600 dark:text-slate-300'>
            <li className='hover:text-black cursor-pointer transition-colors dark:hover:text-white'>
              <Link to='/'>{t.home}</Link>
            </li>
            <li className='hover:text-black cursor-pointer transition-colors dark:hover:text-white'>
              <Link to='/about'>{t.about}</Link>
            </li>
            <li className='hover:text-black cursor-pointer transition-colors dark:hover:text-white'>{t.deliveryReturns}</li>
            <li className='hover:text-black cursor-pointer transition-colors dark:hover:text-white'>{t.privacyPolicy}</li>
          </ul>
        </div>

        <div>
          <p className='text-xl font-medium mb-5 text-gray-800 dark:text-slate-100'>{t.getInTouch}</p>
          <ul className='flex flex-col gap-2 text-gray-600 dark:text-slate-300'>
            <li className='hover:text-black transition-colors dark:hover:text-white'>+91 999915299</li>
            <li className='hover:text-black transition-colors dark:hover:text-white'>+976 50-523-4444</li>
            <li className='hover:text-black transition-colors dark:hover:text-white'>
              <a href='mailto:foreverglobal.new@gmail.com' className='hover:underline'>foreverglobal.new@gmail.com</a>
            </li>
          </ul>
        </div>
      </div>

      <div>
        <hr className='border-gray-200 dark:border-slate-700' />
        <p className='py-5 text-sm text-center text-gray-500 dark:text-slate-400'>
          {t.rightsReserved.replace('{year}', new Date().getFullYear())}
        </p>
      </div>
    </div>
  )
}

export default Footer
