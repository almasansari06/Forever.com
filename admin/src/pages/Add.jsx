import React, { useEffect, useState } from 'react';
import { assets } from '../assets/assets';
import axios from 'axios';
import { backendUrl } from '../App';
import { toast } from 'react-toastify';

let logoPromise;

const notifyProductsUpdated = () => {
    const stamp = String(Date.now());
    localStorage.setItem('products_updated_at', stamp);
    window.dispatchEvent(new CustomEvent('products-updated', { detail: { stamp } }));
};

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
    const imageSetters = [setImage1, setImage2, setImage3, setImage4, setImage5, setImage6, setImage7, setImage8, setImage9, setImage10];

    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [price, setPrice] = useState('');
    const defaultCategoryOptions = ['Men', 'Women', 'Kids'];
    const [category, setCategory] = useState('Men');
    const [categoryOptions, setCategoryOptions] = useState(defaultCategoryOptions);
    const [newCategory, setNewCategory] = useState('');
    const [subCategory, setSubCategory] = useState('');
    const [bestseller, setBestseller] = useState(false);
    const [latestCollection, setLatestCollection] = useState(false);
    const [outOfStock, setOutOfStock] = useState(false);
    const [sizes, setSizes] = useState([]);
    const [productTypes, setProductTypes] = useState([]);
    const [newType, setNewType] = useState('');
    const [editingType, setEditingType] = useState('');
    const [editingTypeName, setEditingTypeName] = useState('');
    const [selectedTypeForManagement, setSelectedTypeForManagement] = useState('');
    const [editingCategory, setEditingCategory] = useState('');
    const [editingCategoryName, setEditingCategoryName] = useState('');
    const [selectedCategoryForManagement, setSelectedCategoryForManagement] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [openActionMenu, setOpenActionMenu] = useState('');
    const [selectedSizeGroup, setSelectedSizeGroup] = useState('');
    const clothingSizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
    const footwearSizes = ['6', '7', '8', '9', '10'];

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
                const categories = response.data.productCategories || defaultCategoryOptions;
                setProductTypes(types);
                setCategoryOptions(categories);
                if (types.length > 0 && !subCategory) {
                    setSubCategory(types[0]);
                }
                if (!categories.includes(category)) {
                    setCategory(categories[0] || 'Men');
                }
            }
        } catch (error) {
            console.log(error);
        }
    };

    useEffect(() => {
        fetchProductTypes();
    }, []);

    const hasSizeSelection = true;

    const handleSubCategoryChange = (e) => {
        const selectedValue = e.target.value;
        setSubCategory(selectedValue);
        setSizes([]);
        setSelectedSizeGroup('');
    };

    const handleAddCategory = async () => {
        const trimmed = newCategory.trim();
        if (!trimmed) {
            toast.error('Category name required');
            return;
        }

        try {
            const response = await axios.post(backendUrl + '/api/product-type/category/add', { name: trimmed }, { headers: { token } });
            if (response.data.success) {
                const categories = response.data.productCategories || [];
                setCategoryOptions(categories);
                setCategory(trimmed);
                setNewCategory('');
                setSelectedCategoryForManagement('');
                setEditingCategory('');
                setEditingCategoryName('');
                notifyProductsUpdated();
                toast.success(response.data.message || 'Category added successfully');
            } else {
                toast.error(response.data.message || 'Unable to add category');
            }
        } catch (error) {
            console.log(error);
            toast.error(error.response?.data?.message || error.message);
        }
    };

    const handleEditCategory = async (categoryName) => {
        const trimmedName = editingCategoryName.trim();
        if (!trimmedName) {
            toast.error('Category name required');
            return;
        }

        if (['Men', 'Women', 'Kids'].includes(categoryName)) {
            toast.error('Protected categories cannot be edited.');
            return;
        }

        try {
            const response = await axios.post(backendUrl + '/api/product-type/category/edit', { name: categoryName, newName: trimmedName }, { headers: { token } });
            if (response.data.success) {
                const categories = response.data.productCategories || [];
                setCategoryOptions(categories);
                setCategory((prev) => (prev.toLowerCase() === categoryName.toLowerCase() ? trimmedName : prev));
                setSelectedCategoryForManagement('');
                setEditingCategory('');
                setEditingCategoryName('');
                notifyProductsUpdated();
                toast.success(response.data.message || 'Category updated successfully');
            } else {
                toast.error(response.data.message || 'Unable to update category');
            }
        } catch (error) {
            console.log(error);
            toast.error(error.response?.data?.message || error.message);
        }
    };

    const handleDeleteCategory = async (categoryName) => {
        if (!categoryName) return;

        if (['Men', 'Women', 'Kids'].includes(categoryName)) {
            toast.error('Protected categories cannot be deleted.');
            return;
        }

        const shouldDelete = window.confirm(`Delete category "${categoryName}" and all products under it?`);
        if (!shouldDelete) return;

        try {
            const response = await axios.post(backendUrl + '/api/product-type/category/delete', { name: categoryName }, { headers: { token } });
            if (response.data.success) {
                const categories = response.data.productCategories || [];
                setCategoryOptions(categories);
                setCategory((prev) => {
                    if (categories.length === 0) return 'Men';
                    return categories.includes(prev) ? prev : categories[0];
                });
                setSelectedCategoryForManagement('');
                setEditingCategory('');
                setEditingCategoryName('');
                notifyProductsUpdated();
                toast.success(response.data.message || 'Category removed');
            } else {
                toast.error(response.data.message || 'Unable to delete category');
            }
        } catch (error) {
            console.log(error);
            toast.error(error.response?.data?.message || error.message);
        }
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
                setSelectedTypeForManagement('');
                setEditingType('');
                setEditingTypeName('');
                notifyProductsUpdated();
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

        if (typeName === 'None') {
            toast.error('Protected product type cannot be deleted.');
            return;
        }

        const shouldDelete = window.confirm(`Delete product type "${typeName}" and all products under it?`);
        if (!shouldDelete) return;

        try {
            const response = await axios.post(backendUrl + '/api/product-type/delete', { name: typeName }, { headers: { token } });
            if (response.data.success) {
                const types = response.data.productTypes || [];
                setProductTypes(types);
                setSubCategory((prev) => {
                    if (types.length === 0) return '';
                    return types.includes(prev) ? prev : types[0];
                });
                setSelectedTypeForManagement('');
                setEditingType('');
                setEditingTypeName('');
                notifyProductsUpdated();
                toast.success(response.data.message || 'Type deleted');
            } else {
                toast.error(response.data.message || 'Unable to delete type');
            }
        } catch (error) {
            console.log(error);
            toast.error(error.response?.data?.message || error.message);
        }
    };

    const handleEditType = async (typeName) => {
        const trimmedName = editingTypeName.trim();
        if (!trimmedName) {
            toast.error('Type name required');
            return;
        }

        if (typeName === 'None') {
            toast.error('Protected product type cannot be edited.');
            return;
        }

        try {
            const response = await axios.post(backendUrl + '/api/product-type/edit', { name: typeName, newName: trimmedName }, { headers: { token } });
            if (response.data.success) {
                const types = response.data.productTypes || [];
                setProductTypes(types);
                setSubCategory((prev) => prev.toLowerCase() === typeName.toLowerCase() ? trimmedName : prev);
                setSelectedTypeForManagement('');
                setEditingType('');
                setEditingTypeName('');
                notifyProductsUpdated();
                toast.success(response.data.message || 'Type updated successfully');
            } else {
                toast.error(response.data.message || 'Unable to update type');
            }
        } catch (error) {
            console.log(error);
            toast.error(error.response?.data?.message || error.message);
        }
    };

    const toggleGroupSize = (group, size) => {
        setSizes((prev) => {
            const currentGroup = group === 'clothing' ? clothingSizes : footwearSizes;
            const otherGroup = group === 'clothing' ? footwearSizes : clothingSizes;

            const next = prev.includes(size)
                ? prev.filter((item) => item !== size)
                : [...prev.filter((item) => !otherGroup.includes(item)), size];

            const orderedSizes = getOrderedSizes(next.filter((item) => currentGroup.includes(item) || !otherGroup.includes(item)));
            setSelectedSizeGroup(orderedSizes.length > 0 ? group : '');
            return orderedSizes;
        });
    };

    const toggleClothingSize = (size) => toggleGroupSize('clothing', size);
    const toggleFootwearSize = (size) => toggleGroupSize('footwear', size);

    const handleSizeGroupChange = (event) => {
        const nextGroup = event.target.value;
        setSelectedSizeGroup(nextGroup);

        setSizes((prev) => {
            const next = prev.filter((item) => {
                if (nextGroup === 'clothing') return !footwearSizes.includes(item);
                if (nextGroup === 'footwear') return !clothingSizes.includes(item);
                return true;
            });
            return getOrderedSizes(next);
        });
    };

    const renderOptionList = ({ items, editingKey, editingValue, setEditingValue, onSave, onCancel, onEdit, onRemove, selectedKey, selectedForManagement, setSelectedForManagement, managementType }) => {
        const isProtected = (name) => ['Men', 'Women', 'Kids'].includes(name);
        
        return (
        <div className="mt-4 space-y-3">
            <div className="flex items-center gap-2">
                <label className="text-sm font-medium text-slate-700 whitespace-nowrap">Changes:</label>
                <select 
                    value={selectedForManagement}
                    onChange={(e) => {
                        const selected = e.target.value;
                        setSelectedForManagement(selected);
                        if (selected) {
                            const protectedForType = selected === 'None';
                            if (isProtected(selected) || protectedForType) {
                                toast.error(`${selected} is protected and cannot be edited or deleted.`);
                                setSelectedForManagement('');
                                onCancel();
                            } else {
                                onEdit(selected);
                            }
                        } else {
                            onCancel();
                        }
                    }}
                    className="flex-1 px-3 py-2 border border-slate-300 rounded"
                >
                    <option value="">Select {managementType} to edit</option>
                    {items.map((item) => (
                        <option key={item} value={item}>
                            {item}{isProtected(item) ? ' (Protected)' : ''}
                        </option>
                    ))}
                </select>
            </div>

            {(editingKey || selectedForManagement) && (
                <div className="flex flex-col gap-2 rounded-lg border border-slate-200 bg-slate-50 p-3">
                    {editingKey ? (
                        <>
                            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                                <label className="text-xs font-medium text-slate-600 whitespace-nowrap">Edit name:</label>
                                <input
                                    value={editingValue}
                                    onChange={(e) => setEditingValue(e.target.value)}
                                    className="flex-1 rounded border border-slate-300 px-3 py-2 text-sm"
                                    aria-label={`Edit ${editingKey}`}
                                    autoFocus
                                />
                            </div>
                            <div className="flex items-center gap-2 sm:justify-end">
                                <button type="button" onClick={() => onSave(editingKey)} className="rounded bg-green-600 px-4 py-2 text-xs font-medium text-white hover:bg-green-700">Save</button>
                                <button type="button" onClick={() => {onCancel(); setSelectedForManagement('');}} className="rounded border border-slate-300 bg-white px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100">Cancel</button>
                                <button type="button" onClick={() => {onRemove(editingKey); setSelectedForManagement('');}} className="rounded border border-red-300 bg-red-50 px-4 py-2 text-xs font-medium text-red-700 hover:bg-red-100">Delete</button>
                            </div>
                        </>
                    ) : (
                        <div className="flex items-center justify-between gap-2">
                            <span className="text-sm font-medium text-slate-700">{selectedForManagement}</span>
                            <div className="flex items-center gap-2">
                                <button
                                    type="button"
                                    onClick={() => {
                                        onEdit(selectedForManagement);
                                    }}
                                    className="rounded border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
                                >
                                    Edit
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        onRemove(selectedForManagement);
                                        setSelectedForManagement('');
                                    }}
                                    className="rounded border border-red-300 bg-red-50 px-3 py-1.5 text-xs font-medium text-red-700 hover:bg-red-100"
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
    };

    const compressImageFile = async (file, maxWidth = 1400, quality = 0.72) => {
        if (!file || !file.type?.startsWith('image/')) return file;

        const dataUrl = await new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = () => reject(new Error('Failed to read image file'));
            reader.readAsDataURL(file);
        });

        const img = await new Promise((resolve, reject) => {
            const image = new Image();
            image.onload = () => resolve(image);
            image.onerror = () => reject(new Error('Failed to load image'));
            image.src = dataUrl;
        });

        const canvas = document.createElement('canvas');
        const scale = Math.min(1, maxWidth / Math.max(img.width, 1));
        canvas.width = Math.max(1, Math.round(img.width * scale));
        canvas.height = Math.max(1, Math.round(img.height * scale));

        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

        const blob = await new Promise((resolve) => {
            canvas.toBlob((result) => resolve(result || file), 'image/jpeg', quality);
        });

        return new File([blob], file.name.replace(/\.[^/.]+$/, '') + '.jpg', {
            type: 'image/jpeg',
            lastModified: Date.now(),
        });
    };

    const handleImageChange = async (files) => {
        // Always start from index 0, regardless of which box was clicked
        const selectedImages = Array.from(files).slice(0, 10);

        for (let index = 0; index < selectedImages.length; index += 1) {
            const image = selectedImages[index];
            const compressedImage = await compressImageFile(image);
            imageSetters[index](compressedImage);
        }
    };

    const removeImage = (index) => {
        imageSetters[index](false);
    };

    const onSubmitHandler = async (e) => {
        e.preventDefault();
        if (isSubmitting) return;

        setIsSubmitting(true);

        try {
            const formData = new FormData();
            formData.append('name', name);
            formData.append('description', description);
            formData.append('price', price);
            formData.append('category', category);
            formData.append('subCategory', subCategory);
            formData.append('bestseller', bestseller);
            formData.append('latestCollection', latestCollection);
            formData.append('outOfStock', outOfStock);
            formData.append('sizes', JSON.stringify(hasSizeSelection ? sizes : []));

            [image1, image2, image3, image4, image5, image6, image7, image8, image9, image10].forEach((image, index) => {
                if (image) {
                    formData.append(`image${index + 1}`, image);
                }
            });

            const response = await axios.post(backendUrl + '/api/product/add', formData, { headers: { token } });

            if (response.data.success) {
                toast.success('✅ Product added successfully!');
                notifyProductsUpdated();
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
                // Keep category and subCategory persistent until page refresh
                setBestseller(false);
                setLatestCollection(false);
                setOutOfStock(false);
                setSizes([]);
            } else {
                toast.error(response.data.message);
            }
        } catch (error) {
            console.log(error);
            const errorMessage = error.response?.data?.message || error.message;
            toast.error(errorMessage);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <form onSubmit={onSubmitHandler} className="flex flex-col w-full items-start gap-3">
            <div>
                <p className="mb-2">Upload Image</p>
                <div className="flex flex-wrap gap-2">
                    {[image1, image2, image3, image4, image5, image6, image7, image8, image9, image10].map((image, index) => {
                        const inputId = `image${index + 1}`;

                        return (
                            <div key={inputId} className="relative">
                                <label htmlFor={inputId} aria-label={`Upload Image ${index + 1}`}>
                                    <img className="w-20 cursor-pointer" src={!image ? assets.upload_area : URL.createObjectURL(image)} alt={`Upload Area ${index + 1}`} />
                                    <input onChange={(e) => handleImageChange(e.target.files)} multiple accept="image/*" type="file" id={inputId} hidden />
                                </label>
                                {image && (
                                    <button
                                        type="button"
                                        onClick={() => removeImage(index)}
                                        className="absolute right-0 top-0 flex h-5 w-5 items-center justify-center rounded-full bg-red-600 text-xs font-bold text-white hover:bg-red-700"
                                        aria-label={`Remove image ${index + 1}`}
                                    >
                                        ×
                                    </button>
                                )}
                            </div>
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
                <div className="w-full">
                    <p className="mb-2">Product Category</p>
                    <div className="flex flex-col gap-2">
                        <select value={category} onChange={(e) => setCategory(e.target.value)} className="w-full px-3 py-2">
                            {categoryOptions.map((item) => (
                                <option key={item} value={item}>{item}</option>
                            ))}
                        </select>
                        <div className="flex gap-2">
                            <input
                                value={newCategory}
                                onChange={(e) => setNewCategory(e.target.value)}
                                className="w-full px-3 py-2 border"
                                type="text"
                                placeholder="Add new category e.g. Kids"
                            />
                            <button type="button" onClick={handleAddCategory} className="px-3 py-2 bg-black text-white cursor-pointer">Add</button>
                        </div>
                        {categoryOptions.length > 0 && renderOptionList({
                            items: categoryOptions,
                            editingKey: editingCategory,
                            editingValue: editingCategoryName,
                            setEditingValue: setEditingCategoryName,
                            onSave: handleEditCategory,
                            onCancel: () => setEditingCategory(''),
                            onEdit: (item) => { setEditingCategory(item); setEditingCategoryName(item); },
                            onRemove: handleDeleteCategory,
                            selectedKey: category,
                            selectedForManagement: selectedCategoryForManagement,
                            setSelectedForManagement: setSelectedCategoryForManagement,
                            managementType: 'category',
                        })}
                    </div>
                </div>
                <div className="w-full">
                    <p className="mb-2">Product Type</p>
                    <div className="flex flex-col gap-2">
                        <select value={subCategory} onChange={handleSubCategoryChange} className="w-full px-3 py-2">
                            <option value="">None</option>
                            {productTypes.map((item) => (
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
                        {productTypes.length > 0 && renderOptionList({
                            items: productTypes,
                            editingKey: editingType,
                            editingValue: editingTypeName,
                            setEditingValue: setEditingTypeName,
                            onSave: handleEditType,
                            onCancel: () => setEditingType(''),
                            onEdit: (item) => { setEditingType(item); setEditingTypeName(item); },
                            onRemove: handleDeleteType,
                            selectedKey: subCategory,
                            selectedForManagement: selectedTypeForManagement,
                            setSelectedForManagement: setSelectedTypeForManagement,
                            managementType: 'type',
                        })}
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
                        {(!selectedSizeGroup || selectedSizeGroup === 'clothing') && <div>
                            <p className="mb-1 text-sm font-medium">Clothing / Apparel</p>
                            <div className="flex gap-3 flex-wrap">
                                {clothingSizes.map((item) => (
                                    <button
                                        key={item}
                                        type="button"
                                        onClick={() => toggleClothingSize(item)}
                                        className={`${sizes.includes(item) ? 'bg-pink-100' : 'bg-slate-200'} px-3 py-1 cursor-pointer`}
                                        aria-pressed={sizes.includes(item)}
                                    >
                                        {item}
                                    </button>
                                ))}
                            </div>
                        </div>}

                        {(!selectedSizeGroup || selectedSizeGroup === 'footwear') && <div>
                            <p className="mb-1 text-sm font-medium">Footwear</p>
                            <div className="flex gap-3 flex-wrap">
                                {footwearSizes.map((item) => (
                                    <button
                                        key={item}
                                        type="button"
                                        onClick={() => toggleFootwearSize(item)}
                                        className={`${sizes.includes(item) ? 'bg-pink-100' : 'bg-slate-200'} px-3 py-1 cursor-pointer`}
                                        aria-pressed={sizes.includes(item)}
                                    >
                                        {item}
                                    </button>
                                ))}
                            </div>
                        </div>}


                    </div>
                </div>
            )}

            <div className="flex flex-col gap-2 mt-2">
                <div className="flex gap-2">
                    <input onChange={() => setBestseller((prev) => !prev)} checked={bestseller} type="checkbox" id="bestseller" />
                    <label className="cursor-pointer" htmlFor="bestseller">Add to bestseller</label>
                </div>
                <div className="flex gap-2">
                    <input onChange={() => setLatestCollection((prev) => !prev)} checked={latestCollection} type="checkbox" id="latestCollection" />
                    <label className="cursor-pointer" htmlFor="latestCollection">Add to latest collection</label>
                </div>
                <div className="flex gap-2">
                    <input onChange={() => setOutOfStock((prev) => !prev)} checked={outOfStock} type="checkbox" id="outOfStock" />
                    <label className="cursor-pointer" htmlFor="outOfStock">Mark as out of stock</label>
                </div>
            </div>

            <button type="submit" disabled={isSubmitting} className="w-28 py-3 mt-4 bg-black text-white cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed">{isSubmitting ? 'ADDING...' : 'ADD'}</button>
        </form>
    );
};

export default Add;
