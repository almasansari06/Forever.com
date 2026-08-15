import React, { useEffect, useState } from 'react'
import Navbar from './components/NavBar'
import Sidebar from './components/SideBar'
import { Routes, Route } from 'react-router-dom'
import Add from './pages/Add'
import List from './pages/List'
import Orders from './pages/Orders'
import CancelledOrders from './pages/CancelledOrders'
import Users from './pages/Users'
import Login from './components/Login'
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:4000'
export const currency = '$'

const App = () => {
  const storedToken = localStorage.getItem('token');
  const isTokenValidFormat = (t) => typeof t === 'string' && t.split('.').length === 3;
  const initialToken = isTokenValidFormat(storedToken) ? storedToken : '';

  const [token, setToken] = useState(initialToken);

  useEffect(() => {
    if (isTokenValidFormat(token)) {
      localStorage.setItem('token', token);
    } else {
      localStorage.removeItem('token');
    }
  }, [token])

  return (
    <div className='min-h-screen bg-slate-100 text-slate-800'>
      <ToastContainer position='top-right' autoClose={3000} hideProgressBar={false} closeOnClick pauseOnHover theme='colored' />
      {token === ""
        ? <Login setToken={setToken} />
        : <>
            <Navbar setToken={setToken} />
            <div className='mx-auto max-w-[1600px] px-4 py-6 lg:px-6'>
              <div className='flex flex-col gap-6 lg:flex-row'>
                <Sidebar />
                <main className='flex-1 rounded-2xl border border-slate-200 bg-white p-4 shadow-[0_12px_35px_rgba(15,23,42,0.06)] sm:p-6'>
                  <Routes>
                    <Route path='/add' element={<Add token={token} />} />
                    <Route path='/list' element={<List token={token} />} />
                    <Route path='/orders' element={<Orders token={token} />} />
                    <Route path='/cancelled' element={<CancelledOrders token={token} />} />
                    <Route path='/users' element={<Users token={token} />} />
                  </Routes>
                </main>
              </div>
            </div>
          </>
      }
    </div>
  )
}

export default App
