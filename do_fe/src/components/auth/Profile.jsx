import React, { useContext, useEffect, useState } from 'react';
import { deleteUser, getBookingsByUserId, getUser } from '../utils/ApiFunctions';
import { useNavigate } from 'react-router-dom';
import moment from 'moment';
import { MyUserContext } from '../utils/MyContext';
import cookie from "react-cookies";



const Profile = () => {
    const user = useContext(MyUserContext);
    const [bookings, setBookings] = useState([]);
    const [message, setMessage] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const navigate = useNavigate();


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
                                            src={user.avatar ? user.avatar.replace("image/upload/", "") : "https://via.placeholder.com/200"}
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
											<label className="col-md-2 col-form-label fw-bold">First Name:</label>
												<div className="col-md-10">
													<p className="card-text">{user.first_name}</p>
												</div>
										</div>
										<hr />
 										<div className="form-group row">
                                            <label className="col-md-2 col-form-label fw-bold">Last Name:</label>
                                            <div className="col-md-10"> 													
                                            <p className="card-text">{user.last_name}</p>
                                            </div>
 										</div>
                                        <hr />
                                        <div className="form-group row">
                                            <label className="col-md-2 col-form-label fw-bold">Email:</label>
                                            <div className="col-md-10">
                                                <p className="card-text">{user.username}</p>
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


