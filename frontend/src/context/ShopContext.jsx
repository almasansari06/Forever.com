import { createContext, useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";

// Create and export ShopContext
export const ShopContext = createContext();

const ShopContextProvider = (props) => {
    const currency = '$';
    const delivery_fee = 10;
    const backendUrl = import.meta.env.VITE_BACKEND_URL;

    const [token, setToken] = useState(localStorage.getItem('token') ? localStorage.getItem('token') : '');
    const [userData, setUserData] = useState(false);
    const [cartItems, setCartItems] = useState(() => {
        try {
            return JSON.parse(localStorage.getItem('cartItems')) || {};
        } catch (error) {
            return {};
        }
    });
    const [products, setProducts] = useState([]);
    const [showSearch, setShowSearch] = useState(false);

    useEffect(() => {
        localStorage.setItem('cartItems', JSON.stringify(cartItems));
    }, [cartItems]);

    // Profile Data Fetcher
    const loadUserProfileData = async () => {
        try {
            const response = await axios.get(backendUrl + '/api/user/get-profile', { headers: { token } });
            if (response.data.success) {
                setUserData(response.data.userData);
            } else {
                toast.error(response.data.message);
            }
        } catch (error) {
            console.log(error);
            toast.error(error.message);
        }
    };

    useEffect(() => {
        if (token) {
            loadUserProfileData();
        } else {
            setUserData(false);
        }
    }, [token]);

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const response = await axios.get(backendUrl + '/api/product/list');
                if (response.data.success) {
                    setProducts(response.data.products || []);
                }
            } catch (error) {
                console.log(error);
            }
        };

        fetchProducts();
    }, [backendUrl]);

    const addToCart = async (itemId, size) => {
        const updatedCart = { ...cartItems };
        if (!updatedCart[itemId]) {
            updatedCart[itemId] = {};
        }
        if (!updatedCart[itemId][size]) {
            updatedCart[itemId][size] = 0;
        }
        updatedCart[itemId][size] += 1;
        setCartItems(updatedCart);
    };

    const updateQuantity = async (itemId, size, quantity) => {
        const updatedCart = { ...cartItems };
        if (!updatedCart[itemId]) {
            updatedCart[itemId] = {};
        }
        updatedCart[itemId][size] = quantity;
        if (quantity <= 0) {
            delete updatedCart[itemId][size];
            if (Object.keys(updatedCart[itemId]).length === 0) {
                delete updatedCart[itemId];
            }
        }
        setCartItems(updatedCart);
    };

    const getCartCount = () => {
        let totalCount = 0;
        Object.values(cartItems).forEach((sizes) => {
            Object.values(sizes).forEach((quantity) => {
                totalCount += quantity;
            });
        });
        return totalCount;
    };

    const getCartAmount = () => {
        let totalAmount = 0;
        Object.entries(cartItems).forEach(([itemId, sizes]) => {
            const product = products.find((item) => item._id === itemId);
            if (!product) return;
            Object.entries(sizes).forEach(([size, quantity]) => {
                totalAmount += product.price * quantity;
            });
        });
        return totalAmount;
    };

    const navigate = (path) => {
        window.location.href = path;
    };

    const value = {
        currency,
        delivery_fee,
        backendUrl,
        token,
        setToken,
        userData,
        setUserData,
        loadUserProfileData,
        cartItems,
        setCartItems,
        products,
        setProducts,
        showSearch,
        setShowSearch,
        addToCart,
        updateQuantity,
        getCartCount,
        getCartAmount,
        navigate,
    };

    return (
        <ShopContext.Provider value={value}>
            {props.children}
        </ShopContext.Provider>
    );
};

export default ShopContextProvider;
