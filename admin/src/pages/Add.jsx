import React, { useEffect, useState } from 'react';
import { assets } from '../assets/assets';
import axios from 'axios';
import { backendUrl } from '../App';
import { toast } from 'react-toastify';

const Add = ({ token }) => {
    const [image1, setImage1] = useState(false);
    const [image2, setImage2] = useState(false);
    const [image3, setImage3] = useState(false);
    const [image4, setImage4] = useState(false);
    const [image5, setImage5] = useState(false);
    const [image6, setImage6] = useState(false);
    const [image7, setImage7] = useState(false);
    const [image8, setImage8] = useState(false);
    const [image9, setImage9] = useState(false);
    const [image10, setImage10] = useState(false);

    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [price, setPrice] = useState('');
    const [category, setCategory] = useState('Men');
    const [subCategory, setSubCategory] = useState('');
    const [bestseller, setBestseller] = useState(false);
    const [newArrival, setNewArrival] = useState(false);
    const [outOfStock, setOutOfStock] = useState(false);
    const [sizes, setSizes] = useState([]);
    const [productTypes, setProductTypes] = useState([]);
    const [newType, setNewType] = useState('');
    const clothingSizes = ['S', 'M', 'L', 'XL', 'XXL'];
    const footwearSizes = ['6', '7', '8', '9', '10'];
    const selectedSizeGroup = sizes.some((size) => clothingSizes.includes(size)) ? 'clothing' : sizes.some((size) => footwearSizes.includes(size)) ? 'footwear' : null;

    const getOrderedSizes = (nextSizes) => {
        const unique = [...new Set(nextSizes.filter(Boolean))];
        const clothing = clothingSizes.filter((size) => unique.includes(size));
        const footwear = footwearSizes.filter((size) => unique.includes(size));
        return [...clothing, ...footwear];
    };

    const fetchProductTypes = async () => {
        try {
            const response = await axios.get(backendUrl + '/api/product-type/list');
            if (response.data.success) {
                const types = response.data.productTypes || [];
                setProductTypes(types);
                if (types.length > 0 && !subCategory) {
                    setSubCategory(types[0]);
                }
            }
        } catch (error) {
            console.log(error);
        }
    };

    useEffect(() => {
        fetchProductTypes();
    }, []);

    const hasSizeSelection = Boolean(subCategory);

    const handleSubCategoryChange = (e) => {
        const selectedValue = e.target.value;
        setSubCategory(selectedValue);
        setSizes([]);
    };

    const handleAddType = async () => {
        const trimmed = newType.trim();
        if (!trimmed) {
            toast.error('Type name required');
            return;
        }

        try {
            const response = await axios.post(backendUrl + '/api/product-type/add', { name: trimmed }, { headers: { token } });
            if (response.data.success) {
                const types = response.data.productTypes || [];
                setProductTypes(types);
                setSubCategory(types.includes(trimmed) ? trimmed : types[0] || '');
                setNewType('');
                toast.success(response.data.message || 'Type added successfully');
            } else {
                toast.error(response.data.message || 'Unable to add type');
            }
        } catch (error) {
            console.log(error);
            toast.error(error.response?.data?.message || error.message);
        }
    };

    const handleDeleteType = async (typeName) => {
        if (!typeName) return;
        try {
            const response = await axios.post(backendUrl + '/api/product-type/delete', { name: typeName }, { headers: { token } });
            if (response.data.success) {
                const types = response.data.productTypes || [];
                setProductTypes(types);
                setSubCategory((prev) => {
                    if (types.length === 0) return '';
                    return types.includes(prev) ? prev : types[0];
                });
                toast.success(response.data.message || 'Type deleted');
            } else {
                toast.error(response.data.message || 'Unable to delete type');
            }
        } catch (error) {
            console.log(error);
            toast.error(error.response?.data?.message || error.message);
        }
    };

    const toggleSize = (size) => {
        setSizes((prev) => {
            const sizeGroup = clothingSizes.includes(size) ? 'clothing' : footwearSizes.includes(size) ? 'footwear' : null;

            if (!sizeGroup) return prev;

            const next = prev.includes(size)
                ? prev.filter((item) => item !== size)
                : [...prev, size];

            const filtered = sizeGroup === 'clothing'
                ? next.filter((item) => !footwearSizes.includes(item))
                : sizeGroup === 'footwear'
                    ? next.filter((item) => !clothingSizes.includes(item))
                    : next;

            return getOrderedSizes(filtered);
        });
    };

    const onSubmitHandler = async (e) => {
        e.preventDefault();

        try {
            const formData = new FormData();

            formData.append('name', name);
            formData.append('description', description);
            formData.append('price', price);
            formData.append('category', category);
            formData.append('subCategory', subCategory);
            formData.append('bestseller', bestseller);
            formData.append('newArrival', newArrival);
            formData.append('outOfStock', outOfStock);
            // Agar clothing ya footwear nahi hai (jaise Makeup ya Jewelry), to empty array bhejega
            formData.append('sizes', JSON.stringify(hasSizeSelection ? sizes : []));

            [image1, image2, image3, image4, image5, image6, image7, image8, image9, image10].forEach((image, index) => {
                if (image) {
                    formData.append(`image${index + 1}`, image);
                }
            });

            const response = await axios.post(backendUrl + '/api/product/add', formData, { headers: { token } });

            if (response.data.success) {
                toast.success(response.data.message);
                setName('');
                setDescription('');
                setImage1(false);
                setImage2(false);
                setImage3(false);
                setImage4(false);
                setImage5(false);
                setImage6(false);
                setImage7(false);
                setImage8(false);
                setImage9(false);
                setImage10(false);
                setPrice('');
                setCategory('Men');
                setSubCategory(productTypes[0] || '');
                setBestseller(false);
                setNewArrival(false);
                setOutOfStock(false);
                setSizes([]);
            } else {
                toast.error(response.data.message);
            }
        } catch (error) {
            console.log(error);
            const errorMessage = error.response?.data?.message || error.message;
            toast.error(errorMessage);
        }
    };

    return (
        <form onSubmit={onSubmitHandler} className="flex flex-col w-full items-start gap-3">
            <div>
                <p className="mb-2">Upload Image</p>
                <div className="flex flex-wrap gap-2">
                    {[image1, image2, image3, image4, image5, image6, image7, image8, image9, image10].map((image, index) => {
                        const inputId = `image${index + 1}`;
                        const setter = [setImage1, setImage2, setImage3, setImage4, setImage5, setImage6, setImage7, setImage8, setImage9, setImage10][index];

                        return (
                            <label key={inputId} htmlFor={inputId} aria-label={`Upload Image ${index + 1}`}>
                                <img className="w-20" src={!image ? assets.upload_area : URL.createObjectURL(image)} alt={`Upload Area ${index + 1}`} />
                                <input onChange={(e) => setter(e.target.files[0])} type="file" id={inputId} hidden />
                            </label>
                        );
                    })}
                </div>
            </div>

            <div className="w-full max-w-[500px]">
                <p className="mb-2">Product Name</p>
                <input onChange={(e) => setName(e.target.value)} value={name} className="w-full max-w-[500px] px-3 py-2" type="text" placeholder="Type here" required />
            </div>

            <div className="w-full max-w-[500px]">
                <p className="mb-2">Product Description</p>
                <textarea onChange={(e) => setDescription(e.target.value)} value={description} rows="6" className="w-full max-w-[500px] px-3 py-2 min-h-[140px] max-h-[260px] resize-y" placeholder="Write content here" required />
            </div>

            <div className="flex flex-col sm:flex-row gap-2 w-full sm:gap-8">
                <div>
                    <p className="mb-2">Product Category</p>
                    <select value={category} onChange={(e) => setCategory(e.target.value)} className="w-full px-3 py-2">
                        <option value="Men">Men</option>
                        <option value="Women">Women</option>
                        <option value="Kids">Kids</option>
                    </select>
                </div>
                <div className="w-full">
                    <p className="mb-2">Product Type</p>
                    <div className="flex flex-col gap-2">
                        <select value={subCategory} onChange={handleSubCategoryChange} className="w-full px-3 py-2">
                            {productTypes.length === 0 ? <option value="">No types available</option> : productTypes.map((item) => (
                                <option key={item} value={item}>{item}</option>
                            ))}
                        </select>
                        <div className="flex gap-2">
                            <input
                                value={newType}
                                onChange={(e) => setNewType(e.target.value)}
                                className="w-full px-3 py-2 border"
                                type="text"
                                placeholder="Add new type e.g. Belt"
                            />
                            <button type="button" onClick={handleAddType} className="px-3 py-2 bg-black text-white cursor-pointer">Add</button>
                        </div>
                        {productTypes.length > 0 && (
                            <div className="flex flex-wrap gap-2">
                                {productTypes.map((item) => (
                                    <button
                                        key={item}
                                        type="button"
                                        onClick={() => handleDeleteType(item)}
                                        className="px-2 py-1 border border-red-200 text-red-600 text-xs rounded hover:bg-red-50"
                                        title={`Delete ${item}`}
                                    >
                                        {item} ×
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                <div>
                    <p className="mb-2">Product Price</p>
                    <input onChange={(e) => setPrice(e.target.value)} value={price} className="w-full px-3 py-2 sm:w-[120px]" type="number" placeholder="25" required />
                </div>
            </div>

            {/* Size Selection Section */}
            {hasSizeSelection && (
                <div className="w-full max-w-[500px]">
                    <p className="mb-2">Product Sizes</p>
                    <div className="flex flex-col gap-3">
                        {selectedSizeGroup !== 'footwear' && (
                            <div>
                                <p className="mb-1 text-sm font-medium">Clothing / Apparel</p>
                                <div className="flex gap-3 flex-wrap">
                                    {clothingSizes.map((item) => (
                                        <div key={item} onClick={() => toggleSize(item)}>
                                            <p className={`${sizes.includes(item) ? 'bg-pink-100' : 'bg-slate-200'} px-3 py-1 cursor-pointer`}>
                                                {item}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                        {selectedSizeGroup !== 'clothing' && (
                            <div>
                                <p className="mb-1 text-sm font-medium">Footwear</p>
                                <div className="flex gap-3 flex-wrap">
                                    {footwearSizes.map((item) => (
                                        <div key={item} onClick={() => toggleSize(item)}>
                                            <p className={`${sizes.includes(item) ? 'bg-pink-100' : 'bg-slate-200'} px-3 py-1 cursor-pointer`}>
                                                {item}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            <div className="flex flex-col gap-2 mt-2">
                <div className="flex gap-2">
                    <input onChange={() => setBestseller((prev) => !prev)} checked={bestseller} type="checkbox" id="bestseller" />
                    <label className="cursor-pointer" htmlFor="bestseller">Add to bestseller</label>
                </div>
                <div className="flex gap-2">
                    <input onChange={() => setNewArrival((prev) => !prev)} checked={newArrival} type="checkbox" id="newArrival" />
                    <label className="cursor-pointer" htmlFor="newArrival">Add to new arrival</label>
                </div>
                <div className="flex gap-2">
                    <input onChange={() => setOutOfStock((prev) => !prev)} checked={outOfStock} type="checkbox" id="outOfStock" />
                    <label className="cursor-pointer" htmlFor="outOfStock">Mark as out of stock</label>
                </div>
            </div>

            <button type="submit" className="w-28 py-3 mt-4 bg-black text-white cursor-pointer">ADD</button>
        </form>
    );
};

export default Add;
