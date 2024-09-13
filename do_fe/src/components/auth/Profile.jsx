import React, { useContext, useEffect, useState } from 'react';
import { getBookingsByUserId, getUser, getFeedbacksByUser } from '../utils/ApiFunctions';
import { useNavigate } from 'react-router-dom';
import moment from 'moment';
import { MyUserContext } from '../utils/MyContext';
import Feedback from '../common/Feedback'; 
import cookie from "react-cookies";


const Profile = () => {
    const user = useContext(MyUserContext);
    const [bookings, setBookings] = useState([]);
    const [feedbacks, setFeedbacks] = useState([]); // State for feedbacks
    const [message, setMessage] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [selectedBooking, setSelectedBooking] = useState(null); // Selected booking for feedback
    const navigate = useNavigate();
    const [showFeedbackModal, setShowFeedbackModal] = useState(false); // Feedback modal

    const handleFeedbackClose = () => setShowFeedbackModal(false);
    const handleFeedbackShow = (booking) => {
        setSelectedBooking(booking);
        console.log(selectedBooking)
        setShowFeedbackModal(true);
    };

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

    useEffect(() => {
        const fetchFeedbacks = async () => {
            if (user && user.id) {
                try {
                    const token = cookie.load('token')
                    const response = await getFeedbacksByUser(token); // Fetch user feedbacks
                    setFeedbacks(response);
                } catch (error) {
                    console.error('Error fetching feedbacks:', error.message);
                }
            }
        };

        fetchFeedbacks();
    }, [user]);

    const hasFeedback = (bookingId) => {
        return feedbacks.some(feedback => feedback.booking === bookingId); // Check for existing feedback
    };

    return (
        <>
        <div className="container">
            {errorMessage && <p className="text-danger">{errorMessage}</p>}
            {message && <p className="text-success">{message}</p>}
            <div className="card p-5 mt-5" style={{ backgroundColor: 'whitesmoke' }}>
                {/* User Information */}
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
                    </div>
                </div>

                {/* Booking History */}
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
                                <th scope="col">Status</th>
                                <th scope="col">Feedback</th>
                            </tr>
                        </thead>
                        <tbody>
                            {bookings.map((booking, index) => (
                                <tr key={index}>
                                    <td>{booking.id}</td>
                                    <td>{booking.room}</td>
                                    <td>{booking.room_type?.type}</td>
                                    <td>{moment(booking.check_in_date).format('MMM Do, YYYY')}</td>
                                    <td>{moment(booking.check_out_date).format('MMM Do, YYYY')}</td>
                                    <td className="text-success">On-going</td>
                                    <td>
                                        {hasFeedback(booking.id) ? (
                                            <span className="text-muted">Feedback submitted</span>
                                        ) : (
                                            <button className="btn btn-sm btn-primary" onClick={() => handleFeedbackShow(booking)}>
                                                Feedback
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                ) : (
                    <p>You have not made any bookings yet.</p>
                )}
            </div>
        </div>

        {/* Modal for feedback */}
        <Feedback
            show={showFeedbackModal}
            handleClose={handleFeedbackClose}
            booking={selectedBooking}
        />
        </>
    );
};

export default Profile;

