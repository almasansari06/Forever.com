import React, { useContext, useEffect, useState } from 'react';
import { ShopContext } from '../context/ShopContext';
import { countryCodes } from '../data/countryCodes';
import { translations } from '../data/translations';
import axios from 'axios';
import { toast } from 'react-toastify';

const MyProfile = () => {
  const { userData, setUserData, token, backendUrl, loadUserProfileData, language } = useContext(ShopContext);
  const t = translations[language] || translations.en;
  const [isEdit, setIsEdit] = useState(false);
  const [showCountryDropdown, setShowCountryDropdown] = useState(false);
  const [countrySearch, setCountrySearch] = useState('');
  const [filteredCountries, setFilteredCountries] = useState(countryCodes);

  useEffect(() => {
    const filtered = countryCodes.filter((country) =>
      country.name.toLowerCase().includes(countrySearch.toLowerCase()) ||
      country.code.includes(countrySearch)
    );
    setFilteredCountries(filtered);
  }, [countrySearch]);

  const handleCountryCodeSelect = (countryData) => {
    setUserData((prev) => ({
      ...prev,
      address: {
        ...(prev?.address || {}),
        countryCode: countryData.code,
      },
    }));
    setCountrySearch('');
    setShowCountryDropdown(false);
  };

  const updateUserProfileData = async () => {
    if (userData && (userData.status === 'disabled' || userData.status === 'deleted')) {
      toast.error(userData.status === 'deleted' ? 'Your account has been deleted and cannot be updated.' : 'Your account is disabled. You cannot update profile.');
      return;
    }
    try {
      const response = await axios.post(
        backendUrl + '/api/user/update-profile',
        {
          name: userData.name,
          phone: userData.phone,
          address: userData.address,
          gender: userData.gender,
          dob: userData.dob,
        },
        { headers: { token } }
      );

      if (response.data.success) {
        toast.success(response.data.message);
        await loadUserProfileData();
        setIsEdit(false);
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.log(error);
      toast.error(error.message);
    }
  };

  if (!userData) {
    return (
      <div className='min-h-[50vh] flex items-center justify-center text-gray-500 font-medium'>
        {t.loadingProfile}
      </div>
    );
  }

  return (
    <div className='max-w-lg flex flex-col gap-4 text-sm pt-5'>
      <div className='flex flex-col gap-1'>
        {isEdit ? (
          <input
            className='bg-gray-100 text-3xl font-medium max-w-60 p-1 rounded border dark:bg-slate-800 dark:text-white dark:border-slate-600'
            type="text"
            value={userData.name || ''}
            onChange={(e) => {
              const val = e.target.value;
              setUserData((prev) => ({ ...prev, name: val }));
            }}
          />
        ) : (
          <p className='font-medium text-3xl text-neutral-800 dark:text-white border-b pb-2'>
            {userData.name}
          </p>
        )}
      </div>

      <hr className='bg-zinc-200 dark:bg-slate-700 h-px border-none' />

      <div>
        <p className='text-zinc-500 dark:text-slate-400 underline mt-3 font-semibold uppercase'>{t.contactInformation}</p>
        <div className='grid grid-cols-[1fr_3fr] gap-y-2.5 mt-3 text-neutral-700 dark:text-slate-300'>
          <p className='font-medium'>{t.emailId}</p>
          <p className='text-blue-500'>{userData.email}</p>

          <p className='font-medium'>{t.phone}</p>
          {isEdit ? (
            <div className='flex gap-2 max-w-72'>
              <div className='relative flex-shrink-0 w-28'>
                <button
                  type='button'
                  onClick={() => setShowCountryDropdown(!showCountryDropdown)}
                  className='w-full border border-gray-300 rounded bg-white text-left text-sm font-medium flex items-center justify-between px-2 py-1.5 dark:bg-slate-800 dark:border-slate-600 dark:text-white hover:border-gray-400 transition-colors'
                >
                  <span>{userData.address?.countryCode || '+1'}</span>
                  <span className='text-xs'>▼</span>
                </button>

                {showCountryDropdown && (
                  <div className='absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded shadow-lg z-10 max-h-64 overflow-y-auto dark:bg-slate-800 dark:border-slate-600'>
                    <input
                      type='text'
                      placeholder='Search country...'
                      value={countrySearch}
                      onChange={(e) => setCountrySearch(e.target.value)}
                      className='w-full border-b border-gray-300 px-3 py-2 text-sm sticky top-0 bg-white dark:bg-slate-800 dark:border-slate-600 dark:text-white'
                    />
                    <div className='max-h-56 overflow-y-auto'>
                      {filteredCountries.length > 0 ? (
                        filteredCountries.map((country) => (
                          <button
                            key={country.code}
                            type='button'
                            onClick={() => handleCountryCodeSelect(country)}
                            className='w-full text-left px-3 py-2 text-sm hover:bg-gray-100 transition-colors flex items-center gap-2 dark:hover:bg-slate-700 dark:text-white'
                          >
                            <span>{country.flag}</span>
                            <span>{country.name}</span>
                            <span className='ml-auto text-gray-500'>{country.code}</span>
                          </button>
                        ))
                      ) : (
                        <div className='px-3 py-2 text-sm text-gray-500 dark:text-slate-300'>No countries found</div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              <input
                className='bg-gray-100 flex-1 p-1 rounded border dark:bg-slate-800 dark:text-white dark:border-slate-600'
                type="text"
                value={userData.phone || ''}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, '');
                  setUserData((prev) => ({ ...prev, phone: val }));
                }}
                placeholder={t.phoneNumber}
              />
            </div>
          ) : (
            <p className='text-blue-400 dark:text-blue-300'>
              {userData.phone ? `${userData.address?.countryCode || '+1'}${userData.phone}` : t.noPhoneNumber}
            </p>
          )}

          <p className='font-medium'>{t.address}</p>
          {isEdit ? (
            <div className='grid gap-2'>
              <input
                className='bg-gray-100 dark:bg-slate-800 dark:text-white dark:border-slate-600 p-1 rounded border'
                onChange={(e) => {
                  const val = e.target.value;
                  setUserData((prev) => ({
                    ...prev,
                    address: { ...(prev.address || {}), street: val }
                  }));
                }}
                value={userData.address?.street || userData.address?.line1 || ''}
                type="text"
                placeholder={t.streetAddress}
              />
              <div className='grid grid-cols-2 gap-2'>
                <input
                  className='bg-gray-100 p-1 rounded border dark:bg-slate-800 dark:text-white dark:border-slate-600'
                  onChange={(e) => {
                    const val = e.target.value;
                    setUserData((prev) => ({
                      ...prev,
                      address: { ...(prev.address || {}), city: val }
                    }));
                  }}
                  value={userData.address?.city || ''}
                  type="text"
                  placeholder={t.city}
                />
                <input
                  className='bg-gray-100 p-1 rounded border dark:bg-slate-800 dark:text-white dark:border-slate-600'
                  onChange={(e) => {
                    const val = e.target.value;
                    setUserData((prev) => ({
                      ...prev,
                      address: { ...(prev.address || {}), state: val }
                    }));
                  }}
                  value={userData.address?.state || ''}
                  type="text"
                  placeholder={t.state}
                />
              </div>
              <div className='grid grid-cols-2 gap-2'>
                <input
                  className='bg-gray-100 p-1 rounded border dark:bg-slate-800 dark:text-white dark:border-slate-600'
                  onChange={(e) => {
                    const val = e.target.value;
                    setUserData((prev) => ({
                      ...prev,
                      address: { ...(prev.address || {}), zipcode: val }
                    }));
                  }}
                  value={userData.address?.zipcode || ''}
                  type="text"
                  placeholder={t.zipcode}
                />
                <input
                  className='bg-gray-100 p-1 rounded border dark:bg-slate-800 dark:text-white dark:border-slate-600'
                  onChange={(e) => {
                    const val = e.target.value;
                    setUserData((prev) => ({
                      ...prev,
                      address: { ...(prev.address || {}), country: val }
                    }));
                  }}
                  value={userData.address?.country || ''}
                  type="text"
                  placeholder={t.country}
                />
              </div>
            </div>
          ) : (
            <div className='text-gray-500 dark:text-slate-300'>
              <p>{userData.address?.street || userData.address?.line1 || 'No address added'}</p>
              {userData.address?.city && <p>{userData.address?.city}</p>}
              {userData.address?.state && <p>{userData.address?.state}</p>}
              {userData.address?.zipcode && <p>{userData.address?.zipcode}</p>}
              {userData.address?.country && <p>{userData.address?.country}</p>}
            </div>
          )}
        </div>
      </div>

      <div>
        <p className='text-zinc-500 dark:text-slate-400 underline mt-3 font-semibold uppercase'>{t.basicInformation}</p>
        <div className='grid grid-cols-[1fr_3fr] gap-y-2.5 mt-3 text-neutral-700 dark:text-slate-300'>
          <p className='font-medium'>{t.gender}</p>
          {isEdit ? (
            <select
              className='max-w-28 bg-gray-100 p-1 rounded border dark:bg-slate-800 dark:text-white dark:border-slate-600'
              onChange={(e) => {
                const val = e.target.value;
                setUserData((prev) => ({ ...prev, gender: val }));
              }}
              value={userData.gender || 'Not Selected'}
            >
              <option value="Not Selected">{t.notSelected}</option>
              <option value="Male">{t.male}</option>
              <option value="Female">{t.female}</option>
            </select>
          ) : (
            <p className='text-gray-500 dark:text-slate-300'>{userData.gender || t.notSelected}</p>
          )}

          <p className='font-medium'>{t.birthday}</p>
          {isEdit ? (
            <input
              className='max-w-36 bg-gray-100 p-1 rounded border dark:bg-slate-800 dark:text-white dark:border-slate-600'
              type="date"
              onChange={(e) => {
                const val = e.target.value;
                setUserData((prev) => ({ ...prev, dob: val }));
              }}
              value={userData.dob || ''}
            />
          ) : (
            <p className='text-gray-500 dark:text-slate-300'>{userData.dob || t.notSelected}</p>
          )}
        </div>
      </div>

      <div className='mt-6'>
        {isEdit ? (
          <button
            onClick={updateUserProfileData}
            className='border border-black dark:border-white px-8 py-2 rounded-full hover:bg-black hover:text-white dark:hover:bg-slate-700 transition-all cursor-pointer dark:text-white'
          >
            {t.saveInformation}
          </button>
        ) : (
          <button
            onClick={() => {
              if (userData && (userData.status === 'disabled' || userData.status === 'deleted')) {
                toast.error(userData.status === 'deleted' ? 'Your account has been deleted and cannot be edited.' : 'Your account is disabled. You cannot edit profile.');
                return;
              }
              setIsEdit(true);
            }}
            className='border border-black dark:border-white px-8 py-2 rounded-full hover:bg-black hover:text-white dark:hover:bg-slate-700 transition-all cursor-pointer dark:text-white'
          >
            {t.edit}
          </button>
        )}
      </div>
    </div>
  );
};

export default MyProfile;
