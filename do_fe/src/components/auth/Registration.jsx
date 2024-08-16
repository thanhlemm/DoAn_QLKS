import React, { useState } from "react";
import { registerUser } from "../utils/ApiFunctions";
import { googleSignUp, googleSignUpCallback  } from "../utils/ApiFunctions"; // Import the Google sign-up function
import { Link } from "react-router-dom";
import '../../Login.css';


const Registration = () => {
    const [registration, setRegistration] = useState({
        username: "",
        fullname: "",
        email: "",
        password: "",
        password2: "",
        role: 3,
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
                fullname: "",
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

    const handleGoogleSignUp = async () => {
        try {
            const data = await googleSignUp();
            window.location.href = data.redirect_uri;
        } catch (error) {
            setErrorMessage('Failed to initiate Google sign-up');
        }
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
                            id="fullname"
                            name="fullname"
                            type="text"
                            className="form-control"
                            placeholder="Fullname"
                            value={registration.fullname}
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
                <button type="button" onClick={handleGoogleSignUp}>Sign Up with Google</button>
            </form>
        </div>
        </div>
    );
};

export default Registration;

