import React, { useState, useContext, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { ShopContext } from '../context/ShopContext';
import { countryCodes } from '../data/countryCodes';
import { translations } from '../data/translations';
import axios from 'axios';
import { toast } from 'react-toastify';

const PlaceOrder = () => {
    const [method, setMethod] = useState('cod'); // Default COD
    const { backendUrl, token, formatPrice, cartItems, getCartAmount, delivery_fee, products, navigate, setCartItems, userData, language } = useContext(ShopContext);
    const t = translations[language] || translations.en;
    const [showCountryDropdown, setShowCountryDropdown] = useState(false);
    const [countrySearch, setCountrySearch] = useState('');
    const [filteredCountries, setFilteredCountries] = useState(countryCodes);
    const [couponCode, setCouponCode] = useState('');
    const [appliedCoupon, setAppliedCoupon] = useState(null);
    const [couponLoading, setCouponLoading] = useState(false);
    const { state } = useLocation();
    const selectedItems = Array.isArray(state?.selectedItems) ? state.selectedItems : null;

    const [formData, setFormData] = useState({
        firstName: '', lastName: '', email: '', street: '', city: '', state: '', zipcode: '', country: '', phone: '', countryCode: '+1'
    });

    // Autofill formData from saved user profile address when available
    useEffect(() => {
        if (userData) {
            const addr = userData.address || {};
            const nameParts = (userData.name || '').split(' ');
            const savedCountryCode = addr.countryCode || '+1';
            const savedPhone = (userData.phone || '').replace(/\D/g, '');
            const phoneWithoutCountry = (() => {
                if (!userData.phone) return '';
                const explicitCode = (addr.countryCode || '').replace(/\D/g, '');
                const phoneDigits = userData.phone.replace(/\D/g, '');
                if (explicitCode && phoneDigits.startsWith(explicitCode)) {
                    return phoneDigits.slice(explicitCode.length);
                }
                const matchedCountry = countryCodes.find((country) => {
                    const codeDigits = country.code.replace(/\D/g, '');
                    return codeDigits && phoneDigits.startsWith(codeDigits);
                });
                if (matchedCountry) {
                    return phoneDigits.slice(matchedCountry.code.replace(/\D/g, '').length);
                }
                return phoneDigits;
            })();

            setFormData((prev) => ({
                ...prev,
                firstName: nameParts[0] || prev.firstName,
                lastName: nameParts.slice(1).join(' ') || prev.lastName,
                email: userData.email || prev.email,
                phone: phoneWithoutCountry || prev.phone,
                street: addr.street || addr.line1 || prev.street,
                city: addr.city || prev.city,
                state: addr.state || prev.state,
                zipcode: addr.zipcode || prev.zipcode,
                country: addr.country || prev.country,
                countryCode: savedCountryCode || '+1'
            }));
        }
    }, [userData]);

    // Filter countries based on search
    useEffect(() => {
        const filtered = countryCodes.filter(c =>
            c.name.toLowerCase().includes(countrySearch.toLowerCase()) ||
            c.code.includes(countrySearch)
        );
        setFilteredCountries(filtered);
    }, [countrySearch]);

    const onChangeHandler = (event) => {
        const name = event.target.name;
        let value = event.target.value;
        
        // Allow only numbers for zipcode
        if (name === 'zipcode') {
            value = value.replace(/\D/g, '');
        }
        
        // Allow only numbers for phone
        if (name === 'phone') {
            value = value.replace(/\D/g, '');
        }

        if (name === 'country') {
            const normalizedCountry = value.trim().toLowerCase().replace(/\s+/g, ' ');
            const matchedCountry = countryCodes.find((country) => (
                country.name.toLowerCase().replace(/\s+/g, ' ') === normalizedCountry
            ));

            setFormData(data => ({
                ...data,
                country: value,
                ...(matchedCountry ? { countryCode: matchedCountry.code } : {})
            }));
            return;
        }

        setFormData(data => ({ ...data, [name]: value }));
    };

    const handleCountryCodeSelect = (countryData) => {
        setFormData(prev => ({
            ...prev,
            countryCode: countryData.code
        }));
        setCountrySearch('');
        setShowCountryDropdown(false);
    };

    const handleApplyCoupon = async () => {
        const code = couponCode.trim().toUpperCase();
        if (!code) {
            toast.error('Please enter a coupon code.');
            return;
        }

        setCouponLoading(true);
        try {
            const response = await axios.post(
                `${backendUrl}/api/coupon/validate`,
                { code },
                { headers: { token } },
            );
            if (response.data.success) {
                setCouponCode(response.data.coupon.code);
                setAppliedCoupon(response.data.coupon);
                toast.success(`${response.data.coupon.discountPercentage}% discount applied.`);
            } else {
                setAppliedCoupon(null);
                toast.error(response.data.message || 'Invalid coupon code.');
            }
        } catch (error) {
            setAppliedCoupon(null);
            toast.error(error.response?.data?.message || error.message);
        } finally {
            setCouponLoading(false);
        }
    };

    const onSubmitHandler = async (event) => {
        event.preventDefault();
        // Prevent disabled/deleted users from placing orders
        if (userData && (userData.status === 'disabled' || userData.status === 'deleted')) {
            toast.error(userData.status === 'deleted' ? 'Your account has been deleted and cannot place orders.' : 'Your account is disabled. You cannot place orders.');
            return;
        }
        try {
            let orderItems = [];
            for (const items in cartItems) {
                for (const item in cartItems[items]) {
                    const itemKey = `${items}:${item}`;
                    if (cartItems[items][item] > 0 && (!selectedItems || selectedItems.includes(itemKey))) {
                        const itemInfo = structuredClone(products.find(product => product._id === items));
                        if (itemInfo) {
                            itemInfo.size = item;
                            itemInfo.quantity = cartItems[items][item];
                            orderItems.push(itemInfo);
                        }
                    }
                }
            }

            // Combine country code with phone number
            const fullPhone = formData.countryCode + formData.phone;

            let orderData = {
                address: {
                    ...formData,
                    phone: fullPhone
                },
                items: orderItems,
                amount: finalAmount,
                couponCode: appliedCoupon?.code || '',
            };

            if (method === 'cod') {
                const response = await axios.post(`${backendUrl}/api/order/place`, orderData, { headers: { token } });
                if (response.data.success) {
                    setCartItems({});
                    navigate('/orders');
                } else {
                    toast.error(response.data.message);
                }
            } else if (method === 'stripe') {
                const responseStripe = await axios.post(`${backendUrl}/api/order/stripe`, orderData, { headers: { token } });
                if (responseStripe.data.success) {
                    const { session_url } = responseStripe.data;
                    window.location.replace(session_url);
                } else {
                    toast.error(responseStripe.data.message);
                }
            }
        } catch (error) {
            console.log(error);
            toast.error(error.message);
        }
    };

    const subtotal = Object.entries(cartItems).reduce((total, [itemId, sizes]) => {
        const product = products.find((item) => item._id === itemId);
        if (!product) return total;
        return total + Object.entries(sizes).reduce((itemTotal, [size, quantity]) => {
            const itemKey = `${itemId}:${size}`;
            return itemTotal + ((!selectedItems || selectedItems.includes(itemKey)) ? product.price * quantity : 0);
        }, 0);
    }, 0);
    const discountAmount = appliedCoupon ? (subtotal * appliedCoupon.discountPercentage) / 100 : 0;
    const finalAmount = subtotal === 0 ? 0 : subtotal - discountAmount + delivery_fee;

    return (
        <form onSubmit={onSubmitHandler} className='flex flex-col sm:flex-row justify-between gap-4 pt-5 sm:pt-14 min-h-[80vh] border-t'>
            {/* Form Fields */}
            <div className='flex flex-col gap-4 w-full sm:max-w-[480px]'>
                <input required onChange={onChangeHandler} name='firstName' value={formData.firstName} placeholder={t.firstName} className='border border-gray-300 rounded py-1.5 px-3.5 w-full' type="text" />
                <input required onChange={onChangeHandler} name='lastName' value={formData.lastName} placeholder={t.lastName} className='border border-gray-300 rounded py-1.5 px-3.5 w-full' type="text" />
                <input required onChange={onChangeHandler} name='email' value={formData.email} placeholder={t.emailAddress} className='border border-gray-300 rounded py-1.5 px-3.5 w-full' type="email" />
                <input required onChange={onChangeHandler} name='street' value={formData.street} placeholder={t.street} className='border border-gray-300 rounded py-1.5 px-3.5 w-full' type="text" />
                <div className='grid grid-cols-1 sm:grid-cols-2 gap-2'>
                    <input required onChange={onChangeHandler} name='city' value={formData.city} placeholder={t.city} className='border border-gray-300 rounded py-1.5 px-3.5 w-full' type="text" />
                    <input required onChange={onChangeHandler} name='state' value={formData.state} placeholder={t.state} className='border border-gray-300 rounded py-1.5 px-3.5 w-full' type="text" />
                </div>
                <div className='grid grid-cols-1 sm:grid-cols-2 gap-2'>
                    <input required onChange={onChangeHandler} name='zipcode' value={formData.zipcode} placeholder={t.zipcode} className='border border-gray-300 rounded py-1.5 px-3.5 w-full' type="text" />
                    <input required onChange={onChangeHandler} name='country' value={formData.country} placeholder={t.country} className='border border-gray-300 rounded py-1.5 px-3.5 w-full' type="text" />
                </div>

                {/* Phone Number with Country Code */}
                <div className='flex gap-2'>
                    <div className='relative flex-shrink-0 w-32'>
                        <button
                            type='button'
                            onClick={() => setShowCountryDropdown(!showCountryDropdown)}
                            className='w-full border border-gray-300 rounded py-1.5 px-3.5 bg-white text-left text-sm font-medium flex items-center justify-between hover:border-gray-400 transition-colors'
                        >
                            <span>{formData.countryCode}</span>
                            <span className='text-xs'>▼</span>
                        </button>

                        {/* Country Code Dropdown */}
                        {showCountryDropdown && (
                            <div className='absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded shadow-lg z-10 max-h-64 overflow-y-auto'>
                                <input
                                    type='text'
                                    placeholder={t.searchCountry}
                                    value={countrySearch}
                                    onChange={(e) => setCountrySearch(e.target.value)}
                                    className='w-full border-b border-gray-300 px-3 py-2 text-sm sticky top-0 bg-white'
                                />
                                <div className='max-h-56 overflow-y-auto'>
                                    {filteredCountries.length > 0 ? (
                                        filteredCountries.map((country) => (
                                            <button
                                                key={country.code}
                                                type='button'
                                                onClick={() => handleCountryCodeSelect(country)}
                                                className='w-full text-left px-3 py-2 text-sm hover:bg-gray-100 transition-colors flex items-center gap-2'
                                            >
                                                <span>{country.flag}</span>
                                                <span>{country.name}</span>
                                                <span className='ml-auto text-gray-500'>{country.code}</span>
                                            </button>
                                        ))
                                    ) : (
                                        <div className='px-3 py-2 text-sm text-gray-500'>{t.noCountriesFound}</div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    <input 
                        required 
                        onChange={onChangeHandler} 
                        name='phone' 
                        value={formData.phone} 
                        placeholder={t.phoneNumber} 
                        className='flex-1 border border-gray-300 rounded py-1.5 px-3.5 w-full' 
                        type="text" 
                    />
                </div>
            </div>

            <div className='mb-8 w-full max-w-md'>
                <p className='mb-2 text-sm font-medium'>Coupon Code</p>
                <div className='flex gap-2'>
                    <input
                        value={couponCode}
                        onChange={(event) => {
                            setCouponCode(event.target.value.toUpperCase());
                            setAppliedCoupon(null);
                        }}
                        placeholder='Enter coupon code'
                        className='min-w-0 flex-1 border border-gray-300 rounded px-3 py-2 text-sm uppercase'
                        disabled={couponLoading}
                    />
                    <button
                        type='button'
                        onClick={handleApplyCoupon}
                        disabled={couponLoading}
                        className='bg-black text-white px-4 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-60'
                    >
                        {couponLoading ? 'Checking...' : 'Apply'}
                    </button>
                </div>
                {appliedCoupon && (
                    <p className='mt-2 text-sm text-green-600'>Coupon applied: {appliedCoupon.discountPercentage}% off</p>
                )}
            </div>

            {/* Payment Method Selection */}
            <div className='mt-8'>
                <div className='flex gap-3 flex-col lg:flex-row'>
                    <div onClick={() => setMethod('stripe')} className={`flex items-center gap-3 border p-2 px-3 cursor-pointer ${method === 'stripe' ? 'border-green-400' : ''}`}>
                        <p className={`min-w-3.5 h-3.5 border rounded-full ${method === 'stripe' ? 'bg-green-400' : ''}`}></p>
                        <p className='text-gray-500 text-sm font-medium mx-4'>{t.stripe}</p>
                    </div>
                    <div onClick={() => setMethod('cod')} className={`flex items-center gap-3 border p-2 px-3 cursor-pointer ${method === 'cod' ? 'border-green-400' : ''}`}>
                        <p className={`min-w-3.5 h-3.5 border rounded-full ${method === 'cod' ? 'bg-green-400' : ''}`}></p>
                        <p className='text-gray-500 text-sm font-medium mx-4'>{t.cashOnDelivery}</p>
                    </div>
                </div>

                <div className='mt-6 space-y-2 text-sm text-gray-600'>
                    <div className='flex justify-between'><span>Subtotal</span><span>{formatPrice(subtotal)}</span></div>
                    {appliedCoupon && <div className='flex justify-between text-green-600'><span>Discount</span><span>-{formatPrice(discountAmount)}</span></div>}
                    <div className='flex justify-between'><span>Shipping Fee</span><span>{formatPrice(delivery_fee)}</span></div>
                    <div className='flex justify-between border-t pt-2 font-semibold text-gray-900'><span>Total</span><span>{formatPrice(finalAmount)}</span></div>
                </div>

                <div className='w-full text-end mt-8'>
                    <button type='submit' className='bg-black text-white px-16 py-3 text-sm'>{t.placeOrder}</button>
                </div>
            </div>
        </form>
    );
};

export default PlaceOrder;