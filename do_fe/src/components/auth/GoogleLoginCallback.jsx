import React, { useEffect } from "react";

const GoogleLoginCallback = () => {
    useEffect(() => {
        const getGoogleToken = async () => {
            const queryParams = new URLSearchParams(window.location.search);
            const authCode = queryParams.get('code');

            try {
                const response = await fetch(`http://localhost:8000/auth/google/callback/login/?code=${authCode}`);
                const data = await response.json();
                localStorage.setItem('token', data.token);
                // Redirect or handle successful login
            } catch (error) {
                console.error('Error during Google login callback:', error);
            }
        };

        getGoogleToken();
    }, []);

    return <div>Loading...</div>;
};

export default GoogleLoginCallback;
