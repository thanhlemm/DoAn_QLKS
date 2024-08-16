import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

function GoogleLoginCallback() {
    const location = useLocation();
    const navigate = useNavigate();

    useEffect(() => {
        const fetchToken = async () => {
            try {
                const response = await fetch(`http://127.0.0.1:8000/auth/google/callback/login${location.search}`);
                const data = await response.json();

                if (data.access_token) {
                    // Lưu token vào cookies hoặc localStorage
                    document.cookie = `token=${data.access_token}; path=/`;

                    // Điều hướng về trang chủ hoặc trang khác
                    navigate('http://127.0.0.1:3000/');
                } else {
                    console.error('Login failed:', data.error);
                    // Xử lý lỗi nếu có
                }
            } catch (error) {
                console.error('Error during Google login:', error);
            }
        };

        fetchToken();
    }, [location.search, navigate]);

    return <div>Processing Google login...</div>;
}

export default GoogleLoginCallback;
