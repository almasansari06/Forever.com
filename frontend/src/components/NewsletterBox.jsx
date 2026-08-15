import React, { useContext } from 'react'
import { ShopContext } from '../context/ShopContext';
import { translations } from '../data/translations';

const NewsletterBox = () => {
  const { language } = useContext(ShopContext);
  const t = translations[language] || translations.en;

  const onSubmitHandler=(event)=>{
    event.preventDefault();
  }

  return (
    <div className='text-center '>
      <p className='text-2xl font-medium text-gray-800'>{t.subscribeNow}</p>
      <p className='text-gray=400 mt-3'>
        {t.subscribeMessage}
      </p>
      <form onSubmit={onSubmitHandler}className='w-full sm:w-1/2 flex items-center gap-0 mx-auto my-5 border rounded overflow-hidden'>
        <input className='w-full sm:flex-1 outline-none h-[38.5px] px-3 text-sm border border-gray-300 focus:border-gray-500' type="email" placeholder={t.enterEmail} required />
        <button type='submit' className='bg-black text-white text-sm px-6 h-[38.5px]'>{t.subscribe}</button>
      </form>
    </div>
  )
}

export default NewsletterBox
