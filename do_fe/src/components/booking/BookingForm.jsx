import React, { useEffect, useContext } from "react"
import moment from "moment"
import { useState } from "react"
import { Form, FormControl, Button } from "react-bootstrap"
import BookingSummary from "./BookingSummary"
import { bookRoom, getRoomById } from "../utils/ApiFunctions"
import { useNavigate, useParams } from "react-router-dom"
import { useAuth } from "../auth/AuthProvider"
import { MyUserContext } from '../utils/MyContext';

const BookingForm = () => {
	const [validated, setValidated] = useState(false)
	const [isSubmitted, setIsSubmitted] = useState(false)
	const [errorMessage, setErrorMessage] = useState("")
	const [roomPrice, setRoomPrice] = useState(0)
	const user = useContext(MyUserContext);
// const currentUser = localStorage.getItem("userId")

	const [booking, setBooking] = useState({
		guestFirstName: user.first_name,
		guestLasttName: user.last_name,
		guestEmail: user.username,
		checkInDate: "",
		checkOutDate: "",
		numOfAdults: "",
		numOfChildren: ""
	})

	const { roomId } = useParams()
	const navigate = useNavigate()

	const handleInputChange = (e) => {
		const { name, value } = e.target
		setBooking({ ...booking, [name]: value })
		setErrorMessage("")
	}


	const getRoomPriceById = async (roomId) => {
		try {
			const response = await getRoomById(roomId)
			setRoomPrice(response.price)
		} catch (error) {
			throw new Error(error)
		}
	}

	useEffect(() => {
		getRoomPriceById(roomId)
	}, [roomId])

	const calculatePayment = () => {
		const checkInDate = moment(booking.checkInDate)
		const checkOutDate = moment(booking.checkOutDate)
		const diffInDays = checkOutDate.diff(checkInDate, "days")
		const paymentPerDay = roomPrice ? roomPrice : 0
		return diffInDays * paymentPerDay
	}

	const isGuestCountValid = () => {
		const adultCount = parseInt(booking.numOfAdults)
		const childrenCount = parseInt(booking.numOfChildren)
		const totalCount = adultCount + childrenCount
		return totalCount >= 1 && adultCount >= 1
	}

	const isCheckOutDateValid = () => {
		if (!moment(booking.checkOutDate).isSameOrAfter(moment(booking.checkInDate))) {
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
	}

	const handleFormSubmit = async () => {
		try {
			const confirmationCode = await bookRoom(roomId, booking)
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
							<h4 className="card-title">Reserve Room</h4>

							<Form noValidate validated={validated} onSubmit={handleSubmit}>
								<Form.Group>
									<Form.Label htmlFor="guestFullName" className="hotel-color">
										FirstName
									</Form.Label>
									<FormControl
										required
										type="text"
										id="guestFullName"
										name="guestFullName"
										value={booking.guestFirstName}
										placeholder="Enter your fullname"
										onChange={handleInputChange}
									/>
									<Form.Control.Feedback type="invalid">
										Please enter your firstname.
									</Form.Control.Feedback>
								</Form.Group>
								<Form.Group>
									<Form.Label htmlFor="guestFullName" className="hotel-color">
										LastName
									</Form.Label>
									<FormControl
										required
										type="text"
										id="guestFullName"
										name="guestFullName"
										value={booking.guestLasttName}
										placeholder="Enter your fullname"
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
										value={booking.guestEmail}
										placeholder="Enter your email"
										onChange={handleInputChange}
										// disabled
									/>
									<Form.Control.Feedback type="invalid">
										Please enter a valid email address.
									</Form.Control.Feedback>
								</Form.Group>

								<fieldset style={{ border: "2px" }}>
									<legend>Lodging Period</legend>
									<div className="row">
										<div className="col-6">
											<Form.Label htmlFor="checkInDate" className="hotel-color">
												Check-in date
											</Form.Label>
											<FormControl
												required
												type="date"
												id="checkInDate"
												name="checkInDate"
												value={booking.checkInDate}
												placeholder="check-in-date"
												min={moment().format("MMM Do, YYYY")}
												onChange={handleInputChange}
											/>
											<Form.Control.Feedback type="invalid">
												Please select a check in date.
											</Form.Control.Feedback>
										</div>

										<div className="col-6">
											<Form.Label htmlFor="checkOutDate" className="hotel-color">
												Check-out date
											</Form.Label>
											<FormControl
												required
												type="date"
												id="checkOutDate"
												name="checkOutDate"
												value={booking.checkOutDate}
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