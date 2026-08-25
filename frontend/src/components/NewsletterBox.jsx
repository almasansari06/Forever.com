import React, { useContext, useState } from 'react'
import axios from 'axios'
import { ShopContext } from '../context/ShopContext';
import { translations } from '../data/translations';

const NewsletterBox = () => {
  const { language, backendUrl } = useContext(ShopContext);
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const t = translations[language] || translations.en;

  const onSubmitHandler=async (event)=>{
    event.preventDefault();
    setIsSubmitting(true);
    setMessage('');
    try {
      const response = await axios.post(`${backendUrl}/api/newsletter/subscribe`, { email });
      setMessage(response.data.message || 'You are subscribed. Welcome to Forever!');
      if (response.data.success) setEmail('');
    } catch (error) {
      setMessage(error.response?.data?.message || 'Unable to subscribe right now. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className='text-center '>
      <p className='text-2xl font-medium text-gray-800'>{t.subscribeNow}</p>
      <p className='text-gray=400 mt-3'>
        {t.subscribeMessage}
      </p>
      <form onSubmit={onSubmitHandler}className='w-full sm:w-1/2 flex items-center gap-0 mx-auto my-5 border rounded overflow-hidden'>
        <input value={email} onChange={(event) => setEmail(event.target.value)} className='w-full sm:flex-1 outline-none h-[38.5px] px-3 text-sm border border-gray-300 focus:border-gray-500' type="email" placeholder={t.enterEmail} required />
        <button type='submit' disabled={isSubmitting} className='bg-black text-white text-sm px-6 h-[38.5px] disabled:opacity-60'>{isSubmitting ? 'SUBSCRIBING...' : t.subscribe}</button>
      </form>
      {message && <p className='text-sm text-gray-600' role='status'>{message}</p>}
    </div>
  )
}

export default NewsletterBox
