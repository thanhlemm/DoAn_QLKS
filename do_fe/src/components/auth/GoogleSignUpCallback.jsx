import React, { useEffect } from "react";

const GoogleSignUpCallback = () => {
    useEffect(() => {
        const getGoogleToken = async () => {
            const queryParams = new URLSearchParams(window.location.search);
            const authCode = queryParams.get('code');

            try {
                const response = await fetch(`http://localhost:8000/auth/google/callback/signup/?code=${authCode}`);
                const data = await response.json();
                localStorage.setItem('token', data.token);
                // Redirect or handle successful sign up
            } catch (error) {
                console.error('Error during Google sign up callback:', error);
            }
        };

        getGoogleToken();
    }, []);

    return <div>Loading...</div>;
};

export default GoogleSignUpCallback;
