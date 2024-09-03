import { parseISO } from "date-fns";
import React, { useState, useEffect } from "react";
import DateSlider from "../common/DateSlider";
import { getUser, getRoomById } from '../utils/ApiFunctions';


const BookingsTable = ({ bookingInfo, handleBookingCancellation }) => {
    const [filteredBookings, setFilteredBookings] = useState(bookingInfo);
    const [userNames, setUserNames] = useState({});
    const [room, setRoom] = useState("")

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
                // Fetch user name if not already fetched
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
    const getRoom= (roomId) => room[roomId] || 'Loading...';

    return (
        <section className="bookings-table-container">
            <DateSlider onDateChange={filterBookings} onFilterChange={filterBookings} />
            <div className="table-responsive">
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
                        {filteredBookings.map((booking, index) => (
                            <tr key={booking.id}>
                                <td>{index + 1}</td>
                                <td>{booking.id}</td>
                                <td>{Array.isArray(booking.room) ? booking.room.map(id => getRoom(id)).join(', ') : getRoom(booking.room)}</td>
                                <td>{booking.room_type}</td>
                                <td>{booking.check_in_date}</td>
                                <td>{booking.check_out_date}</td>
                                <td>{getGuestName(booking.user)}</td>
                                <td>{booking.email}</td>
                                <td>{booking.confirmationCode}</td>
                                <td>
                                    <button
                                        className="btn btn-danger btn-sm"
                                        onClick={() => handleBookingCancellation(booking.id)}
                                    >
                                        Cancel
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {filteredBookings.length === 0 && (
                    <p className="no-booking-message">No bookings found for the selected dates</p>
                )}
            </div>
        </section>
    );
};

export default BookingsTable;
