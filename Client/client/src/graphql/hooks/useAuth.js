import { useState, useEffect } from 'react';
import { useMutation, useQuery } from '@apollo/client';
import {
    REGISTER_USER,
    LOGIN_USER,
    FORGOT_PASSWORD,
    RESET_PASSWORD,
    VERIFY_EMAIL,
    SEND_EMAIL_VERIFICATION,
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
    const [sendEmailVerificationMutation] = useMutation(SEND_EMAIL_VERIFICATION);
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
            const input = {
                ...userData,
                // Map firstName + lastName to name if provided
                name: userData.name || `${userData.firstName ?? ''} ${userData.lastName ?? ''}`.trim(),
            };
            delete input.firstName;
            delete input.lastName;

            const { data } = await registerMutation({ variables: { input } });
            const { token: authToken, refreshToken, user: userDataOut } = data.register;
            if (authToken) localStorage.setItem('token', authToken);
            if (refreshToken) localStorage.setItem('refreshToken', refreshToken);
            if (userDataOut) localStorage.setItem('user', JSON.stringify(userDataOut));
            setToken(authToken || null);
            setUser(userDataOut || null);
            setIsAuthenticated(!!authToken);
            return { success: true, user: userDataOut, token: authToken, refreshToken };
        } catch (error) {
            return { success: false, error: error.message };
        }
    };

    const login = async (credentials) => {
        try {
            const { data } = await loginMutation({
                variables: { input: credentials }
            });

            const { token: authToken, refreshToken, user: userData } = data.loginUser;

            // Store in localStorage
            localStorage.setItem('token', authToken);
            if (refreshToken) localStorage.setItem('refreshToken', refreshToken);
            localStorage.setItem('user', JSON.stringify(userData));

            // Update state
            setToken(authToken);
            setUser(userData);
            setIsAuthenticated(true);

            return { success: true, user: userData, token: authToken, refreshToken };
        } catch (error) {
            return { success: false, error: error.message };
        }
    };

    // Backward compatible alias used by SignIn component
    const signIn = async (email, password, rememberMe) => {
        const result = await login({ email, password });
        // Optionally persist longer if rememberMe provided; currently handled by JWT expiry
        return result;
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
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
            const { token: resetToken, newPassword } = resetData;
            const { data } = await resetPasswordMutation({ variables: { token: resetToken, newPassword } });
            return { success: !!data.resetPassword };
        } catch (error) {
            return { success: false, error: error.message };
        }
    };

    const verifyEmail = async (verificationToken) => {
        try {
            const { data } = await verifyEmailMutation({ variables: { token: verificationToken } });
            return { success: !!data.verifyEmail };
        } catch (error) {
            return { success: false, error: error.message };
        }
    };

    const sendEmailVerification = async () => {
        try {
            const { data } = await sendEmailVerificationMutation();
            return { success: !!data.sendEmailVerification };
        } catch (error) {
            return { success: false, error: error.message };
        }
    };

    const changePassword = async (passwordData) => {
        try {
            const { currentPassword, newPassword } = passwordData;
            const { data } = await changePasswordMutation({ variables: { currentPassword, newPassword } });
            return { success: !!data.changePassword };
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
        signIn,
        logout,
        forgotPassword,
        resetPassword,
        verifyEmail,
        sendEmailVerification,
        changePassword,
        updateProfile,
        refetchUser
    };
}; 