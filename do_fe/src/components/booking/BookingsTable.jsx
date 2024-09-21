import React, { useState, useEffect } from "react";
import { parseISO } from "date-fns";
import DateSlider from "../common/DateSlider";
import { getUser, getRoomById, getAllBookings, endpoints, api } from '../utils/ApiFunctions';
import InvoiceModal from "../receptionist/InvoiceModal"
import Cookies from 'react-cookies';


const BookingsTable = ({ bookingInfo, handleBookingCancellation }) => {
    const [filteredBookings, setFilteredBookings] = useState(bookingInfo);
    const [userNames, setUserNames] = useState({});
    const [room, setRoom] = useState({});
    const [error, setError] = useState("");
    const [showInvoiceModal, setShowInvoiceModal] = useState(false);
    const [selectedBooking, setSelectedBooking] = useState(null);
    const csrftoken = Cookies.load('token');


    const filterBookings = (startDate, endDate) => {
        let filtered = bookingInfo;
        if (startDate && endDate) {
            filtered = bookingInfo.filter((booking) => {
                const bookingStartDate = parseISO(booking.check_in_date);
                const bookingEndDate = parseISO(booking.check_out_date);
                return (
                    bookingStartDate >= startDate &&
                    bookingEndDate <= endDate &&
                    bookingEndDate > startDate
                );
            });
        }
        setFilteredBookings(filtered);
    };

    useEffect(() => {
        setFilteredBookings(bookingInfo);
        const fetchUserNamesAndRooms = async () => {
            const userNamesMap = {};
            const roomNumbersMap = {};

            for (const booking of bookingInfo) {
                if (!userNamesMap[booking.user]) {
                    const response = await getUser(booking.user);
                    userNamesMap[booking.user] = response.last_name;
                }

                if (Array.isArray(booking.room)) {
                    for (const roomId of booking.room) {
                        if (!roomNumbersMap[roomId]) {
                            const roomResponse = await getRoomById(roomId);
                            roomNumbersMap[roomId] = roomResponse.room_number;
                        }
                    }
                } else {
                    if (!roomNumbersMap[booking.room]) {
                        const roomResponse = await getRoomById(booking.room);
                        roomNumbersMap[booking.room] = roomResponse.room_number;
                    }
                }
            }

            setUserNames(userNamesMap);
            setRoom(roomNumbersMap);
        };

        fetchUserNamesAndRooms();
    }, [bookingInfo]);

    const getGuestName = (user) => userNames[user] || 'Loading...';
    const getRoom = (roomId) => room[roomId] || 'Loading...';

    const handleCheckIn = async (bookingId) => {
        try {
            const booking = await api.post(endpoints.check_in(bookingId));
            const currentDate = new Date();
            const checkInDate = new Date(booking.data.check_in_date);

            if (booking.data.is_active===false) {
                alert('Booking đã bị hủy và không thể check-in.');
                return;
            }

            else if (checkInDate > currentDate) {
                alert('Chưa đến ngày check-in.');
                return;
            }

             else if (booking.data.checked_in) {
                alert('Booking đã được check-in trước đó.');
                return;
            }
            else{
                const data = await api.get('/hotel/booking/checked-out/');
                const activeBookings = data.data;
                setFilteredBookings(activeBookings);
            }
        } catch (error) {
            console.error('Error checking in:', error);
        }
    };

    const handleCheckOut = async (bookingId) => {
        try {
            const booking = await api.get(`/hotel/booking/${bookingId}/`); 
            if (booking.data.payment_status === 'unpaid') {
                setShowInvoiceModal(true);
                setSelectedBooking(booking.data); 
            } else {
                const check = await api.post(endpoints.check_out(bookingId));
                console.log(check)
                if (check.status === 200){
                    alert("Check out thành công")
                }
                const data = await api.get('/hotel/booking/checked-out/');
                const activeBookings = data.data;
                setFilteredBookings(activeBookings);
            }
        } catch (error) {
            console.error('Error checking out:', error);
        }
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
                    'X-CSRFToken': csrftoken
                }
            });
           
            if (response.status === 200) {
                alert("Cập nhật trạng thái thanh toán thành công")
                // Cập nhật danh sách booking sau khi thanh toán thành công
                await api.post(endpoints.check_out(bookingId));
                const data = await api.get('/hotel/booking/checked-out/');
                const activeBookings = data.data;
                setFilteredBookings(activeBookings);
                setShowInvoiceModal(false);
            }
        } catch (error) {
            setError(error.message);
        }
    };

    return (
        <section className="bookings-table-container">
            <DateSlider onDateChange={filterBookings} onFilterChange={filterBookings} />
            <div className="table-responsive">
                <table className="w-full border-collapse bg-neutral-50 shadow-md rounded-lg overflow-hidden" style={{borderRadius: "24px"}}>
                    <thead>
                        <tr className="bg-neutral-100 border-b border-neutral-300">
                            <th className="p-4 text-center">S/N</th>
                            <th className="p-4 text-center">Booking ID</th>
                            <th className="p-4 text-center">Room Number</th>
                            <th className="p-4 text-center">Room Type</th>
                            <th className="p-4 text-center">Check-In Date</th>
                            <th className="p-4 text-center">Check-Out Date</th>
                            <th className="p-4 text-center">Guest Name</th>
                            <th className="p-4 text-center">Guest Email</th>
                            <th className="p-4 text-center">Confirmation Code</th>
                            <th className="p-4 text-center">Payment Status</th>
                            <th className="p-4 text-center">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredBookings.map((booking, index) => (
                            <tr key={booking.id} className="border-b border-neutral-300 hover:bg-neutral-100">
                                <td>{index + 1}</td>
                                <td>{booking.id}</td>
                                <td>{Array.isArray(booking.room) ? booking.room.map(id => getRoom(id)).join(', ') : getRoom(booking.room)}</td>
                                <td>{booking.room_type}</td>
                                <td>{booking.check_in_date}</td>
                                <td>{booking.check_out_date}</td>
                                <td>{getGuestName(booking.user)}</td>
                                <td>{booking.email}</td>
                                <td>{booking.confirmationCode}</td>
                                <td>{booking.payment_status}</td>

                                <td className="gap-2">
                                    <button
                                        className="btn btn-sm mb-2"
                                        onClick={() => handleBookingCancellation(booking.id)}
                                    >
                                        Cancel
                                    </button>
                                    {booking.checked_in ? (
                                        <button
                                            className="btn btn-sm ml-2"
                                            onClick={() => handleCheckOut(booking.id)}
                                        >
                                            Check-Out
                                        </button>
                                    ) : (
                                        <button
                                            className="btn btn-sm ml-2"
                                            onClick={() => handleCheckIn(booking.id)}
                                        >
                                            Check-In
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {filteredBookings.length === 0 && (
                    <p className="no-booking-message">No bookings found for the selected dates</p>
                )}
            </div>
            <InvoiceModal
                show={showInvoiceModal}
                onHide={() => setShowInvoiceModal(false)}
                booking={selectedBooking} 
                onConfirmPayment={confirmPayment} 
            />
        </section>
        
    );
};

export default BookingsTable;
