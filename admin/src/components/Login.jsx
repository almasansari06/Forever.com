import axios from 'axios'
import React, { useState } from 'react'
import { backendUrl } from '../App'
import { toast } from 'react-toastify'

const Login = ({setToken}) => {

    const [email,setEmail] = useState('foreverglobal.new@gmail.com')
    const [password,setPassword] = useState('')
    const [otpSent,setOtpSent] = useState(false)
    const [otp,setOtp] = useState('')
    const [newPassword,setNewPassword] = useState('')
    const [resetMode,setResetMode] = useState(false)
    const [isSubmitting,setIsSubmitting] = useState(false)

    const sendResetOtp = async () => {
        try {
            setIsSubmitting(true)
            const response = await axios.post(backendUrl + '/api/user/admin/forgot-password', { email: email || 'foreverglobal.new@gmail.com' })
            if (response.data.success) {
                setOtpSent(true)
                setResetMode(true)
                toast.success(response.data.message || 'OTP sent to admin email.')
            } else {
                toast.error(response.data.message)
            }
        } catch (error) {
            console.log(error)
            toast.error(error.response?.data?.message || error.message)
        } finally {
            setIsSubmitting(false)
        }
    }

    const verifyOtpAndResetPassword = async () => {
        try {
            setIsSubmitting(true)
            if (!otp || !newPassword) {
                toast.error('Please enter the OTP and new password.')
                return
            }

            const verifyResponse = await axios.post(backendUrl + '/api/user/admin/verify-otp', { email: email || 'foreverglobal.new@gmail.com', otp })
            if (!verifyResponse.data.success) {
                toast.error(verifyResponse.data.message)
                return
            }

            const resetResponse = await axios.post(backendUrl + '/api/user/admin/reset-password', {
                email: email || 'foreverglobal.new@gmail.com',
                otp,
                newPassword,
            })

            if (resetResponse.data.success) {
                setOtpSent(false)
                setOtp('')
                setNewPassword('')
                setResetMode(false)
                setPassword('')
                toast.success(resetResponse.data.message || 'Password updated successfully.')
            } else {
                toast.error(resetResponse.data.message)
            }
        } catch (error) {
            console.log(error)
            toast.error(error.response?.data?.message || error.message)
        } finally {
            setIsSubmitting(false)
        }
    }

    const onSubmitHandler = async (e) => {
        try {
            e.preventDefault();
            const response = await axios.post(backendUrl+ '/api/user/admin',{email,password})
            if (response.data.success) {
                setToken(response.data.token)
            }
            else{
                toast.error(response.data.message)
            }
            
        } catch (error) {
            console.log(error);
            toast.error(error.message)
            
        }
    }

  return (
    <div className='min-h-screen flex items-center justify-center w-full'>
        <div className='bg-white shadow-md rounded-lg px-8 py-6 max-w-md'>
            <h1 className='text-2xl font-bold mb-4'>Admin Panel</h1>
            {!resetMode ? (
                <form onSubmit={onSubmitHandler}>
                    <div className='mb-3 min-w-72'>
                        <p className='text-sm font-medium text-gray-700 mb-2'>Email Address</p>
                        <input onChange={(e)=>setEmail(e.target.value)} value={email} className='rounded-md w-full px-3 py-2 border border-gray-300 outline-none' type="email" placeholder='your@email.com' required/>
                    </div>
                    <div className='mb-3 min-w-72'>
                        <p className='text-sm font-medium text-gray-700 mb-2'>Password</p>
                        <input onChange={(e)=>setPassword(e.target.value)} value={password} className='rounded-md w-full px-3 py-2 border border-gray-300 outline-none' type="password" placeholder='Enter your password' required/>
                    </div>
                    <button className='mt-2 w-full py-2 px-4 rounded-md text-white bg-black cursor-pointer' type='submit'>Login</button>
                    <button type='button' className='mt-3 text-sm font-medium text-gray-600 underline' onClick={sendResetOtp} disabled={isSubmitting}>
                        Forgot Password?
                    </button>
                </form>
            ) : (
                <div className='space-y-3 min-w-72'>
                    <div>
                        <p className='text-sm font-medium text-gray-700 mb-2'>Admin Email</p>
                        <input value={email || 'foreverglobal.new@gmail.com'} onChange={(e)=>setEmail(e.target.value)} className='rounded-md w-full px-3 py-2 border border-gray-300 outline-none' type='email' readOnly />
                    </div>
                    <div>
                        <p className='text-sm font-medium text-gray-700 mb-2'>Enter OTP</p>
                        <input value={otp} onChange={(e)=>setOtp(e.target.value)} className='rounded-md w-full px-3 py-2 border border-gray-300 outline-none' placeholder='6-digit OTP' />
                    </div>
                    <div>
                        <p className='text-sm font-medium text-gray-700 mb-2'>New Password</p>
                        <input value={newPassword} onChange={(e)=>setNewPassword(e.target.value)} className='rounded-md w-full px-3 py-2 border border-gray-300 outline-none' type='password' placeholder='Enter new password' />
                    </div>
                    <button className='mt-2 w-full py-2 px-4 rounded-md text-white bg-black cursor-pointer' type='button' onClick={verifyOtpAndResetPassword} disabled={isSubmitting}>
                        {isSubmitting ? 'Processing...' : 'Submit New Password'}
                    </button>
                    <button type='button' className='w-full text-sm font-medium text-gray-600 underline' onClick={() => setResetMode(false)}>
                        Back to Login
                    </button>
                </div>
            )}
        </div>
    </div>
  )
}

export default Login
