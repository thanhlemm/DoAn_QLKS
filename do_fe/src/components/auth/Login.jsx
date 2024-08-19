import React, { useState, useContext} from "react"
import { authAPI, api, endpoints } from "../utils/ApiFunctions"

import { Link, useNavigate } from "react-router-dom"
// import { useAuth } from "./AuthProvider";
import cookie from "react-cookies";
import { MyDispatchContext } from '../utils/MyContext';
import '../../Login.css';
import {FaUser, FaLock} from "react-icons/fa"
import FacebookLogin from 'react-facebook-login';



const Login = () => {
	const [errorMessage, setErrorMessage] = useState("")

	const navigate = useNavigate()
	
	const redirectUrl =  "/";


	const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const dispatch = useContext(MyDispatchContext);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');


    const handleLoginError = (errorStatus) => {
        switch (errorStatus) {
            case 400:
                setError("Sai tên đăng nhập hoặc mật khẩu");
                break;
            default:
                setError("Đăng nhập không thành công");
                break;
        }
    };


	const handleSubmit = async (e) => {
		e.preventDefault(); // Ngăn chặn hành động mặc định của form
		setError("");
        setLoading(true);

        try {
            let res = await api.post(endpoints['login'], {
                'username': username,
                'password': password,
                'client_id': "POkr2m9KRfZvr2540CCw6Qak3afnWNOaEAsq3T6H",
                'client_secret': "lilvT91YGlvKo9oZsBh1spGU9BUxmEHK777HhnCNKssYzBpvhj9Akd642Bk4biN6iq7GnYsrxcFsGeF0wgGYo0R0HFYf95q6dxRxobz6YieYu8cRTerPR5OsksPCvkIX",
                'grant_type': "password",
            }, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            if (res.status === 200) {
                cookie.save("token", res.data.access_token);
                let userdata = await authAPI(res.data.access_token).get(endpoints['current_user']);
                cookie.save('user', userdata.data);

                dispatch({
                    type: "login",
                    payload: userdata.data
                });

				

                navigate(redirectUrl, {replace: true}); // Redirect to the home page
            } else {       
                handleLoginError(res.status);
                console.error("Đăng nhập không thành công:", res);
            }
        } catch (ex) {
            console.error("Lỗi tại màn hình đăng nhập:", ex);
            setError("Sai tên hoặc mật khẩu, vui lòng thử lại.");
        } finally {
            setLoading(false);
        }
	}

	const handleGoogleLogin = async () => {
        const googleCallbackLogin = endpoints['googleCallbackLogin'];
		const redirectUri = encodeURIComponent(googleCallbackLogin);

		const clientId = process.env.REACT_APP_GOOGLE_CLIENT_ID;

		// Lấy URL frontend hiện tại để truyền qua backend
		const currentFrontendUrl = encodeURIComponent(window.location.origin);

		const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?response_type=code&client_id=${clientId}&redirect_uri=${redirectUri}&scope=openid%20https://www.googleapis.com/auth/userinfo.email%20https://www.googleapis.com/auth/userinfo.profile&access_type=offline&prompt=select_account&state=${currentFrontendUrl}`;

		window.location.href = authUrl;
    };

	const handleFacebookLogin = async () => {
		const facebookCallbackLogin = endpoints['facebookCallbackLogin'];
		const redirectUri = encodeURIComponent(facebookCallbackLogin);
	
		const clientId = process.env.REACT_APP_FACEBOOK_APP_ID;
	
		// Lấy URL frontend hiện tại để truyền qua backend
		const currentFrontendUrl = encodeURIComponent(window.location.origin);
	
		// URL OAuth của Facebook để yêu cầu người dùng đăng nhập
		const authUrl = `https://www.facebook.com/v9.0/dialog/oauth?client_id=${clientId}&redirect_uri=${redirectUri}&state=${currentFrontendUrl}&scope=email,public_profile`;
	
		window.location.href = authUrl;
	};
	

	// const responseFacebook = (response) => {
	// 	console.log(response);
	//   }
	const handleSuccess = async (response) => {
		if (!response || !response.authResponse) {
			alert('Đăng nhập thất bại. Không nhận được phản hồi từ Facebook.');
			return;
		}
        try {
			const accessToken = response.authResponse.accessToken;
			const res = await api.post(endpoints['facebookCallbackLogin'], {
                access_token: accessToken
            });

            const token  = res.data;
            cookie.save("token", token);

                try {
                    // Yêu cầu thông tin người dùng từ API
                    let userdata = await authAPI(token).get(endpoints['current_user']);

                    // Lưu thông tin người dùng vào cookie
                    cookie.save('user', userdata.data);
                    // Cập nhật trạng thái người dùng trong Redux store
                    dispatch({
                        type: "login",
                        payload: userdata.data
                    });
                } catch (error) {
                    console.error("Lỗi khi lấy thông tin người dùng:", error);
                }

                navigate('/');
        } catch (error) {
            console.error(error);
            alert(`Đăng nhập thất bại. Vui lòng kiểm tra thông tin và thử lại.\nDetails: ${error}`);
        }
    };
	return (
		<div className="all">
		<div className="wrapper">
			{errorMessage && <p className="alert alert-danger">{errorMessage}</p>}
			<form onSubmit={handleSubmit}>
			<h2>Login</h2>

				<div className="input-box">
						<input
							id="username"
							name="username"
							type="username"
							value={username}
							placeholder="Username"
							onChange={(e) => setUsername(e.target.value)}
						/>
						<FaUser className="icon"/>
				</div>

				<div className="input-box">
						<input
							id="password"
							name="password"
							type="password"
							value={password}
							placeholder="Password"
							onChange={(e) => setPassword(e.target.value)}
						/>
						<FaLock className="icon"/>
				</div>
				<button type="submit"  style={{ marginRight: "10px" }}>
						Login
				</button>
				<div className="register-link">					
					<p>
						Dont have an account yet?<Link to={"/register"}> Register</Link>
					</p>
					<p>Or with</p>
				</div>

				<button type="button" onClick={handleGoogleLogin} style={{ marginBottom: "10px" }}>
                    Login with Google
                </button>
				{/* <button type="button" onClick={handleFacebookLogin} style={{ marginTop: "10px" }}>
                    Facebook
                </button> */}
				<FacebookLogin
					appId={process.env.REACT_APP_FACEBOOK_APP_ID}
					autoLoad={false}
					scope="public_profile,email"
					fields="name,email,picture"
					// callback={responseFacebook}
					callback={handleSuccess}
					cssClass="my-facebook-button-class"
				/>
			</form>
		</div>
		</div>
	)
}

export default Login