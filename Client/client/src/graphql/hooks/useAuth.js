import { useState, useEffect } from 'react';
import { useMutation, useQuery } from '@apollo/client';
import {
    REGISTER_USER,
    LOGIN_USER,
    FORGOT_PASSWORD,
    RESET_PASSWORD,
    VERIFY_EMAIL,
    CHANGE_PASSWORD,
    UPDATE_PROFILE,
    GET_CURRENT_USER
} from '../queries/auth.js';

export const useAuth = () => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [loading, setLoading] = useState(true);

    // Get current user query
    const { data: currentUserData, loading: userLoading, refetch: refetchUser } = useQuery(GET_CURRENT_USER, {
        skip: !token,
        errorPolicy: 'ignore'
    });

    // Authentication mutations
    const [registerMutation] = useMutation(REGISTER_USER);
    const [loginMutation] = useMutation(LOGIN_USER);
    const [forgotPasswordMutation] = useMutation(FORGOT_PASSWORD);
    const [resetPasswordMutation] = useMutation(RESET_PASSWORD);
    const [verifyEmailMutation] = useMutation(VERIFY_EMAIL);
    const [changePasswordMutation] = useMutation(CHANGE_PASSWORD);
    const [updateProfileMutation] = useMutation(UPDATE_PROFILE);

    // Initialize auth state from localStorage
    useEffect(() => {
        const storedToken = localStorage.getItem('token');
        const storedUser = localStorage.getItem('user');

        if (storedToken && storedUser) {
            setToken(storedToken);
            setUser(JSON.parse(storedUser));
            setIsAuthenticated(true);
        }
        setLoading(false);
    }, []);

    // Update user when currentUserData changes
    useEffect(() => {
        if (currentUserData?.currentUser) {
            setUser(currentUserData.currentUser);
            localStorage.setItem('user', JSON.stringify(currentUserData.currentUser));
        }
    }, [currentUserData]);

    const register = async (userData) => {
        try {
            const { data } = await registerMutation({
                variables: { input: userData }
            });
            return { success: true, user: data.registerUser };
        } catch (error) {
            return { success: false, error: error.message };
        }
    };

    const login = async (credentials) => {
        try {
            const { data } = await loginMutation({
                variables: { input: credentials }
            });

            const { token: authToken, user: userData } = data.loginUser;

            // Store in localStorage
            localStorage.setItem('token', authToken);
            localStorage.setItem('user', JSON.stringify(userData));

            // Update state
            setToken(authToken);
            setUser(userData);
            setIsAuthenticated(true);

            return { success: true, user: userData, token: authToken };
        } catch (error) {
            return { success: false, error: error.message };
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setToken(null);
        setUser(null);
        setIsAuthenticated(false);
    };

    const forgotPassword = async (email) => {
        try {
            const { data } = await forgotPasswordMutation({
                variables: { email }
            });
            return { success: true, message: data.forgotPassword.message };
        } catch (error) {
            return { success: false, error: error.message };
        }
    };

    const resetPassword = async (resetData) => {
        try {
            const { data } = await resetPasswordMutation({
                variables: { input: resetData }
            });
            return { success: true, message: data.resetPassword.message };
        } catch (error) {
            return { success: false, error: error.message };
        }
    };

    const verifyEmail = async (verificationToken) => {
        try {
            const { data } = await verifyEmailMutation({
                variables: { token: verificationToken }
            });
            return { success: true, message: data.verifyEmail.message, user: data.verifyEmail.user };
        } catch (error) {
            return { success: false, error: error.message };
        }
    };

    const changePassword = async (passwordData) => {
        try {
            const { data } = await changePasswordMutation({
                variables: { input: passwordData }
            });
            return { success: true, message: data.changePassword.message };
        } catch (error) {
            return { success: false, error: error.message };
        }
    };

    const updateProfile = async (profileData) => {
        try {
            const { data } = await updateProfileMutation({
                variables: { input: profileData }
            });

            const updatedUser = data.updateProfile;
            setUser(updatedUser);
            localStorage.setItem('user', JSON.stringify(updatedUser));

            return { success: true, user: updatedUser };
        } catch (error) {
            return { success: false, error: error.message };
        }
    };

    return {
        user,
        token,
        isAuthenticated,
        loading: loading || userLoading,
        register,
        login,
        logout,
        forgotPassword,
        resetPassword,
        verifyEmail,
        changePassword,
        updateProfile,
        refetchUser
    };
}; 