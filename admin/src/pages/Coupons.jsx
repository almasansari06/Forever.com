import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { backendUrl } from '../App';
import { toast } from 'react-toastify';

const Coupons = ({ token }) => {
  const [coupons, setCoupons] = useState([]);
  const [code, setCode] = useState('');
  const [discountPercentage, setDiscountPercentage] = useState('10');

  const fetchCoupons = async () => {
    try {
      const response = await axios.get(`${backendUrl}/api/coupon/list`, { headers: { token } });
      if (response.data.success) {
        setCoupons(response.data.coupons || []);
      } else {
        toast.error(response.data.message || 'Unable to load coupons.');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  const addCoupon = async (event) => {
    event.preventDefault();
    const normalizedCode = code.trim().toUpperCase();
    const percentage = Number(discountPercentage);

    if (!normalizedCode) {
      toast.error('Coupon code is required.');
      return;
    }
    if (!Number.isInteger(percentage) || percentage < 10 || percentage > 100) {
      toast.error('Discount must be between 10% and 100%.');
      return;
    }

    try {
      const response = await axios.post(
        `${backendUrl}/api/coupon/add`,
        { code: normalizedCode, discountPercentage: percentage },
        { headers: { token } },
      );
      if (response.data.success) {
        setCoupons((previous) => [response.data.coupon, ...previous]);
        setCode('');
        setDiscountPercentage('10');
        toast.success(response.data.message);
      } else {
        toast.error(response.data.message || 'Unable to create coupon.');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    }
  };

  const toggleCoupon = async (couponCode) => {
    try {
      // ⚡ Optimistic update
      setCoupons((previous) => previous.map((coupon) => (
        coupon.code === couponCode ? {...coupon, active: !coupon.active} : coupon
      )));

      const response = await axios.post(`${backendUrl}/api/coupon/toggle`, { code: couponCode }, { headers: { token } });
      if (response.data.success) {
        setCoupons((previous) => previous.map((coupon) => (
          coupon.code === couponCode ? response.data.coupon : coupon
        )));
        toast.success('✅ Coupon updated!')
      } else {
        toast.error(response.data.message || 'Unable to update coupon.');
        // ⚡ Revert on error
        await fetchCoupons();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
      // ⚡ Revert on error
      await fetchCoupons();
    }
  };

  const deleteCoupon = async (couponCode) => {
    if (!window.confirm(`Do you want to delete coupon "${couponCode}"?`)) return;

    try {
      // ⚡ Optimistic update
      setCoupons((previous) => previous.filter((coupon) => coupon.code !== couponCode));

      const response = await axios.post(`${backendUrl}/api/coupon/delete`, { code: couponCode }, { headers: { token } });
      if (response.data.success) {
        toast.success('✅ Coupon deleted!')
      } else {
        toast.error(response.data.message || 'Unable to delete coupon.');
        // ⚡ Revert on error
        await fetchCoupons();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
      // ⚡ Revert on error
      await fetchCoupons();
    }
  };

  return (
    <div>
      <div className='mb-6'>
        <h2 className='text-xl font-semibold'>Coupons</h2>
        <p className='mt-1 text-sm text-slate-500'>Create percentage discounts from 10% to 100%.</p>
      </div>

      <form onSubmit={addCoupon} className='mb-8 grid gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4 sm:grid-cols-[1fr_180px_auto] sm:items-end'>
        <label className='text-sm font-medium'>
          Coupon code
          <input
            value={code}
            onChange={(event) => setCode(event.target.value.toUpperCase())}
            placeholder='e.g. SUMMER20'
            className='mt-2 w-full rounded border border-slate-300 bg-white px-3 py-2 font-normal outline-none focus:border-slate-900'
            maxLength={30}
          />
        </label>
        <label className='text-sm font-medium'>
          Discount percentage
          <select
            value={discountPercentage}
            onChange={(event) => setDiscountPercentage(event.target.value)}
            className='mt-2 w-full rounded border border-slate-300 bg-white px-3 py-2 font-normal outline-none focus:border-slate-900'
          >
            {Array.from({ length: 19 }, (_, index) => (index + 1) * 5).filter((value) => value >= 10).map((value) => (
              <option key={value} value={value}>{value}% off</option>
            ))}
          </select>
        </label>
        <button type='submit' className='rounded bg-slate-900 px-5 py-2 text-sm font-semibold text-white hover:bg-slate-700'>
          Add Coupon
        </button>
      </form>

      <div className='space-y-3'>
        {coupons.length === 0 ? (
          <p className='rounded border border-dashed border-slate-300 p-8 text-center text-sm text-slate-500'>No coupons created yet.</p>
        ) : coupons.map((coupon) => (
          <div key={coupon._id} className='flex flex-col gap-3 rounded-xl border border-slate-200 p-4 sm:flex-row sm:items-center sm:justify-between'>
            <div>
              <p className='font-semibold tracking-wide'>{coupon.code}</p>
              <p className='text-sm text-slate-500'>{coupon.discountPercentage}% discount</p>
            </div>
            <div className='flex flex-wrap items-center gap-2'>
              <button
                type='button'
                onClick={() => toggleCoupon(coupon.code)}
                className={`rounded px-3 py-2 text-xs font-semibold ${coupon.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}
              >
                {coupon.isActive ? 'Live' : 'Inactive'}
              </button>
              <button
                type='button'
                onClick={() => deleteCoupon(coupon.code)}
                className='rounded bg-red-100 px-3 py-2 text-xs font-semibold text-red-700 hover:bg-red-200'
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Coupons;
