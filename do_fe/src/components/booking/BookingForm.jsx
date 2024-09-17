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
	const [couponCode, setCouponCode] = useState(""); 

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
		before_discount: 0,
		total: 0,
		saved: 0,
		total_days: 0,
		payment_status: "unpaid"
	})

	const { roomId } = useParams()
	const navigate = useNavigate()

	
	const handleInputChange = (e) => {
		const { name, value } = e.target;
		if (name === 'room') {
			setBooking(prevState => ({
				...prevState,
				room: [value]
			}));
		} else {
			setBooking(prevState => ({
				...prevState,
				[name]: value
			}));
		}
		setErrorMessage("");
	}


	
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
						console.log(response)
						const roomTypeId = response.room_type.id;
						const branchId = response.branch.id;
						console.log(branchId)

						setBooking(prevState => ({
							...prevState,
							room_type: roomTypeId, 
							branch: branchId,      
							room: [roomId]         
						}));
					}else{
						
						const allSameRoomType = rooms.every(room => room.room_type.id === rooms[0].room_type.id);
						const allSameBranch = rooms.every(room => room.branch.id === rooms[0].branch.id);
						if (allSameRoomType && allSameBranch) {
							// Nếu tất cả các phòng đều có cùng room_type và branch
							const firstRoomPrice = rooms[0]?.price || 0;
							setRoomPrice(firstRoomPrice);

							setBooking(prevState => ({
								...prevState,
								room: roomIds,
								room_type: rooms[0]?.room_type,
								branch: rooms[0]?.branch
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
	
		useEffect(() => {
			fetchRoomData();
		},[roomId, user.id]);
	useEffect(() => {
		calculatePayment();
	}, [booking.saved, booking.before_discount, booking.check_in_date, booking.check_out_date, roomPrice]);	
	

	const isCheckOutDateValid = () => {
		if (!moment(booking.check_out_date).isSameOrAfter(moment(booking.check_in_date))) {
			setErrorMessage("Check-out date must be after check-in date")
			return false
		} else {
			setErrorMessage("")
			return true
		}
	}
	
	const handleSubmit = async (e) => {
		e.preventDefault();
		const form = e.currentTarget;
	
		if (form.checkValidity() === false || !isCheckOutDateValid()) {
			e.stopPropagation();
		} else {
			try {
				await fetchRoomData();
				const beforeDiscount = calculatePayment();
				setBooking(prevState => ({
					...prevState,
					branch: booking.branch,
                	room_type: booking.room_type,
					before_discount: beforeDiscount,
				}));
	
				const updatedBooking = { ...booking, before_discount: beforeDiscount };
				let discountAmount = 0;
	
				if (couponCode) {
					try {
						const discountResponse = await api.post(endpoints.verify_coupon, { code: couponCode });
						const discountData = discountResponse.data;
				   
						discountAmount = discountData.type === 'percentage'
							? (beforeDiscount * discountData.discount) / 100
							: discountData.discount;
					} catch (error) {
						setErrorMessage("Invalid coupon code.");
					}
				}
	
				const totalAmount = updatedBooking.before_discount - discountAmount;
	
				setBooking(prevState => ({
					...prevState,
					saved: discountAmount,
					total: totalAmount
				}));
	
				setIsSubmitted(true);
	
				// Proceed with booking confirmation
			} catch (error) {
				setErrorMessage(error.message);
			}
		}
	
		setValidated(true);
	}
	
	
	const calculatePayment = () => {
		const checkInDate = moment(booking.check_in_date);
		const checkOutDate = moment(booking.check_out_date);
		const diffInDays = checkOutDate.diff(checkInDate, "days");
		const paymentPerDay = roomPrice ? roomPrice : 0;
	
		const beforeDiscount = diffInDays * paymentPerDay;
	
		const saved = booking.saved || 0; 
		const total = beforeDiscount - saved;
	
		return total;
	}
	
	

	const handleFormSubmit = async () => {
		console.log(booking)
		try {

			const confirmationCode = await bookRoom(booking, couponCode)
			console.log(confirmationCode)
			// Tạo dữ liệu email
			const emailData = {
				subject: 'Booking Confirmation',
				message: `
					Dear Customer,
			
					Your booking has been successfully confirmed. Here are the details of your reservation:
			
					- **Confirmation Code:** ${confirmationCode.confirmationCode}
					- **Check-in Date:** ${confirmationCode.check_in_date}
					- **Check-out Date:** ${confirmationCode.check_out_date}
					- **Room Type:** ${confirmationCode.room_type} (Please specify if you have more details on room type)
					- **Total Payment:** $${confirmationCode.total}
					- **Discount Applied:** $${confirmationCode.before_discount - confirmationCode.total} (if applicable, else you can set it to 0)
					- **Phone Number:** ${confirmationCode.phone}
					- **Email:** ${confirmationCode.email}

					This is an unpaid booking. If you have already paid, please go to the front desk to show the receipt before checking in.
					If you have any questions or need further assistance, please contact us.
			
					Thank you for choosing our service.
			
					Best regards,
					[Your Company Name]
					[Contact Information]
				`,
				recipient: booking.email,
			};
			
			  // Gửi email xác nhận
			await api.post(endpoints['send_email'], emailData);

			// Tạo thông báo Booking Confirmed
			await api.post('/hotel/notification/', {
				user: user.id,
				booking: confirmationCode.id,  
				type: "Booking Confirmed"
			});
			setIsSubmitted(true)
			// navigate("/booking-success", { state: { message: confirmationCode } })
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
						<div className="card card-body mt-5 p-4">
							<h4 className="card-title">Booking</h4>

							<Form noValidate validated={validated} onSubmit={handleSubmit}>
								<Form.Group>
									<Form.Label htmlFor="guestFirstName" className="hotel-color">
										First Name
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
										Last Name
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
								<Form.Group>
									<Form.Label htmlFor="couponCode" className="hotel-color">
										Coupon Code
									</Form.Label>
									<FormControl
										type="text"
										id="couponCode"
										name="couponCode"
										value={couponCode}
										placeholder="Enter coupon code"
										onChange={(e) => setCouponCode(e.target.value)}
									/>
								</Form.Group>

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