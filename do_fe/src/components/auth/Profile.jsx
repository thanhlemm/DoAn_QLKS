import React, { useContext, useEffect, useState } from 'react';
import { deleteUser, getBookingsByUserId, getUser, authAPI } from '../utils/ApiFunctions';
import { useNavigate } from 'react-router-dom';
import moment from 'moment';
import { MyUserContext } from '../utils/MyContext';
import cookie from "react-cookies";
import axios from "axios"



const Profile = () => {
    const user = useContext(MyUserContext);
    const [bookings, setBookings] = useState([]);
    const [message, setMessage] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const navigate = useNavigate();

    console.log('User from context:', user);

    useEffect(() => {
        const fetchUser = async () => {
            if (user && user.id) {
                try {
                    const userData = await getUser(user.id);
                    console.log('Fetched user data:', userData);
                } catch (error) {
                    console.error(error);
                }
            }
        };

        fetchUser();
    }, [user]);

    useEffect(() => {
        const fetchBookings = async () => {
            if (user && user.id) {
                try {
                    const response = await getBookingsByUserId(user.id);
                    setBookings(response);
                } catch (error) {
                    console.error('Error fetching bookings:', error.message);
                    setErrorMessage(error.message);
                }
            }
        };

        fetchBookings();
    }, [user]);

    // const handleDeleteAccount = async () => {
    //     if (user && user.id) {
    //         const confirmed = window.confirm(
    //             'Are you sure you want to delete your account? This action cannot be undone.'
    //         );
    //         if (confirmed) {
    //             try {
    //                 await authAPI().deleteUser(user.id);
    //                 setMessage('Account deleted successfully.');
    //                 cookie.remove("token");
    //        	 		cookie.remove("user");
    //                 navigate('/');
    //                 window.location.reload();
    //             } catch (error) {
    //                 setErrorMessage(error.message);
    //             }
    //         }
    //     }
    // };
	const handleDeleteAccount = async () => {
		if (user && user.id) {
			const confirmed = window.confirm(
				'Are you sure you want to delete your account? This action cannot be undone.'
			);
			if (confirmed) {
				try {
					// Lấy token từ cookies
					const token = cookie.load("token");
					if (!token) {
						throw new Error("Token not found. Please log in again.");
					}
	
					// Thực hiện yêu cầu xóa tài khoản với token xác thực
					await deleteUser(user.id, token)
	
					setMessage('Account deleted successfully.');
					cookie.remove("token");
					cookie.remove("user");
					navigate('/');
					window.location.reload();
				} catch (error) {
					setErrorMessage(error.message);
				}
			}
		}
	};
	

    if (!user) {
        return <p>Loading user data...</p>;
    }

    return (
        <div className="container">
            {errorMessage && <p className="text-danger">{errorMessage}</p>}
            {message && <p className="text-danger">{message}</p>}
            <div className="card p-5 mt-5" style={{ backgroundColor: 'whitesmoke' }}>
                <h4 className="card-title text-center">User Information</h4>
                <div className="card-body">
                    <div className="col-md-10 mx-auto">
                        <div className="card mb-3 shadow">
                            <div className="row g-0">
                                <div className="col-md-2">
                                    <div className="d-flex justify-content-center align-items-center mb-4">
                                        <img
                                            src="https://themindfulaimanifesto.org/wp-content/uploads/2020/09/male-placeholder-image.jpeg"
                                            alt="Profile"
                                            className="rounded-circle"
                                            style={{ width: '150px', height: '150px', objectFit: 'cover' }}
                                        />
                                    </div>
                                </div>
                                <div className="col-md-10">
                                    <div className="card-body">
                                        <div className="form-group row">
                                            <label className="col-md-2 col-form-label fw-bold">ID:</label>
                                            <div className="col-md-10">
                                                <p className="card-text">{user.id}</p>
                                            </div>
                                        </div>
                                        <hr />
                                        <div className="form-group row">
                                            <label className="col-md-2 col-form-label fw-bold">Full Name:</label>
                                            <div className="col-md-10">
                                                <p className="card-text">{user.fullname}</p>
                                            </div>
                                        </div>
                                        <hr />
                                        <div className="form-group row">
                                            <label className="col-md-2 col-form-label fw-bold">Email:</label>
                                            <div className="col-md-10">
                                                <p className="card-text">{user.email}</p>
                                            </div>
                                        </div>
                                        <hr />
                                        <div className="form-group row">
                                            <label className="col-md-2 col-form-label fw-bold">Roles:</label>
                                            <div className="col-md-10">
                                                <p className="card-text">{user.role?.name}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <h4 className="card-title text-center">Booking History</h4>

                        {bookings.length > 0 ? (
                            <table className="table table-bordered table-hover shadow">
                                <thead>
                                    <tr>
                                        <th scope="col">Booking ID</th>
                                        <th scope="col">Room ID</th>
                                        <th scope="col">Room Type</th>
                                        <th scope="col">Check In Date</th>
                                        <th scope="col">Check Out Date</th>
                                        <th scope="col">Confirmation Code</th>
                                        <th scope="col">Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {bookings.map((booking, index) => (
                                        <tr key={index}>
                                            <td>{booking.id}</td>
                                            <td>{booking.room.id}</td>
                                            <td>{booking.room.roomType}</td>
                                            <td>
                                                {moment(booking.checkInDate).subtract(1, 'month').format('MMM Do, YYYY')}
                                            </td>
                                            <td>
                                                {moment(booking.checkOutDate)
                                                    .subtract(1, 'month')
                                                    .format('MMM Do, YYYY')}
                                            </td>
                                            <td>{booking.bookingConfirmationCode}</td>
                                            <td className="text-success">On-going</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        ) : (
                            <p>You have not made any bookings yet.</p>
                        )}

                        <div className="d-flex justify-content-center">
                            <div className="mx-2">
                                <button className="btn btn-danger btn-sm" onClick={handleDeleteAccount}>
                                    Close account
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;


// import React, { useEffect, useState } from "react"
// import { deleteUser, getBookingsByUserId, getUser } from "../utils/ApiFunctions"
// import { useNavigate } from "react-router-dom"
// import moment from "moment"
// import { MyUserContext } from '../utils/MyContext';


// const Profile = () => {
// 	const [user, setUser] = useState({
// 		id: "",
// 		email: "",
// 		firstName: "",
// 		lastName: "",
// 		roles: [{ id: "", name: "" }]
// 	})

// 	const [bookings, setBookings] = useState([
// 		{
// 			id: "",
// 			room: { id: "", roomType: "" },
// 			checkInDate: "",
// 			checkOutDate: "",
// 			bookingConfirmationCode: ""
// 		}
// 	])
// 	const [message, setMessage] = useState("")
// 	const [errorMessage, setErrorMessage] = useState("")
// 	const navigate = useNavigate()

// 	const userId = localStorage.getItem("userId")
// 	const token = localStorage.getItem("token")

// 	useEffect(() => {
// 		const fetchUser = async () => {
// 			try {
// 				const userData = await getUser(userId, token)
// 				setUser(userData)
// 			} catch (error) {
// 				console.error(error)
// 			}
// 		}

// 		fetchUser()
// 	}, [userId])

// 	useEffect(() => {
// 		const fetchBookings = async () => {
// 			try {
// 				const response = await getBookingsByUserId(userId, token)
// 				setBookings(response)
// 			} catch (error) {
// 				console.error("Error fetching bookings:", error.message)
// 				setErrorMessage(error.message)
// 			}
// 		}

// 		fetchBookings()
// 	}, [userId])

// 	const handleDeleteAccount = async () => {
// 		const confirmed = window.confirm(
// 			"Are you sure you want to delete your account? This action cannot be undone."
// 		)
// 		if (confirmed) {
// 			await deleteUser(userId)
// 				.then((response) => {
// 					setMessage(response.data)
// 					localStorage.removeItem("token")
// 					localStorage.removeItem("userId")
// 					localStorage.removeItem("userRole")
// 					navigate("/")
// 					window.location.reload()
// 				})
// 				.catch((error) => {
// 					setErrorMessage(error.data)
// 				})
// 		}
// 	}

// 	return (
// 		<div className="container">
// 			{errorMessage && <p className="text-danger">{errorMessage}</p>}
// 			{message && <p className="text-danger">{message}</p>}
// 			{user ? (
// 				<div className="card p-5 mt-5" style={{ backgroundColor: "whitesmoke" }}>
// 					<h4 className="card-title text-center">User Information</h4>
// 					<div className="card-body">
// 						<div className="col-md-10 mx-auto">
// 							<div className="card mb-3 shadow">
// 								<div className="row g-0">
// 									<div className="col-md-2">
// 										<div className="d-flex justify-content-center align-items-center mb-4">
// 											<img
// 												src="https://themindfulaimanifesto.org/wp-content/uploads/2020/09/male-placeholder-image.jpeg"
// 												alt="Profile"
// 												className="rounded-circle"
// 												style={{ width: "150px", height: "150px", objectFit: "cover" }}
// 											/>
// 										</div>
// 									</div>

// 									<div className="col-md-10">
// 										<div className="card-body">
// 											<div className="form-group row">
// 												<label className="col-md-2 col-form-label fw-bold">ID:</label>
// 												<div className="col-md-10">
// 													<p className="card-text">{user.id}</p>
// 												</div>
// 											</div>
// 											<hr />

// 											<div className="form-group row">
// 												<label className="col-md-2 col-form-label fw-bold">First Name:</label>
// 												<div className="col-md-10">
// 													<p className="card-text">{user.firstName}</p>
// 												</div>
// 											</div>
// 											<hr />

// 											<div className="form-group row">
// 												<label className="col-md-2 col-form-label fw-bold">Last Name:</label>
// 												<div className="col-md-10">
// 													<p className="card-text">{user.lastName}</p>
// 												</div>
// 											</div>
// 											<hr />

// 											<div className="form-group row">
// 												<label className="col-md-2 col-form-label fw-bold">Email:</label>
// 												<div className="col-md-10">
// 													<p className="card-text">{user.email}</p>
// 												</div>
// 											</div>
// 											<hr />

// 											<div className="form-group row">
// 												<label className="col-md-2 col-form-label fw-bold">Roles:</label>
// 												<div className="col-md-10">
// 													<ul className="list-unstyled">
// 														{user.roles.map((role) => (
// 															<li key={role.id} className="card-text">
// 																{role.name}
// 															</li>
// 														))}
// 													</ul>
// 												</div>
// 											</div>
// 										</div>
// 									</div>
// 								</div>
// 							</div>

// 							<h4 className="card-title text-center">Booking History</h4>

// 							{bookings.length > 0 ? (
// 								<table className="table table-bordered table-hover shadow">
// 									<thead>
// 										<tr>
// 											<th scope="col">Booking ID</th>
// 											<th scope="col">Room ID</th>
// 											<th scope="col">Room Type</th>
// 											<th scope="col">Check In Date</th>
// 											<th scope="col">Check Out Date</th>
// 											<th scope="col">Confirmation Code</th>
// 											<th scope="col">Status</th>
// 										</tr>
// 									</thead>
// 									<tbody>
// 										{bookings.map((booking, index) => (
// 											<tr key={index}>
// 												<td>{booking.id}</td>
// 												<td>{booking.room.id}</td>
// 												<td>{booking.room.roomType}</td>
// 												<td>
// 													{moment(booking.checkInDate).subtract(1, "month").format("MMM Do, YYYY")}
// 												</td>
// 												<td>
// 													{moment(booking.checkOutDate)
// 														.subtract(1, "month")
// 														.format("MMM Do, YYYY")}
// 												</td>
// 												<td>{booking.bookingConfirmationCode}</td>
// 												<td className="text-success">On-going</td>
// 											</tr>
// 										))}
// 									</tbody>
// 								</table>
// 							) : (
// 								<p>You have not made any bookings yet.</p>
// 							)}

// 							<div className="d-flex justify-content-center">
// 								<div className="mx-2">
// 									<button className="btn btn-danger btn-sm" onClick={handleDeleteAccount}>
// 										Close account
// 									</button>
// 								</div>
// 							</div>
// 						</div>
// 					</div>
// 				</div>
// 			) : (
// 				<p>Loading user data...</p>
// 			)}
// 		</div>
// 	)
// }

// export default Profile