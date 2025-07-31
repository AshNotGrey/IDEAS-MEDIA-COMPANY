import { useQuery, useLazyQuery } from '@apollo/client';
import {
    GET_PRODUCTS,
    GET_PRODUCT,
    GET_FEATURED_PRODUCTS,
    SEARCH_PRODUCTS,
    GET_PRODUCT_CATEGORIES
} from '../queries/products.js';

export const useProducts = (filter = {}) => {
    const {
        data,
        loading,
        error,
        refetch,
        fetchMore
    } = useQuery(GET_PRODUCTS, {
        variables: { filter },
        fetchPolicy: 'cache-and-network',
        notifyOnNetworkStatusChange: true
    });

    return {
        products: data?.products || [],
        loading,
        error,
        refetch,
        fetchMore
    };
};

export const useProduct = (productId) => {
    const {
        data,
        loading,
        error,
        refetch
    } = useQuery(GET_PRODUCT, {
        variables: { id: productId },
        skip: !productId,
        fetchPolicy: 'cache-and-network'
    });

    return {
        product: data?.product,
        loading,
        error,
        refetch
    };
};

export const useFeaturedProducts = () => {
    const {
        data,
        loading,
        error,
        refetch
    } = useQuery(GET_FEATURED_PRODUCTS, {
        fetchPolicy: 'cache-and-network'
    });

    return {
        featuredProducts: data?.featuredProducts || [],
        loading,
        error,
        refetch
    };
};

export const useProductSearch = () => {
    const [searchProducts, { data, loading, error }] = useLazyQuery(SEARCH_PRODUCTS, {
        fetchPolicy: 'cache-and-network'
    });

    const search = async (searchTerm, filter = {}) => {
        try {
            const result = await searchProducts({
                variables: { searchTerm, filter }
            });
            return { success: true, products: result.data?.searchProducts || [] };
        } catch (err) {
            return { success: false, error: err.message };
        }
    };

    return {
        search,
        searchResults: data?.searchProducts || [],
        searchLoading: loading,
        searchError: error
    };
};

export const useProductCategories = () => {
    const {
        data,
        loading,
        error,
        refetch
    } = useQuery(GET_PRODUCT_CATEGORIES, {
        fetchPolicy: 'cache-and-network'
    });

    return {
        categories: data?.productCategories || [],
        loading,
        error,
        refetch
    };
}; 