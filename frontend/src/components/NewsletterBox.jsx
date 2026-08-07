import React from 'react'

const NewsletterBox = () => {

  const onSubmitHandler=(event)=>{
    event.preventDefault();
  }

  return (
    <div className='text-center '>
      <p className='text-2xl font-medium text-gray-800'>Subscribe Now & Get 20% Off</p>
      <p className='text-gray=400 mt-3'>
        Subscribe to our newsletter and get 20% off your first purchase. We promise to only send you the good stuff.
      </p>
      <form onSubmit={onSubmitHandler}className='w-full sm:w-1/2 flex items-center gap-0 mx-auto my-5 border rounded overflow-hidden'>
        <input className='w-full sm:flex-1 outline-none h-[38.5px] px-3 text-sm border border-gray-300 focus:border-gray-500' type="email" placeholder='Enter your email' required />
        <button type='submit' className='bg-black text-white text-sm px-6 h-[38.5px]'>SUBSCRIBE</button>
      </form>
    </div>
  )
}

export default NewsletterBox
