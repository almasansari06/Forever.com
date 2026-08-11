import React from 'react';
import Title from '../components/Title';
import { assets } from '../assets/assets';
import NewsletterBox from '../components/NewsletterBox';

const Contact = () => {
  return (
    <div className='transition-opacity duration-500 ease-in opacity-100'>
      <div className='text-center text-2xl pt-10 border-t'>
        <Title text1={'CONTACT '} text2={'US'} />
      </div>

      <div className='my-10 flex flex-col justify-center md:flex-row gap-10 mb-28 items-center'>
        
        <img
          className='w-full md:max-w-[480px] rounded-xl shadow-md transition-transform duration-300 hover:scale-[1.02] hover:shadow-lg'
          src={assets.contact_img}
          alt="Contact Us"
        />

        <div className='flex flex-col justify-center items-start gap-6'>
          <p className='font-semibold text-xl text-gray-700 uppercase tracking-wide'>Corporate Head Office</p>

          <p className='text-gray-500 leading-relaxed'>
            Al Wahda St - Industrial Area 4 - <br />
            Sharjah-United Arab Emirates
          </p>

          <div className='text-gray-500 leading-relaxed space-y-1'>
            <p><span className='font-medium text-gray-700'>Tel:</span> +91 999915299</p>
            <p><span className='font-medium text-gray-700'>Tel:</span> +976 50-523-4444</p>
            <p><span className='font-medium text-gray-700'>Email:</span> <a href='mailto:foreverglobal.new@gmail.com' className='text-blue-600 hover:underline'>foreverglobal.new@gmail.com</a></p>
          </div>

          <p className='font-semibold text-xl text-gray-700 uppercase tracking-wide mt-2'>Careers at Forever</p>
          <p className='text-gray-500'>Learn more about our teams and job openings.</p>

          <button className='border border-black px-8 py-4 text-sm font-medium transition-all duration-200 hover:bg-black hover:text-white active:scale-95 cursor-pointer rounded-sm shadow-xs'>
            Explore Jobs
          </button>
        </div>
      </div>

      <NewsletterBox />
    </div>
  );
};

export default Contact;
