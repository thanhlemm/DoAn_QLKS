import React, { useContext, useState, useEffect } from "react"
import { cancelBooking, getAllBookings, api, getBookingById } from "../utils/ApiFunctions"
import Header from "../common/Header"
import BookingsTable from "./BookingsTable"
import { MyUserContext } from '../utils/MyContext';


const Bookings = () => {
	const [bookingInfo, setBookingInfo] = useState([])
	const [isLoading, setIsLoading] = useState(true)
	const [error, setError] = useState("")
	const user = useContext(MyUserContext);


	useEffect(() => {
        const fetchBookings = async () => {
            try {
                const data = await getAllBookings();
                // Lọc dữ liệu để chỉ lấy booking còn hoạt động
                const activeBookings = data.filter(booking => booking.is_active);
				console.log(activeBookings)
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
			const booking = await api.get(`/hotel/booking/${bookingId}/`); 
            const userId = booking.data.user;
			console.log(booking)
			const response = await cancelBooking(bookingId)
			console.log(response)
			if(response.success === true){
				await api.post('/hotel/notification/', {
					user: userId,
					booking: bookingId,  
					type: 'Booking Cancelled'
					});
			}
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