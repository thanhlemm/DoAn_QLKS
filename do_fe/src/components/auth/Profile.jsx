import React, { useContext, useEffect, useState } from 'react';
import { getBookingsByUserId, getAllRooms, api, getFeedbacksByUser, deleteUser } from '../utils/ApiFunctions';
import { useNavigate } from 'react-router-dom';
import moment from 'moment';
import { MyUserContext } from '../utils/MyContext';
import Feedback from '../common/Feedback'; 
import cookie from "react-cookies";

import PasswordModal from '../common/PasswordModal'; 
import { checkPasswordStatus, NewPassword, changePassword } from '../utils/ApiFunctions'; 



const Profile = () => {
    const user = useContext(MyUserContext);
    const [bookings, setBookings] = useState([]);
    const [feedbacks, setFeedbacks] = useState([]); 
    const [message, setMessage] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [selectedBooking, setSelectedBooking] = useState(null); 
    const navigate = useNavigate();
    const [showFeedbackModal, setShowFeedbackModal] = useState(false); 
    const [showPasswordModal, setShowPasswordModal] = useState(false); 
    const [isNewPassword, setIsNewPassword] = useState(false); 
    const [passwordStatus, setPasswordStatus] = useState(null);
    const [rooms, setRooms] = useState([]);
    const [branches, setBranches] = useState([]);
    const [roomTypes, setRoomTypes] = useState([]);


  useEffect(() => {
    fetchRooms();
    fetchBranches();
    fetchRoomType();
  }, []);

  const fetchRooms = async () => {
    try {
      const result = await getAllRooms();
      setRooms(result);
    } catch (error) {
      console.log(error);
    }
  };

  const getRoomNumber = (roomId) => {
    // Ensure that rooms are loaded before accessing them
    if (!rooms || rooms.length === 0) {
      return "Loading...";
    }

    const room = rooms.find((r) => r.id === roomId);
    return room ? `${room.room_number}` : "Unknown";
  };

  const fetchBranches = async () => {
    try {
      const response = await api.get("/hotel/branch/");
      setBranches(response.data);
    } catch (error) {
      console.error("Error fetching branches:", error);
    }
  };

  const getBranchName = (id) => {
    const branch = branches.find((branch) => branch.id === id);
    return branch ? branch.name : "Unknown";
  };

  const fetchRoomType = async () => {
    try {
      const response = await api.get("/hotel/roomtypes/");
      setRoomTypes(response.data);
    } catch (error) {
      console.error("Error fetching branches:", error);
    }
  };

  const getRoomTypeName = (id) => {
    const rt = roomTypes.find((rt) => rt.id === id);
    return rt ? rt.type : "Unknown";
  };

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
                    const activeBookings = response.filter(booking => booking.is_active === true);
                    setBookings(activeBookings);
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

    useEffect(() => {
        const checkUserPasswordStatus = async () => {
            const token = cookie.load('token');
            try {
                const status = await checkPasswordStatus(token);
                setPasswordStatus(status);
                setIsNewPassword(!status.message.includes('Password exists')); 
                // setShowPasswordModal(true); 
            } catch (error) {
                console.error('Error checking password status:', error.message);
            }
        };

        if (user && user.id) {
            checkUserPasswordStatus();
        }
    }, [user]);

    const handlePasswordSubmit = async (oldPassword, newPassword, confirmNewPassword) => {
        const token = cookie.load('token');

        try {
            if (isNewPassword) {
                await NewPassword(newPassword, confirmNewPassword, token);
                alert('Password set successfully.')
                setMessage('Password set successfully.');
            } else {
                await changePassword(oldPassword, newPassword, token);
                alert('Password changed successfully.')
                setMessage('Password changed successfully.');
            }
            setShowPasswordModal(false); 
        } catch (error) {
            setErrorMessage(error.message);
        }
    };

    const handleDeleteAccount = async () => {
        const token = cookie.load('token');
        try {
            const result = await deleteUser(user.id, token);
            setMessage('Account deleted successfully.');
            navigate('/login'); 
        } catch (error) {
            setErrorMessage(error.message);
        }
    };

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
                                        <hr />
                                        <button className="btn btn-primary" onClick={() => setShowPasswordModal(true)}>
                                            {isNewPassword ? 'Create New Password' : 'Change Password'}
                                        </button>
                                        <button className="btn btn-danger ms-3 " style={{backgroundColor:"red"}} onClick={handleDeleteAccount}>
                                            Delete Account
                                        </button>
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
                                <th scope="col">Booking Confirmation Code</th>
                                <th scope="col">Branch</th>
                                <th scope="col">Room Number</th>
                                <th scope="col">Room Type</th>
                                <th scope="col">Check In Date</th>
                                <th scope="col">Check Out Date</th>
                                <th scope="col">Status payment</th>
                                <th scope="col">Feedback</th>
                            </tr>
                        </thead>
                        <tbody>
                            {bookings.map((booking, index) => (
                                <tr key={index}>
                                    <td>{booking.confirmationCode}</td>
                                    <td>{getBranchName(booking.branch)}</td>
                                    <td>{Array.isArray(booking.room) ? booking.room.map(id => getRoomNumber(id)).join(', ') : getRoomNumber(booking.room)}</td>
                                    <td>{getRoomTypeName(booking.room_type)}</td>
                                    <td>{moment(booking.check_in_date).format('MMM Do, YYYY')}</td>
                                    <td>{moment(booking.check_out_date).format('MMM Do, YYYY')}</td>
                                    <td className="text-success">{booking.payment_status}</td>
                                    {/* <td>
                                        {hasFeedback(booking.id) ? (
                                            <span className="text-muted">Feedback submitted</span>
                                        ) : (
                                            <button className="btn btn-sm btn-primary" onClick={() => handleFeedbackShow(booking)}>
                                                Feedback
                                            </button>
                                        )}
                                    </td> */}
                                    <td>
                                        {booking.checked_out ? (
                                            hasFeedback(booking.id) ? (
                                                <span className="text-muted">Feedback submitted</span>
                                            ) : (
                                                <button className="btn btn-sm btn-primary" onClick={() => handleFeedbackShow(booking)}>
                                                    Feedback
                                                </button>
                                            )
                                        ) : (
                                            <span className="text-muted">Not checked out</span>
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

        <PasswordModal
            show={showPasswordModal}
            handleClose={() => setShowPasswordModal(false)}
            isNewPassword={isNewPassword}
            onSubmit={handlePasswordSubmit}
        />
        </>
    );
};

export default Profile;

