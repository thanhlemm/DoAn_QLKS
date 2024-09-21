import React, { useState } from "react"
import moment from "moment"
import { cancelBooking, getBookingByConfirmationCode, endpoints, authAPI, getRoomById, api } from "../utils/ApiFunctions"

const FindBooking = () => {
	const [confirmationCode, setConfirmationCode] = useState("")
	const [error, setError] = useState(null)
	const [successMessage, setSuccessMessage] = useState("")
	const [isLoading, setIsLoading] = useState(false)
	const [roomType, setRoomType] = useState("")
	const [room, setRoom] = useState("")

	const [bookingInfo, setBookingInfo] = useState({
		id: "",
		confirmationCode: "",
		room: "",
		room_type: "",
		check_in_date: "",
		check_out_date: "",
		email: "",
	})

	const emptyBookingInfo = {
		id: "",
		bookingConfirmationCode: "",
		room: { id: "", roomType: "" },
		roomNumber: "",
		checkInDate: "",
		checkOutDate: "",
		guestName: "",
		guestEmail: "",
		numOfAdults: "",
		numOfChildren: "",
		totalNumOfGuests: ""
	}
	const [isDeleted, setIsDeleted] = useState(false)

	const handleInputChange = (event) => {
		setConfirmationCode(event.target.value)
	}

	const handleFormSubmit = async (event) => {
		event.preventDefault();
		setIsLoading(true);
	
		try {
			const data = await getBookingByConfirmationCode(confirmationCode);	
			// Check if the booking is active
			if (!data.is_active) {
				setError('Booking not found or is cancelled.');
				setBookingInfo(emptyBookingInfo);
				setRoom([]);
			} else {
				setBookingInfo(data);
				setError(null);
	
				const rt = await authAPI().get(endpoints.roomtypeById(data.room_type));
				setRoomType(rt.data);
	
				const roomIds = Array.isArray(data.room) ? data.room : [data.room];
	
				const fetchRooms = async (roomIds) => {
					const rooms = await Promise.all(roomIds.map(async id => {
						const response = await getRoomById(id);
						return response;
					}));
					return rooms;
				};
	
				const roomsData = await fetchRooms(roomIds);
				setRoom(roomsData);
			}
		} catch (error) {
			setBookingInfo(emptyBookingInfo);
			if (error.response && error.response.status === 404) {
				setError('Booking not found.');
			} else {
				setError(error.message);
			}
		}
	
		setTimeout(() => setIsLoading(false), 2000);
	}
	

	const handleBookingCancellation = async (bookingId) => {
		try {
			const booking = await api.get(`/hotel/booking/${bookingId}/`); 
			const currentDate = new Date();
			const checkInDate = new Date(booking.data.check_in_date);
			const timeDiff = checkInDate - currentDate;
			const daysDiff = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
		
			if (daysDiff < 2) {
				alert('Bạn không thể hủy booking trong vòng 2 ngày trước khi check-in!! Nếu muốn huỷ hãy gọi cho lễ tân');
				return;
			}else{
				await cancelBooking(bookingId)
			}
			
			setIsDeleted(true)
			setSuccessMessage("Booking has been cancelled successfully!")
			setBookingInfo(emptyBookingInfo)
			setConfirmationCode("")
			setError(null)
		} catch (error) {
			setError(error.message)
		}
		setTimeout(() => {
			setSuccessMessage("")
			setIsDeleted(false)
		}, 2000)
	}

	return (
		<>
			<div className="container mt-5 d-flex flex-column justify-content-center align-items-center">
				<h2 className="text-center mb-4">Find My Booking</h2>
				<form onSubmit={handleFormSubmit} className="col-md-6">
					<div className="input-group mb-3">
						<input
							className="form-control"
							type="text"
							id="confirmationCode"
							name="confirmationCode"
							value={confirmationCode}
							onChange={handleInputChange}
							placeholder="Enter the booking confirmation code"
						/>

						<button type="submit" className="btn btn-hotel input-group-text">
							Find booking
						</button>
					</div>
				</form>

				{isLoading ? (
					<div>Finding your booking...</div>
				) : error ? (
					<div className="text-danger">Error: {error}</div>
				) : bookingInfo.confirmationCode ? (
					<div className="col-md-6 mt-4 mb-5">
						<h3>Booking Information</h3>
						<p className="text-success">Confirmation Code: {bookingInfo.confirmationCode}</p>
						{Array.isArray(room) && room.length > 0 && room.map((roomDetail, index) => (
							<div key={index}>
								<p>Room {index + 1} Number: {roomDetail.room_number}</p>
							</div>
						))}
						<p>Room Type: {roomType.type}</p>

						<p>
							Check-in Date:{" "}
							{moment(bookingInfo.check_in_date).subtract(1, "month").format("MMM Do, YYYY")}
						</p>
						<p>
							Check-out Date:{" "}
							{moment(bookingInfo.check_out_date).subtract(1, "month").format("MMM Do, YYYY")}
						</p>
						{/* <p>Full Name: {bookingInfo.guestName}</p> */}
						<p>Email Address: {bookingInfo.email}</p>

						{!isDeleted && (
							<button
								onClick={() => handleBookingCancellation(bookingInfo.id)}
								className="btn btn-danger">
								Cancel Booking
							</button>
						)}
					</div>
				) : (
					<div>find booking...</div>
				)}

				{isDeleted && <div className="alert alert-success mt-3 fade show">{successMessage}</div>}
			</div>
		</>
	)
}

export default FindBooking