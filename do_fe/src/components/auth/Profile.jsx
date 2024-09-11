// import React, { useContext, useEffect, useState } from 'react';
// import { deleteUser, getBookingsByUserId, getUser, changePassword, checkPasswordStatus, NewPassword, getFeedbacksByUser, createFeedback } from '../utils/ApiFunctions';
// import { useNavigate } from 'react-router-dom';
// import { Modal, Button } from 'react-bootstrap';
// import moment from 'moment';
// import { MyUserContext } from '../utils/MyContext';
// import cookie from "react-cookies";

// const Profile = () => {
//     const user = useContext(MyUserContext);
//     const [bookings, setBookings] = useState([]);
//     const [feedbacks, setFeedbacks] = useState([]); // State for feedbacks
//     const [message, setMessage] = useState('');
//     const [errorMessage, setErrorMessage] = useState('');
//     const [rating, setRating] = useState(5);
//     const [comment, setComment] = useState('');
//     const [selectedBooking, setSelectedBooking] = useState(null); // Selected booking for feedback
//     const navigate = useNavigate();
//     const [oldPassword, setOldPassword] = useState('');
//     const [newPassword, setNewPassword] = useState('');
//     const [confirmNewPassword, setConfirmNewPassword] = useState('');
//     const [passwordStatus, setPasswordStatus] = useState(null);
//     const [show, setShow] = useState(false);
//     const [showFeedbackModal, setShowFeedbackModal] = useState(false); // Feedback modal

//     const handleClose = () => setShow(false);
//     const handleShow = () => setShow(true);

//     const handleFeedbackClose = () => setShowFeedbackModal(false);
//     const handleFeedbackShow = (booking) => {
//         setSelectedBooking(booking);
//         setShowFeedbackModal(true);
//     };

//     useEffect(() => {
//         const fetchUser = async () => {
//             if (user && user.id) {
//                 try {
//                     const userData = await getUser(user.id);
//                 } catch (error) {
//                     console.error(error);
//                 }
//             }
//         };

//         fetchUser();
//     }, [user]);

//     useEffect(() => {
//         const fetchBookings = async () => {
//             if (user && user.id) {
//                 try {
//                     const response = await getBookingsByUserId(user.id);
//                     setBookings(response);
//                 } catch (error) {
//                     console.error('Error fetching bookings:', error.message);
//                     setErrorMessage(error.message);
//                 }
//             }
//         };

//         fetchBookings();
//     }, [user]);

//     useEffect(() => {
//         const fetchFeedbacks = async () => {
//             if (user && user.id) {
//                 try {
//                     const response = await getFeedbacksByUser(user.id); // Lấy feedbacks của user
//                     setFeedbacks(response);
//                 } catch (error) {
//                     console.error('Error fetching feedbacks:', error.message);
//                 }
//             }
//         };

//         fetchFeedbacks();
//     }, [user]);

//     const handleSubmitFeedback = async () => {
//         if (selectedBooking) {
//             try {
//                 const token = cookie.load("token"); // Lấy token từ cookie
//                 await createFeedback(selectedBooking.id, rating, comment, token); // Gửi đánh giá
//                 setMessage('Feedback submitted successfully.');
//                 handleFeedbackClose();
//             } catch (error) {
//                 setErrorMessage('Error submitting feedback.');
//             }
//         }
//     };

//     const hasFeedback = (bookingId) => {
//         return feedbacks.some(feedback => feedback.booking_id === bookingId); // Kiểm tra feedback cho booking
//     };

//     return (
//         <>
//         <div className="container">
//             {errorMessage && <p className="text-danger">{errorMessage}</p>}
//             {message && <p className="text-danger">{message}</p>}
//             <div className="card p-5 mt-5" style={{ backgroundColor: 'whitesmoke' }}>
//                 {/* User Information */}
//                 {/* Booking History */}
//                 <h4 className="card-title text-center">Booking History</h4>

//                 {bookings.length > 0 ? (
//                     <table className="table table-bordered table-hover shadow">
//                         <thead>
//                             <tr>
//                                 <th scope="col">Booking ID</th>
//                                 <th scope="col">Room ID</th>
//                                 <th scope="col">Room Type</th>
//                                 <th scope="col">Check In Date</th>
//                                 <th scope="col">Check Out Date</th>
//                                 <th scope="col">Status</th>
//                                 <th scope="col">Feedback</th> {/* Feedback column */}
//                             </tr>
//                         </thead>
//                         <tbody>
//                             {bookings.map((booking, index) => (
//                                 <tr key={index}>
//                                     <td>{booking.id}</td>
//                                     <td>{booking.room}</td>
//                                     <td>{booking.room_type?.type}</td>
//                                     <td>{moment(booking.check_in_date).format('MMM Do, YYYY')}</td>
//                                     <td>{moment(booking.check_out_date).format('MMM Do, YYYY')}</td>
//                                     <td className="text-success">On-going</td>
//                                     <td>
//                                         {hasFeedback(booking.id) ? (
//                                             <span className="text-muted">Feedback submitted</span>
//                                         ) : (
//                                             <button className="btn btn-sm btn-primary" onClick={() => handleFeedbackShow(booking)}>
//                                                 Leave Feedback
//                                             </button>
//                                         )}
//                                     </td>
//                                 </tr>
//                             ))}
//                         </tbody>
//                     </table>
//                 ) : (
//                     <p>You have not made any bookings yet.</p>
//                 )}
//             </div>
//         </div>

//         {/* Modal for feedback */}
//         <Modal show={showFeedbackModal} onHide={handleFeedbackClose}>
//             <Modal.Header closeButton>
//                 <Modal.Title>Leave Feedback</Modal.Title>
//             </Modal.Header>
//             <Modal.Body>
//                 <div className="form-group">
//                     <label htmlFor="rating">Rating:</label>
//                     <input
//                         type="number"
//                         className="form-control"
//                         id="rating"
//                         min="1"
//                         max="5"
//                         value={rating}
//                         onChange={(e) => setRating(e.target.value)}
//                     />
//                 </div>
//                 <div className="form-group">
//                     <label htmlFor="comment">Comment:</label>
//                     <textarea
//                         className="form-control"
//                         id="comment"
//                         value={comment}
//                         onChange={(e) => setComment(e.target.value)}
//                     />
//                 </div>
//             </Modal.Body>
//             <Modal.Footer>
//                 <Button variant="secondary" onClick={handleFeedbackClose}>
//                     Close
//                 </Button>
//                 <Button variant="primary" onClick={handleSubmitFeedback}>
//                     Submit Feedback
//                 </Button>
//             </Modal.Footer>
//         </Modal>
//         </>
//     );
// };

// export default Profile;
import React, { useContext, useEffect, useState } from 'react';
import { getBookingsByUserId, getUser, getFeedbacksByUser } from '../utils/ApiFunctions';
import { useNavigate } from 'react-router-dom';
import moment from 'moment';
import { MyUserContext } from '../utils/MyContext';
import Feedback from '../common/Feedback'; // Import Feedback component
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

