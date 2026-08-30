import React, { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { backendUrl } from '../App';

const Shuffle = ({ token }) => {
  const [loading, setLoading] = useState(false);

  const handleShuffle = async () => {
    const confirmed = window.confirm('Are you sure you want to shuffle all website products?');
    if (!confirmed) return;

    setLoading(true);
    try {
      const response = await axios.post(
        `${backendUrl}/api/product/shuffle`,
        {},
        { headers: { token } }
      );

      if (response.data.success) {
        toast.success(response.data.message || 'Products shuffled successfully.');
      } else {
        toast.error(response.data.message || 'Unable to shuffle products.');
      }
    } catch (error) {
      console.log(error);
      toast.error(error.response?.data?.message || error.message || 'Shuffle failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='flex min-h-[60vh] flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center'>
      <div className='max-w-xl'>
        <p className='mb-3 text-xs font-semibold uppercase tracking-[0.25em] text-slate-400'>Website Display</p>
        <h2 className='text-2xl font-bold text-slate-800'>Shuffle Products</h2>
        <p className='mt-3 text-sm text-slate-600'>
          This will randomize the order of all products across the site so they no longer appear line-by-line in creation order.
        </p>

        <button
          type='button'
          onClick={handleShuffle}
          disabled={loading}
          className='mt-6 inline-flex items-center justify-center rounded-xl bg-slate-900 px-6 py-3 text-sm font-semibold text-white shadow transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-60'
        >
          {loading ? 'Shuffling...' : 'Shuffle All Products'}
        </button>
      </div>
    </div>
  );
};

export default Shuffle;
