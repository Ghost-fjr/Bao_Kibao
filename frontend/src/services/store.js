import api from './api';

export const storeService = {
    getProducts: async (params) => {
        const response = await api.get('/store/products/', { params });
        return response.data;
    },

    getProductById: async (id) => {
        const response = await api.get(`/store/products/${id}/`);
        return response.data;
    },

    getCart: async () => {
        const response = await api.get('/store/cart/');
        return response.data;
    },

    addToCart: async (productId, quantity = 1, sizeId = null) => {
        const data = { product_id: productId, quantity };
        if (sizeId) {
            data.size_id = sizeId;
        }
        const response = await api.post('/store/cart/add_item/', data);
        return response.data;
    },

    removeFromCart: async (itemId) => {
        const response = await api.post('/store/cart/remove_item/', { item_id: itemId });
        return response.data;
    },

    createOrder: async (orderData) => {
        const response = await api.post('/store/orders/', orderData);
        return response.data;
    },
};
