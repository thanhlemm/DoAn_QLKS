import React, { useState, useEffect } from "react";
import InvoiceModal from "./InvoiceModal";
import { api } from '../utils/ApiFunctions';

const BookingPayment_Receptionist = () => {
    const [bookingInfo, setBookingInfo] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState("");
    const [showInvoiceModal, setShowInvoiceModal] = useState(false);
    const [selectedBooking, setSelectedBooking] = useState(null);

    useEffect(() => {
        const fetchBookings = async () => {
            try {
                const data = await api.get('/hotel/booking/checked-out-unpaid/');
                const checkedOutBookings = data.data;
                setBookingInfo(checkedOutBookings);
                setIsLoading(false);
            } catch (error) {
                setError(error.message);
                setIsLoading(false);
            }
        };

        fetchBookings();
    }, []);

    const handlePayment = async (booking) => {
        setSelectedBooking(booking);
        setShowInvoiceModal(true);
    };

    const confirmPayment = async (bookingId) => {
        try {
            // Thực hiện thanh toán ở đây
            // const response = await api.post('/hotel/payment/', { booking: bookingId });
            const response = await api.post(`/hotel/booking/${bookingId}/change-status/`, {
                payment_status: "paid"
            }, {
                headers: {
                    'Content-Type': 'application/json',
                }
            });
            console.log(response)
            if (response.status === 200) {
                // Cập nhật danh sách booking sau khi thanh toán thành công
                const data = await api.get('/hotel/booking/checked-out-unpaid/');
                const checkedOutBookings = data.data;
                setBookingInfo(checkedOutBookings);
                setShowInvoiceModal(false);
            }
        } catch (error) {
            setError(error.message);
        }
    };
    


    return (
        <section style={{ backgroundColor: "whitesmoke" }}>
            <div className="d-flex justify-content-between mb-3 mt-5">
                <h2>Bookings Ready for Payment</h2>
            </div>
            {error && <div className="text-danger">{error}</div>}
            {isLoading ? (
                <div>Loading checked-out bookings...</div>
            ) : (
                <div className="table-responsive">
                    {/* <DateSlider onDateChange={filterBookings} onFilterChange={filterBookings} /> */}
                    <table className="table table-striped table-bordered">
                        <thead>
                            <tr>
                                <th>S/N</th>
                                <th>Booking ID</th>
                                <th>Room Number</th>
                                <th>Room Type</th>
                                <th>Check-In Date</th>
                                <th>Check-Out Date</th>
                                <th>Guest Name</th>
                                <th>Guest Email</th>
                                <th>Confirmation Code</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {bookingInfo.map((booking, index) => (
                                <tr key={booking.id}>
                                    <td>{index + 1}</td>
                                    <td>{booking.id}</td>
                                    <td>{Array.isArray(booking.room) ? booking.room.map(id =>id).join(', ') : booking.room}</td>
                                    <td>{booking.room_type}</td>
                                    <td>{booking.check_in_date}</td>
                                    <td>{booking.check_out_date}</td>
                                    <td>{booking.user}</td>
                                    <td>{booking.email}</td>
                                    <td>{booking.confirmationCode}</td>
                                    <td>
                                    <button
                                            className="btn btn-sm btn-primary"
                                            onClick={() => handlePayment(booking)}
                                        >
                                            Pay
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {bookingInfo.length === 0 && (
                        <p className="no-booking-message">No bookings ready for payment</p>
                    )}
                </div>
            )}
            <InvoiceModal
                show={showInvoiceModal}
                onHide={() => setShowInvoiceModal(false)}
                booking={selectedBooking}
                onConfirmPayment={confirmPayment}
            />
        </section>
    );
};

export default BookingPayment_Receptionist;
