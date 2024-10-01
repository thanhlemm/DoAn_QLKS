import React, { useState } from "react";
import { registerUser, endpoints } from "../utils/ApiFunctions";
import { Link } from "react-router-dom";
import '../../Login.css';


const Registration = () => {
    const [registration, setRegistration] = useState({
        username: "",
        first_name: "",
        last_name:"",
        email: "",
        password: "",
        password2: "",
        role: 2,
        DOB: "",
        address: "",
        phone: "",
        sex: 2 
    });

    const [errorMessage, setErrorMessage] = useState("");
    const [successMessage, setSuccessMessage] = useState("");

    const handleInputChange = (e) => {
        setRegistration({ ...registration, [e.target.name]: e.target.value });
    };

    const handleRegistration = async (e) => {
        e.preventDefault();
        try {
            const result = await registerUser(registration);
            setSuccessMessage("Registration successful!");
            setErrorMessage("");
            setRegistration({
                username: "",
                first_name: "",
                last_name:"",
                email: "",
                password: "",
                password2: "",
                role: 1,
                DOB: "",
                address: "",
                phone: "",
                sex: 2
            });
        } catch (error) {
            setSuccessMessage("");
            setErrorMessage(`Registration error: ${error.message}`);
        }
        setTimeout(() => {
            setErrorMessage("");
            setSuccessMessage("");
        }, 5000);
    };

    const handleGoogleLogin = async () => {
        const googleCallbackLogin = endpoints['googleCallbackLogin'];
		const redirectUri = encodeURIComponent(googleCallbackLogin);

		const clientId = process.env.REACT_APP_GOOGLE_CLIENT_ID;

		// Lấy URL frontend hiện tại để truyền qua backend
		const currentFrontendUrl = encodeURIComponent(window.location.origin);

		const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?response_type=code&client_id=${clientId}&redirect_uri=${redirectUri}&scope=openid%20https://www.googleapis.com/auth/userinfo.email%20https://www.googleapis.com/auth/userinfo.profile&access_type=offline&prompt=select_account&state=${currentFrontendUrl}`;

		window.location.href = authUrl;
    };


    return (
        <div className="all">
        <div className="wrapper">
            {errorMessage && <p className="alert alert-danger">{errorMessage}</p>}
            {successMessage && <p className="alert alert-success">{successMessage}</p>}

            <h2>Register</h2>
            <form onSubmit={handleRegistration}>
                <div className="input-box">
                    {/* <label htmlFor="username" className="col-sm-2 col-form-label">Username</label> */}
                        <input
                            id="username"
                            name="username"
                            type="text"
                            className="form-control"
                            placeholder="Username"
                            value={registration.username}
                            onChange={handleInputChange}
                        />
                </div>
                <div className="input-box">
                    {/* <label htmlFor="fullname" className="col-sm-2 col-form-label">Fullname</label> */}
                        <input
                            id="first_name"
                            name="first_name"
                            type="text"
                            className="form-control"
                            placeholder="first_name"
                            value={registration.first_name}
                            onChange={handleInputChange}
                        />
                </div>
                <div className="input-box">
                        <input
                            id="last_name"
                            name="last_name"
                            type="text"
                            className="form-control"
                            placeholder="last_name"
                            value={registration.last_name}
                            onChange={handleInputChange}
                        />
                </div>
                <div className="input-box">
                    {/* <label htmlFor="email" className="col-sm-2 col-form-label">Email</label> */}
                        <input
                            id="email"
                            name="email"
                            type="email"
                            className="form-control"
                            placeholder="Email"
                            value={registration.email}
                            onChange={handleInputChange}
                        />
                </div>
                <div className="input-box">
                    {/* <label htmlFor="password" className="col-sm-2 col-form-label">Password</label> */}
                        <input
                            id="password"
                            name="password"
                            type="password"
                            className="form-control"
                            placeholder="Password"
                            value={registration.password}
                            onChange={handleInputChange}
                        />
                </div>
                <div className="input-box">
                    {/* <label htmlFor="password2" className="col-sm-2 col-form-label">Confirm Password</label> */}
                        <input
                            id="password2"
                            name="password2"
                            type="password"
                            className="form-control"
                            placeholder="Confirm Password"
                            value={registration.password2}
                            onChange={handleInputChange}
                        />
                </div>
                <div className="input-box">
                    {/* <label htmlFor="DOB" className="col-sm-2 col-form-label">Date of Birth</label> */}
                        <input
                            id="DOB"
                            name="DOB"
                            type="date"
                            className="form-control"
                            placeholder="Date of Birth"
                            value={registration.DOB}
                            onChange={handleInputChange}
                        />
                </div>
                <div className="input-box">
                    {/* <label htmlFor="address" className="col-sm-2 col-form-label">Address</label> */}
                        <input
                            id="address"
                            name="address"
                            type="text"
                            className="form-control"
                            placeholder="Address"
                            value={registration.address}
                            onChange={handleInputChange}
                        />
                </div>
                <div className="input-box">
                    {/* <label htmlFor="phone" className="col-sm-2 col-form-label">Phone</label> */}
                        <input
                            id="phone"
                            name="phone"
                            type="text"
                            className="form-control"
                            placeholder="Phone"
                            value={registration.phone}
                            onChange={handleInputChange}
                        />
                </div>
                <div className="input-box">
                    {/* <label htmlFor="sex" className="col-sm-2 col-form-label">Sex</label> */}
                        <select
                            id="sex"
                            name="sex"
                            className="form-control"
                            placeholder="Gender"
                            value={registration.sex}
                            onChange={handleInputChange}
                        >
                            <option value={1}>Nam</option>
                            <option value={2}>Nữ</option>
                        </select>
                </div>
                <button type="submit"  style={{ marginRight: "10px" }}>
                        Register
                    </button>
                <div className="register-link">
                    
                    <p style={{ marginLeft: "10px" }}>
                        Already have an account? <Link to={"/login"}>Login</Link>
                    </p>
                    <p>Or sign up with</p>

                </div>
                <button type="button" onClick={handleGoogleLogin}>Sign Up with Google</button>
            </form>
        </div>
        </div>
    );
};

export default Registration;

