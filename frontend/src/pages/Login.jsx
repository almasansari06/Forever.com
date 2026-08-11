import React, { useContext, useEffect, useState } from 'react';
import { ShopContext } from '../context/ShopContext';
import axios from 'axios';
import { toast } from 'react-toastify';

const Login = () => {
  const [currentState, setCurrentState] = useState('Login');
  const { token, setToken, navigate, backendUrl } = useContext(ShopContext);

  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');

  const onSubmitHandler = async (e) => {
    e.preventDefault();
    try {
      if (currentState === 'Sign Up with Instagram') {
        const response = await axios.post(backendUrl + '/api/user/register', { name, email, password });
        if (response.data.success) {
          setToken(response.data.token);
          localStorage.setItem('token', response.data.token);
          toast.success('You got 40% discount on your first order.');
          setTimeout(() => {
            window.location.href = '/';
          }, 1200);
        } else {
          toast.error(response.data.message);
        }
      } else {
        const response = await axios.post(backendUrl + '/api/user/login', { email, password });
        if (response.data.success) {
          setToken(response.data.token);
          localStorage.setItem('token', response.data.token);
          setTimeout(() => {
            window.location.href = '/';
          }, 500);
        } else {
          toast.error(response.data.message);
        }
      }
    } catch (error) {
      console.log(error);
      const errorMessage = error.response?.data?.message || error.message;
      toast.error(errorMessage);
    }
  };


  return (
    <form onSubmit={onSubmitHandler} className='flex flex-col items-center w-[90%] sm:max-w-96 m-auto mt-10 gap-4 text-gray-800'>
      
      {/* English Discount Banner Message */}
      <div className='promo-banner w-full rounded-xl border p-3 text-center shadow-sm'>
        <p className='text-xs font-semibold leading-relaxed text-gray-800'>
          Sign up with Instagram and get <span className='font-black text-pink-600 underline decoration-pink-500'>40% discount</span> on your first order.
        </p>
      </div>

      <div className='inline-flex items-center gap-2 mb-2 mt-4'>
        <p className='prata-regular text-2xl sm:text-3xl font-medium text-center'>{currentState}</p>
        <hr className='border-none h-[1.5px] w-8 bg-gray-800' />
      </div>

      {/* Username Field for Instagram Signup */}
      {currentState === 'Login' ? (
        ''
      ) : (
        <input
          onChange={(e) => setName(e.target.value)}
          value={name}
          type="text"
          className='w-full px-3 py-2 border border-gray-800 rounded-xs'
          placeholder='Username (Instagram Username)'
          required
        />
      )}

      {/* Email Field */}
      <input
        onChange={(e) => setEmail(e.target.value)}
        value={email}
        type="email"
        className='w-full px-3 py-2 border border-gray-800 rounded-xs'
        placeholder='Email'
        required
      />

      {/* Password Field */}
      <input
        onChange={(e) => setPassword(e.target.value)}
        value={password}
        type="password"
        className='w-full px-3 py-2 border border-gray-800 rounded-xs'
        placeholder='Password'
        required
      />

      <div className='w-full flex justify-between text-sm -mt-1'>
        <p className='cursor-pointer text-gray-500 hover:text-black transition-colors'>Forgot your password?</p>
        {currentState === 'Login' ? (
          <p onClick={() => setCurrentState('Sign Up with Instagram')} className='cursor-pointer font-medium text-pink-600 hover:underline'>
            Create Account
          </p>
        ) : (
          <p onClick={() => setCurrentState('Login')} className='cursor-pointer font-medium text-gray-700 hover:underline'>
            Login Here
          </p>
        )}
      </div>

      <button className='bg-black text-white font-light px-8 py-2.5 mt-4 w-full sm:w-auto hover:bg-gray-800 transition-all cursor-pointer shadow-sm active:scale-95'>
        {currentState === 'Login' ? 'Sign In' : 'Sign Up with Instagram'}
      </button>
    </form>
  );
};

export default Login;
