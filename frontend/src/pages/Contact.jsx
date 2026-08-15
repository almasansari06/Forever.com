import React, { useContext, useState } from 'react';
import Title from '../components/Title';
import { assets } from '../assets/assets';
import NewsletterBox from '../components/NewsletterBox';
import { countryCodes } from '../data/countryCodes';
import axios from 'axios';
import { toast } from 'react-toastify';
import { ShopContext } from '../context/ShopContext';
import { translations } from '../data/translations';

const Contact = () => {
  const { language } = useContext(ShopContext);
  const t = translations[language] || translations.en;
  const [showJobForm, setShowJobForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showCountryDropdown, setShowCountryDropdown] = useState(false);
  const [countrySearch, setCountrySearch] = useState('');
  const [filteredCountries, setFilteredCountries] = useState(countryCodes);
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    contact: '',
    countryCode: '+91',
    state: '',
    city: '',
    address: '',
    aadharNumber: '',
    whyJoin: '',
    resume: null,
  });

  // Filter countries based on search
  React.useEffect(() => {
    const filtered = countryCodes.filter(c =>
      c.name.toLowerCase().includes(countrySearch.toLowerCase()) ||
      c.code.includes(countrySearch)
    );
    setFilteredCountries(filtered);
  }, [countrySearch]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    let newValue = value;
    
    // Allow only numbers for contact
    if (name === 'contact') {
      newValue = value.replace(/\D/g, '');
    }
    
    // Allow only numbers for aadharNumber
    if (name === 'aadharNumber') {
      newValue = value.replace(/\D/g, '');
    }

    setFormData(prev => ({
      ...prev,
      [name]: newValue
    }));
  };

  const handleCountryCodeSelect = (countryData) => {
    setFormData(prev => ({
      ...prev,
      countryCode: countryData.code
    }));
    setCountrySearch('');
    setShowCountryDropdown(false);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast.error('Resume size should be less than 5MB');
        return;
      }
      setFormData(prev => ({
        ...prev,
        resume: file
      }));
    }
  };

  const handleJobFormSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!formData.firstName.trim() || !formData.lastName.trim() || !formData.email.trim() || 
        !formData.contact.trim() || !formData.state.trim() || !formData.city.trim() || 
        !formData.address.trim() || !formData.aadharNumber.trim() || !formData.whyJoin.trim()) {
      toast.error('Please fill all fields');
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast.error('Please enter a valid email');
      return;
    }

    // Phone validation (basic)
    if (!/^\d{10}$/.test(formData.contact.replace(/\D/g, ''))) {
      toast.error('Please enter a valid 10-digit contact number');
      return;
    }

    // Aadhar validation
    if (!/^\d{12}$/.test(formData.aadharNumber.replace(/\D/g, ''))) {
      toast.error('Please enter a valid 12-digit Aadhar number');
      return;
    }

    setIsSubmitting(true);

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('firstName', formData.firstName);
      formDataToSend.append('lastName', formData.lastName);
      formDataToSend.append('email', formData.email);
      formDataToSend.append('contact', formData.countryCode + formData.contact);
      formDataToSend.append('state', formData.state);
      formDataToSend.append('city', formData.city);
      formDataToSend.append('address', formData.address);
      formDataToSend.append('aadharNumber', formData.aadharNumber);
      formDataToSend.append('whyJoin', formData.whyJoin);
      
      if (formData.resume) {
        formDataToSend.append('resume', formData.resume);
      }

      const response = await axios.post(
        import.meta.env.VITE_BACKEND_URL + '/api/user/apply-job',
        formDataToSend,
        { headers: { 'Content-Type': 'multipart/form-data' } }
      );

      if (response.data.success) {
        toast.success('Application submitted successfully! Check your email for confirmation.');
        setFormData({
          firstName: '',
          lastName: '',
          email: '',
          contact: '',
          countryCode: '+91',
          state: '',
          city: '',
          address: '',
          aadharNumber: '',
          whyJoin: '',
          resume: null,
        });
        setShowJobForm(false);
      } else {
        toast.error(response.data.message || 'Failed to submit application');
      }
    } catch (error) {
      console.log(error);
      toast.error(error.response?.data?.message || 'Error submitting application. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };
  return (
    <div className='transition-opacity duration-500 ease-in opacity-100'>
      <div className='text-center text-2xl pt-10 border-t'>
        <Title text1={language === 'en' ? 'CONTACT ' : t.contactTitle.slice(0, 4).toUpperCase()} text2={language === 'en' ? 'US' : t.contactTitle.slice(4)} />
      </div>

      <div className='my-10 flex flex-col justify-center md:flex-row gap-10 mb-28 items-center'>
        
        <img
          className='w-full md:max-w-[480px] rounded-xl shadow-md transition-transform duration-300 hover:scale-[1.02] hover:shadow-lg'
          src={assets.contact_img}
          alt="Contact Us"
        />

        <div className='flex flex-col justify-center items-start gap-6'>
          <p className='font-semibold text-xl text-gray-700 dark:text-slate-200 uppercase tracking-wide'>{t.corporateHeadOffice}</p>

          <p className='text-gray-500 dark:text-slate-400 leading-relaxed'>
            Al Wahda St - Industrial Area 4 - <br />
            Sharjah-United Arab Emirates
          </p>

          <div className='text-gray-500 dark:text-slate-400 leading-relaxed space-y-1'>
            <p><span className='font-medium text-gray-700 dark:text-slate-300'>Tel:</span> +91 999915299</p>
            <p><span className='font-medium text-gray-700 dark:text-slate-300'>Tel:</span> +976 50-523-4444</p>
            <p><span className='font-medium text-gray-700 dark:text-slate-300'>Email:</span> <a href='mailto:foreverglobal.new@gmail.com' className='text-blue-600 dark:text-blue-400 hover:underline'>foreverglobal.new@gmail.com</a></p>
          </div>

          <p className='font-semibold text-xl text-gray-700 dark:text-slate-200 uppercase tracking-wide mt-2'>{t.careers}</p>
          <p className='text-gray-500 dark:text-slate-400'>Learn more about our teams and job openings.</p>

          <button 
            onClick={() => setShowJobForm(true)}
            className='border border-black dark:border-white px-8 py-4 text-sm font-medium transition-all duration-200 hover:bg-black hover:text-white dark:hover:bg-slate-700 active:scale-95 cursor-pointer rounded-sm shadow-xs dark:text-white'
          >
            {t.exploreJobs}
          </button>
        </div>
      </div>

      {/* Job Application Form Modal */}
      {showJobForm && (
        <div className='fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto'>
          <div className='bg-white dark:bg-slate-900 rounded-lg shadow-2xl w-full max-w-2xl my-8 max-h-[90vh] overflow-y-auto'>
            {/* Form Header */}
            <div className='sticky top-0 bg-gradient-to-r from-black to-gray-800 dark:from-slate-800 dark:to-slate-900 px-6 py-4 flex items-center justify-between rounded-t-lg'>
              <h2 className='text-2xl font-bold text-white'>Join Forever Team</h2>
              <button
                onClick={() => setShowJobForm(false)}
                className='text-white text-2xl cursor-pointer hover:text-gray-300'
              >
                ×
              </button>
            </div>

            {/* Form Content */}
            <form onSubmit={handleJobFormSubmit} className='p-6 space-y-4'>
              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                {/* First Name */}
                <div>
                  <label className='block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1'>First Name *</label>
                  <input
                    type='text'
                    name='firstName'
                    value={formData.firstName}
                    onChange={handleInputChange}
                    placeholder='Enter your first name'
                    className='w-full border border-gray-300 dark:border-slate-600 dark:bg-slate-800 dark:text-white rounded-lg px-4 py-2 outline-none focus:border-black dark:focus:border-slate-400'
                    required
                  />
                </div>

                {/* Last Name */}
                <div>
                  <label className='block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1'>Last Name *</label>
                  <input
                    type='text'
                    name='lastName'
                    value={formData.lastName}
                    onChange={handleInputChange}
                    placeholder='Enter your last name'
                    className='w-full border border-gray-300 dark:border-slate-600 dark:bg-slate-800 dark:text-white rounded-lg px-4 py-2 outline-none focus:border-black dark:focus:border-slate-400'
                    required
                  />
                </div>

                {/* Email */}
                <div>
                  <label className='block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1'>Email Address *</label>
                  <input
                    type='email'
                    name='email'
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder='your.email@example.com'
                    className='w-full border border-gray-300 dark:border-slate-600 dark:bg-slate-800 dark:text-white rounded-lg px-4 py-2 outline-none focus:border-black dark:focus:border-slate-400'
                    required
                  />
                </div>

                {/* Contact Number */}
                <div>
                  <label className='block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1'>Contact Number *</label>
                  <div className='flex gap-2'>
                    <div className='relative flex-shrink-0 w-24'>
                      <button
                        type='button'
                        onClick={() => setShowCountryDropdown(!showCountryDropdown)}
                        className='w-full border border-gray-300 dark:border-slate-600 dark:bg-slate-800 dark:text-white rounded-lg py-2 px-2 bg-white text-left text-sm font-medium flex items-center justify-between hover:border-gray-400 transition-colors'
                      >
                        <span className='text-xs'>{formData.countryCode}</span>
                        <span className='text-xs'>▼</span>
                      </button>

                      {/* Country Code Dropdown */}
                      {showCountryDropdown && (
                        <div className='absolute top-full left-0 right-0 mt-1 bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-600 rounded shadow-lg z-10 max-h-64 overflow-y-auto'>
                          <input
                            type='text'
                            placeholder='Search...'
                            value={countrySearch}
                            onChange={(e) => setCountrySearch(e.target.value)}
                            className='w-full border-b border-gray-300 dark:border-slate-600 px-2 py-1 text-xs sticky top-0 bg-white dark:bg-slate-800 dark:text-white'
                          />
                          <div className='max-h-56 overflow-y-auto'>
                            {filteredCountries.length > 0 ? (
                              filteredCountries.map((country) => (
                                <button
                                  key={country.code}
                                  type='button'
                                  onClick={() => handleCountryCodeSelect(country)}
                                  className='w-full text-left px-2 py-1 text-xs hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors flex items-center gap-1 dark:text-white'
                                >
                                  <span>{country.flag}</span>
                                  <span className='truncate'>{country.name}</span>
                                  <span className='ml-auto text-gray-500 dark:text-slate-400 flex-shrink-0'>{country.code}</span>
                                </button>
                              ))
                            ) : (
                              <div className='px-2 py-1 text-xs text-gray-500'>No countries found</div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>

                    <input
                      type='text'
                      name='contact'
                      value={formData.contact}
                      onChange={handleInputChange}
                      placeholder='10-digit phone number'
                      className='flex-1 border border-gray-300 dark:border-slate-600 dark:bg-slate-800 dark:text-white rounded-lg px-4 py-2 outline-none focus:border-black dark:focus:border-slate-400 text-sm'
                      required
                    />
                  </div>
                </div>

                {/* State */}
                <div>
                  <label className='block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1'>State *</label>
                  <input
                    type='text'
                    name='state'
                    value={formData.state}
                    onChange={handleInputChange}
                    placeholder='e.g., Maharashtra'
                    className='w-full border border-gray-300 dark:border-slate-600 dark:bg-slate-800 dark:text-white rounded-lg px-4 py-2 outline-none focus:border-black dark:focus:border-slate-400'
                    required
                  />
                </div>

                {/* City */}
                <div>
                  <label className='block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1'>City *</label>
                  <input
                    type='text'
                    name='city'
                    value={formData.city}
                    onChange={handleInputChange}
                    placeholder='e.g., Mumbai'
                    className='w-full border border-gray-300 dark:border-slate-600 dark:bg-slate-800 dark:text-white rounded-lg px-4 py-2 outline-none focus:border-black dark:focus:border-slate-400'
                    required
                  />
                </div>

                {/* Aadhar Number */}
                <div>
                  <label className='block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1'>Aadhar Number *</label>
                  <input
                    type='text'
                    name='aadharNumber'
                    value={formData.aadharNumber}
                    onChange={handleInputChange}
                    placeholder='12-digit Aadhar number'
                    maxLength='12'
                    className='w-full border border-gray-300 dark:border-slate-600 dark:bg-slate-800 dark:text-white rounded-lg px-4 py-2 outline-none focus:border-black dark:focus:border-slate-400'
                    required
                  />
                </div>
              </div>

              {/* Address */}
              <div>
                <label className='block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1'>Full Address *</label>
                <textarea
                  name='address'
                  value={formData.address}
                  onChange={handleInputChange}
                  placeholder='Enter your complete address'
                  rows='2'
                  className='w-full border border-gray-300 dark:border-slate-600 dark:bg-slate-800 dark:text-white rounded-lg px-4 py-2 outline-none focus:border-black dark:focus:border-slate-400'
                  required
                />
              </div>

              {/* Why Join Forever */}
              <div>
                <label className='block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1'>Why do you want to join Forever? *</label>
                <textarea
                  name='whyJoin'
                  value={formData.whyJoin}
                  onChange={handleInputChange}
                  placeholder='Tell us about your interest and motivation to join our team'
                  rows='3'
                  className='w-full border border-gray-300 dark:border-slate-600 dark:bg-slate-800 dark:text-white rounded-lg px-4 py-2 outline-none focus:border-black dark:focus:border-slate-400'
                  required
                />
              </div>

              {/* Resume Upload */}
              <div>
                <label className='block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1'>Upload Resume (PDF/DOC, Max 5MB) *</label>
                <div className='relative'>
                  <input
                    type='file'
                    accept='.pdf,.doc,.docx'
                    onChange={handleFileChange}
                    className='w-full border border-gray-300 dark:border-slate-600 dark:bg-slate-800 dark:text-white rounded-lg px-4 py-2 outline-none focus:border-black dark:focus:border-slate-400'
                    required
                  />
                </div>
                {formData.resume && (
                  <p className='text-sm text-green-600 dark:text-green-400 mt-2'>✓ {formData.resume.name} selected</p>
                )}
              </div>

              {/* Submit Buttons */}
              <div className='flex gap-3 pt-6 border-t dark:border-slate-700'>
                <button
                  type='submit'
                  disabled={isSubmitting}
                  className='flex-1 bg-black dark:bg-slate-700 text-white py-3 rounded-lg font-medium hover:bg-gray-800 dark:hover:bg-slate-600 transition-all disabled:opacity-50 cursor-pointer'
                >
                  {isSubmitting ? 'Submitting...' : 'Submit Application'}
                </button>
                <button
                  type='button'
                  onClick={() => setShowJobForm(false)}
                  className='flex-1 border border-gray-300 dark:border-slate-600 text-gray-700 dark:text-slate-300 py-3 rounded-lg font-medium hover:bg-gray-100 dark:hover:bg-slate-800 transition-all cursor-pointer'
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <NewsletterBox />
    </div>
  );
};

export default Contact;
