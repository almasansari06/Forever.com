import React from 'react';
import { assets } from '../assets/assets';

const getOptimizedSource = (source) => (
  typeof source === 'string' && source.includes('/upload/')
    ? source.replace('/upload/', '/upload/f_auto,q_auto/')
    : source
);

const WatermarkedImage = ({ watermarked = false, className = '', wrapperClassName = '', loading = 'lazy', decoding = 'async', src, ...imageProps }) => (
  <div className={`relative ${wrapperClassName}`}>
    <img {...imageProps} src={getOptimizedSource(src)} loading={loading} decoding={decoding} className={className} />
    {!watermarked && (
      <img
        src={assets.logo}
        alt=''
        aria-hidden='true'
        className='pointer-events-none absolute right-2 top-2 z-10 w-[28%] max-w-28 min-w-10 object-contain opacity-90'
      />
    )}
  </div>
);

export default WatermarkedImage;
