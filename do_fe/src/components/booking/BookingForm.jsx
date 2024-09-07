import React, { useEffect, useContext } from "react"
import moment from "moment"
import { useState } from "react"
import { Form, FormControl, Button } from "react-bootstrap"
import BookingSummary from "./BookingSummary"
import { bookRoom, getRoomById, api, endpoints } from "../utils/ApiFunctions"
import { useNavigate, useParams } from "react-router-dom"
import { MyUserContext } from '../utils/MyContext';

const BookingForm = () => {
	const [validated, setValidated] = useState(false)
	const [isSubmitted, setIsSubmitted] = useState(false)
	const [errorMessage, setErrorMessage] = useState("")
	const [roomPrice, setRoomPrice] = useState(0)
	const [isLoading, setIsLoading] = useState(true)
	const [roomInfo, setRoomInfo] = useState({});
	const [roomsInfo, setRoomsInfo] = useState([]);

	const user = useContext(MyUserContext);

	const [booking, setBooking] = useState({
		user: user.id,
		email: user.email,
		phone: "",
		branch:"",
		room_type:"",
		room:[],
		check_in_date: "",
		check_out_date: "",
	})

	const { roomId } = useParams()
	const navigate = useNavigate()

	const handleInputChange = (e) => {
		const { name, value } = e.target
		if (name === 'room') {
			// Handle room as an array
			setBooking({ ...booking, room: [value] }) // Push the roomId to the array
		} else {
			setBooking({ ...booking, [name]: value })
		}		setErrorMessage("")

		setBooking(prevState => ({
			...prevState,
			[name]: value, // This will correctly update booking.phone when name is "phone"
		  }));
	}


	// const getRoomPriceById = async (roomId) => {
	// 	try {
	// 		const response = await getRoomById(roomId)
	// 		setRoomPrice(response.price)
	// 	} catch (error) {
	// 		throw new Error(error)
	// 	}
	// }

	useEffect(() => {
		const fetchRoomData = async () => {
			try {
					const selectionData = JSON.parse(localStorage.getItem(`selection_data_${user.id}`) || '{}');
					const roomIds = Object.keys(selectionData).filter(key => !isNaN(key)).map(key => parseInt(key));
					const roomPromises = roomIds.map(id => getRoomById(id));
					const rooms = await Promise.all(roomPromises);
					setRoomsInfo(rooms);
					if (roomId) {
						const response = await getRoomById(roomId);
						setRoomPrice(response.price);
						setRoomInfo(response);

						const roomTypeId = response.room_type.id;
						const branchId = response.branch.id;
			
						setBooking(prevState => ({
							...prevState,
							room_type: roomTypeId, 
							branch: branchId,      
							room: [roomId]         
						}));
					}else{
						// setBooking(prevState => ({
						// 	...prevState,
						// 	room: roomIds,
						// 	room_type: rooms[0]?.room_type.id, // Giả định là lấy room_type từ phòng đầu tiên
						// 	branch: rooms[0]?.branch.id // Giả định là lấy branch từ phòng đầu tiên
						// }));
						// Kiểm tra tính đồng nhất của room_type và branch
						const allSameRoomType = rooms.every(room => room.room_type.id === rooms[0].room_type.id);
						const allSameBranch = rooms.every(room => room.branch.id === rooms[0].branch.id);

						if (allSameRoomType && allSameBranch) {
							// Nếu tất cả các phòng đều có cùng room_type và branch
							const firstRoomPrice = rooms[0]?.price || 0;
							setRoomPrice(firstRoomPrice);

							setBooking(prevState => ({
								...prevState,
								room: roomIds,
								room_type: rooms[0]?.room_type.id,
								branch: rooms[0]?.branch.id
							}));
						} else {
							// Nếu các phòng có room_type hoặc branch khác nhau, hiển thị lỗi
							setErrorMessage("Rooms have different room types or branches. Please select rooms from the same room type and branch.");
						}
					}
					setIsLoading(false);
			} catch (error) {
				setErrorMessage(error);
				setIsLoading(false);
			}
		};
	
		fetchRoomData();
	}, [roomId])

	const calculatePayment = () => {
		const checkInDate = moment(booking.check_in_date)
		const checkOutDate = moment(booking.check_out_date)
		const diffInDays = checkOutDate.diff(checkInDate, "days")
		const paymentPerDay = roomPrice ? roomPrice : 0
		return diffInDays * paymentPerDay
	}

	const isCheckOutDateValid = () => {
		if (!moment(booking.check_out_date).isSameOrAfter(moment(booking.check_in_date))) {
			setErrorMessage("Check-out date must be after check-in date")
			return false
		} else {
			setErrorMessage("")
			return true
		}
	}
	

	const handleSubmit = (e) => {

		e.preventDefault()
		const form = e.currentTarget
		if (form.checkValidity() === false || !isCheckOutDateValid()) {
			e.stopPropagation()
		} else {
			setIsSubmitted(true)
		}
		setValidated(true)
		console.log(booking)
	}

	const handleFormSubmit = async () => {
		console.log(booking)
		try {
			const confirmationCode = await bookRoom(booking)
			console.log(confirmationCode)
			// Tạo dữ liệu email
			const emailData = {
				subject: 'Booking Confirmation',
				message: `Your booking is confirmed. Your confirmation code is ${confirmationCode.confirmationCode}`,

				recipient: booking.email,
			  };
			  console.log(emailData)
			  // Gửi email xác nhận
			  await api.post(endpoints['send_email'], emailData);
			setIsSubmitted(true)
			navigate("/booking-success", { state: { message: confirmationCode } })
		} catch (error) {
			const errorMessage = error.message
			console.log(errorMessage)
			navigate("/booking-success", { state: { error: errorMessage } })
		}
	}

	return (
		<>
			<div className="container mb-5">
				<div className="row">
					<div className="col-md-6">
						<div className="card card-body mt-5">
							<h4 className="card-title">Booking</h4>

							<Form noValidate validated={validated} onSubmit={handleSubmit}>
								<Form.Group>
									<Form.Label htmlFor="guestFirstName" className="hotel-color">
										FirstName
									</Form.Label>
									<FormControl
										required
										type="text"
										id="guestFirstName"
										name="guestFirstName"
										value={user.first_name}
										placeholder="Enter your fullname"
										onChange={handleInputChange}
									/>
									<Form.Control.Feedback type="invalid">
										Please enter your firstname.
									</Form.Control.Feedback>
								</Form.Group>
								<Form.Group>
									<Form.Label htmlFor="guestLasttName" className="hotel-color">
										LastName
									</Form.Label>
									<FormControl
										required
										type="text"
										id="guestLasttName"
										name="guestLasttName"
										value={user.last_name}
										placeholder="Enter your lastname"
										onChange={handleInputChange}
									/>
									<Form.Control.Feedback type="invalid">
										Please enter your lastname.
									</Form.Control.Feedback>
								</Form.Group>


								<Form.Group>
									<Form.Label htmlFor="guestEmail" className="hotel-color">
										Email
									</Form.Label>
									<FormControl
										required
										type="email"
										id="guestEmail"
										name="guestEmail"
										value={booking.email}
										placeholder="Enter your email"
										onChange={handleInputChange}
										// disabled
									/>
									<Form.Control.Feedback type="invalid">
										Please enter a valid email address.
									</Form.Control.Feedback>
								</Form.Group>
								<Form.Group>
									<Form.Label htmlFor="guestPhone" className="hotel-color">
										Phone
									</Form.Label>
									<FormControl
										required
										type="text"
										id="guestPhone"
										name="phone"
										value={booking.phone}
										placeholder="Enter your phone number"
										onChange={handleInputChange}
									/>
									<Form.Control.Feedback type="invalid">
										Please enter your phonennumber.
									</Form.Control.Feedback>
								</Form.Group>

								<fieldset style={{ border: "2px" }}>
									<legend>Time</legend>
									<div className="row">
										<div className="col-6">
											<Form.Label htmlFor="check_in_date" className="hotel-color">
												Check-in date
											</Form.Label>
											<FormControl
												required
												type="date"
												id="check_in_date"
												name="check_in_date"
												value={booking.check_in_date}
												placeholder="check-in-date"
												min={moment().format("MMM Do, YYYY")}
												onChange={handleInputChange}
											/>
											<Form.Control.Feedback type="invalid">
												Please select a check in date.
											</Form.Control.Feedback>
										</div>

										<div className="col-6">
											<Form.Label htmlFor="check_out_date" className="hotel-color">
												Check-out date
											</Form.Label>
											<FormControl
												required
												type="date"
												id="check_out_date"
												name="check_out_date"
												value={booking.check_out_date}
												placeholder="check-out-date"
												min={moment().format("MMM Do, YYYY")}
												onChange={handleInputChange}
											/>
											<Form.Control.Feedback type="invalid">
												Please select a check out date.
											</Form.Control.Feedback>
										</div>
										{errorMessage && <p className="error-message text-danger">{errorMessage}</p>}
									</div>
								</fieldset>

								<div className="fom-group mt-2 mb-2">
									<button type="submit" className="btn btn-hotel">
										Continue
									</button>
								</div>
							</Form>
						</div>
					</div>

					<div className="col-md-4">
						{isSubmitted && (
							<BookingSummary
								booking={booking}
								payment={calculatePayment()}
								onConfirm={handleFormSubmit}
								isFormValid={validated}
							/>
						)}
					</div>
				</div>
			</div>
		</>
	)
}
export default BookingForm