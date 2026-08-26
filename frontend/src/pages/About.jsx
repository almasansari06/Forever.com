import React, { useContext } from 'react'
import Title from '../components/Title'
import {assets} from '../assets/assets';
import NewsletterBox from '../components/NewsletterBox'
import { ShopContext } from '../context/ShopContext';
import { translations } from '../data/translations';

const About = () => {
  const { language } = useContext(ShopContext);
  const t = translations[language] || translations.en;

  return (
    <div>
      <div className='text-2xl text-center pt-8 border-t'> 
        <Title text1={language === 'en' ? 'ABOUT' : t.aboutTitle.toUpperCase().slice(0, 5)} text2={language === 'en' ? 'US' : t.aboutTitle.toUpperCase().slice(5)} />
      </div>

      <div className='my-10 flex flex-col md:flex-row gap-16 items-center'>
        <div className='relative w-full md:max-w-[450px] p-2 border border-[#c9a96e]/50 bg-white shadow-[0_18px_45px_rgba(31,41,55,0.14)]'>
          <img className='w-full aspect-[4/5] object-cover brightness-[0.97] contrast-[1.04]' src={assets.about_img} alt="Curated Forever fashion and lifestyle collection" loading='lazy' decoding='async' />
          <div className='pointer-events-none absolute inset-2 bg-gradient-to-tr from-[#1f2937]/10 via-transparent to-[#c9a96e]/20' />
        </div>
        <div className='flex flex-col justify-center gap-6 md:w-2/4 text-gray-600 leading-relaxed'>
        <p>Forever is a destination for considered living, created for those who believe everyday style should feel extraordinary. We bring together luxury statements, premium essentials, and beautifully made mid-range pieces so every customer can discover something that feels uniquely theirs.</p>
        <p>From fashion and beauty to electronics and home essentials, every collection is chosen with a sharp eye for design, quality, and lasting value. We partner with trusted brands and suppliers to make a more refined shopping experience available from the comfort of home.</p>
        <b className='text-gray-900'>{t.mission}</b>
        <p>Our mission at Forever is to make elevated shopping feel personal, effortless, and within reach. Whether you are investing in an iconic piece or finding a thoughtful everyday upgrade, we are here to help you shop with confidence, convenience, and a little more pleasure.</p>
        </div>
      </div>

      <div className='text-xl py-4'>
        <Title text1={language === 'en' ? 'WHY ' : t.whyChooseUs.slice(0, 4).toUpperCase()} text2={language === 'en' ? 'CHOOSE US' : t.whyChooseUs.slice(4)} />
      </div>

      <div className='flex flex-col md:flex-row text-sm mb-20'>
        <div className='border px-10 md:px-16 py-8 sm:py-20 flex flex-col gap-5'>
          <b>{t.qualityAssurance}</b>
          <p className='text-gray-600'>Every piece is selected for its design, craftsmanship, and ability to bring lasting value to your life.</p>
        </div>
        <div className='border px-10 md:px-16 py-8 sm:py-20 flex flex-col gap-5'>
          <b>{t.convenience}</b>
          <p className='text-gray-600'>Discover luxury, premium, and accessible mid-range collections in one beautifully simple destination.</p>
        </div>
        <div className='border px-10 md:px-16 py-8 sm:py-20 flex flex-col gap-5'>
          <b>{t.customerService}</b>
          <p className='text-gray-600'>From your first visit to delivery at your door, thoughtful service is at the heart of Forever.</p>
        </div>

      </div>
      <NewsletterBox/>

    </div>
  )
}

export default About
