import React, { useEffect, useContext} from 'react';
import { useNavigate } from 'react-router-dom';
import { authAPI, api, endpoints } from "../utils/ApiFunctions"
import { MyDispatchContext } from '../utils/MyContext';

import cookie from "react-cookies";


const FacebookCallback = () => {
    const navigate = useNavigate();
    const dispatch = useContext(MyDispatchContext);

    useEffect(() => {
        const handleFacebookCallback = async () => {
            const urlParams = new URLSearchParams(window.location.search);
            const code = urlParams.get('code'); // Lấy mã code từ URL

            if (code) {
                try {
                    const res = await api.post('/auth/facebook/callback/login', { code }, {
                        headers: {
                           'Content-Type': 'application/json'
                        }
                     });
                    const token = res.data.access_token;

                    cookie.save('token', token);

                    const user = await api.get('/auth/user/current-user/', { headers: { Authorization: `Bearer ${token}` } });
                    cookie.save('user', user.data);
                    dispatch({
                        type: "login",
                        payload: user.data
                    });
                    navigate('/');
                } catch (error) {
                    console.error('Facebook login failed:', error);
                    navigate('/login');  
                }
            } else {
                console.error('Không có mã authorization code từ Facebook.');
                navigate('/login');
            }
        };

        handleFacebookCallback();
    }, [navigate]);

    return (
        <div>
            <p>Đang xử lý đăng nhập Facebook...</p>
        </div>
    );
};

export default FacebookCallback;
