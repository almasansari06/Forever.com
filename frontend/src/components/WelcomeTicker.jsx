import React, { useContext } from 'react';
import { ShopContext } from '../context/ShopContext';

const WelcomeTicker = () => {
  const { countryDetails } = useContext(ShopContext);
  const countryName = countryDetails?.name || 'your country';
  const flag = countryDetails?.flag || '🌍';
  const message = `Welcome to Forever - proudly serving ${countryName}`;

  return (
    <div className='welcome-ticker' role='status' aria-label={`Welcome message for ${countryName}`}>
      <div className='welcome-ticker__track'>
        {[0, 1].map((copy) => (
          <span className='welcome-ticker__message' key={copy} aria-hidden={copy === 1}>
            <span aria-hidden='true'>{flag}</span>
            {message}
            <span className='welcome-ticker__dot' aria-hidden='true'>✦</span>
          </span>
        ))}
      </div>
    </div>
  );
};

export default WelcomeTicker;