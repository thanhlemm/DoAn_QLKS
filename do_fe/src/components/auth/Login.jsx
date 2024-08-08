import React, { useState, useContext, useEffect  } from "react"
import {  endpoints, authAPI } from "../utils/ApiFunctions"
import { googleLogin, googleLoginCallback, googleSignUp, googleSignUpCallback } from '../utils/ApiFunctions';

import { Link, useLocation, useNavigate, useSearchParams } from "react-router-dom"
// import { useAuth } from "./AuthProvider";
import axios from "axios"
import cookie from "react-cookies";
import { MyDispatchContext } from '../utils/MyContext';
import loadGoogleScript from '../utils/loadGoogleScripts'; // Import the utility function
import '../../Login.css';
import {FaUser, FaLock} from "react-icons/fa"


const Login = () => {
	const [errorMessage, setErrorMessage] = useState("")
	// const [login, setLogin] = useState({
	// 	email: "",
	// 	password: ""
	// })

	const navigate = useNavigate()
	// const auth = useAuth()
	const location = useLocation()
	const redirectUrl =  "/";
	const [searchParams] = useSearchParams(); // Hook to get URL parameters


	const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const dispatch = useContext(MyDispatchContext);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // const navigate = useNavigate(); // Initialize the navigate function

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

	// const handleInputChange = (e) => {
	// 	setLogin({ ...login, [e.target.name]: e.target.value })
	// }

	const handleSubmit = async (e) => {
		e.preventDefault(); // Ngăn chặn hành động mặc định của form
		setError("");
        setLoading(true);

        try {
            let res = await axios.post("http://127.0.0.1:8000/o/token/", {
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
                let userdata = await authAPI().get("http://127.0.0.1:8000/auth/user/current-user/");
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
        try {
            const data = await googleLogin();
            window.location.href = data.redirect_uri;
        } catch (error) {
            setError('Failed to initiate Google login');
        }
    };

    // const handleGoogleLoginCallback = async (code) => {
    //     try {
    //         const data = await googleLoginCallback(code);
    //         // Save token and redirect user
    //     } catch (error) {
    //         setError('Failed to complete Google login');
    //     }
    // };

	useEffect(() => {
		const code = searchParams.get("code");
		if (code) {
			// Gửi mã xác thực đến server
			const handleGoogleCallback = async () => {
				try {
					const response = await axios.get(`http://127.0.0.1:8000/auth/google/callback/?code=${code}`);
					cookie.save("token", response.data.token);
					let userdata = await axios.get("http://127.0.0.1:8000/auth/user/current-user/");
					cookie.save('user', userdata.data);
	
					dispatch({
						type: "login",
						payload: userdata.data
					});
	
					navigate(redirectUrl, { replace: true });
				} catch (error) {
					setError('Failed to complete Google login');
				}
			};
			handleGoogleCallback();
		}
	}, [searchParams, navigate, dispatch]);
	
	return (
		<div className="all">
		<div className="wrapper">
			{errorMessage && <p className="alert alert-danger">{errorMessage}</p>}
			<form onSubmit={handleSubmit}>
			<h2>Login</h2>

				<div className="input-box">
					{/* <label htmlFor="username" className="col-sm-2 col-form-label">
						Username
					</label>
					 */}
					{/* <div> */}
						<input
							id="username"
							name="username"
							type="username"
							// className="form-control"
							value={username}
							placeholder="Username"
							// onChange={handleInputChange}
							onChange={(e) => setUsername(e.target.value)}
						/>
						<FaUser className="icon"/>
					{/* </div> */}
				</div>

				<div className="input-box">
					{/* <label htmlFor="password" className="col-sm-2 col-form-label">
						Password
					</label> */}
					
					{/* <div> */}
						<input
							id="password"
							name="password"
							type="password"
							// className="form-control"
							value={password}
							placeholder="Password"
							// onChange={handleInputChange}
							onChange={(e) => setPassword(e.target.value)}
						/>
						<FaLock className="icon"/>
					{/* </div> */}
				</div>
				<button type="submit"  style={{ marginRight: "10px" }}>
						Login
				</button>
				<div className="register-link">
			{/* className="btn btn-hotel" */}
					
					<p>
						Dont have an account yet?<Link to={"/register"}> Register</Link>
					</p>
					<p>Or with</p>
				</div>

				<button type="button" onClick={handleGoogleLogin}>
                            Login with Google
                        </button>
				{/* <div id="g_id_onload"
					data-client_id="1088786597010-8efsh4c7kh2lnkunso0o5qidbc6hcmi6.apps.googleusercontent.com"
					data-context="signin"
					data-ux_mode="popup"
					data-login_uri="https://localhost:8000/auth/google/callback/login"
					data-itp_support="true">
				</div>

				<div class="g_id_signin"
					data-type="standard"
					data-shape="rectangular"
					data-theme="outline"
					data-text="signin_with"
					data-size="large"
					data-logo_alignment="left">
				</div> */}
				{/* <div id="googleSignInButton"></div> */}
			</form>
		</div>
		</div>
	)
}

export default Login