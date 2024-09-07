import React, { useState, useEffect } from "react"
import { cancelBooking, getAllBookings } from "../utils/ApiFunctions"
import Header from "../common/Header"
import BookingsTable from "./BookingsTable"

const Bookings = () => {
	const [bookingInfo, setBookingInfo] = useState([])
	const [isLoading, setIsLoading] = useState(true)
	const [error, setError] = useState("")

	useEffect(() => {
        const fetchBookings = async () => {
            try {
                const data = await getAllBookings();
                // Lọc dữ liệu để chỉ lấy booking còn hoạt động
                const activeBookings = data.filter(booking => booking.is_active);
                setBookingInfo(activeBookings);
                setIsLoading(false);
            } catch (error) {
                setError(error.message);
                setIsLoading(false);
            }
        };

        fetchBookings();
    }, []);

	const handleBookingCancellation = async (bookingId) => {
		try {
			await cancelBooking(bookingId)
			const data = await getAllBookings()
			const activeBookings = data.filter(booking => booking.is_active);
			setBookingInfo(activeBookings)
		} catch (error) {
			setError(error.message)
		}
	}

	return (
		<section style={{ backgroundColor: "whitesmoke" }}>
			<div className="d-flex justify-content-between mb-3 mt-5">
              <h2>Existing Bookings</h2>
            </div>
			{error && <div className="text-danger">{error}</div>}
			{isLoading ? (
				<div>Loading existing bookings</div>
			) : (
				<BookingsTable
					bookingInfo={bookingInfo}
					handleBookingCancellation={handleBookingCancellation}
				/>
			)}
		</section>
	)
}

export default Bookings