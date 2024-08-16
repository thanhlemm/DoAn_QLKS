import React, { useState } from "react"
import { Form, Button, Row, Col, Container } from "react-bootstrap"
import moment from "moment"
import { checkRoomAvailability, getRoomTypesByBranchId } from "../utils/ApiFunctions"//  getAvailableRooms,
import RoomSearchResults from "./RoomSearchResult"
import RoomTypeSelector from "./RoomTypeSelector"
import BranchTypeSelector from "./BranchTypeSelector"

const RoomSearch = () => {
	const [searchQuery, setSearchQuery] = useState({
		branch: "",
		checkInDate: "",
		checkOutDate: "",
		roomType: ""
	})

	const [errorMessage, setErrorMessage] = useState("")
	const [availableRooms, setAvailableRooms] = useState([])
	const [isLoading, setIsLoading] = useState(false)
	const [roomTypes, setRoomTypes] = useState([]) // State để lưu trữ room types

	const handleSearch = (e) => {
		e.preventDefault()
		const checkInMoment = moment(searchQuery.checkInDate)
		const checkOutMoment = moment(searchQuery.checkOutDate)
		if (!checkInMoment.isValid() || !checkOutMoment.isValid()) {
			setErrorMessage("Please enter valid dates")
			return
		}
		if (!checkOutMoment.isSameOrAfter(checkInMoment)) {
			setErrorMessage("Check-out date must be after check-in date")
			return
		}
		setIsLoading(true)
		console.log(searchQuery.branch)
		console.log(searchQuery.roomType)
		console.log(searchQuery.checkInDate)
		console.log(searchQuery.checkOutDate)
		checkRoomAvailability(searchQuery.branch, searchQuery.roomType ,searchQuery.checkInDate, searchQuery.checkOutDate)
			.then((response) => {
				
				setAvailableRooms(response.available_rooms)
				console.log(availableRooms.available_rooms)
				setTimeout(() => setIsLoading(false), 2000)
			})
			.catch((error) => {
				console.log(error)
			})
			.finally(() => {
				setIsLoading(false)
			})
	}

	// const handleBranchChange = (branch) => {
	// 	setSearchQuery({ ...searchQuery, branch })
	// 	console.log(searchQuery)
	// 	getRoomTypesByBranchId(branch.id) // Gọi API để lấy room types theo branch
	// 		.then((roomTypes) => {
	// 			setRoomTypes(roomTypes) // Cập nhật room types vào state
	// 			setSearchQuery({ ...searchQuery, roomType: "" }) // Reset roomType khi thay đổi chi nhánh
	// 		})
	// 		.catch((error) => {
	// 			console.log(error)
	// 		})
	// }

	const handleInputChange = (e) => {
		const { name, value } = e.target
		setSearchQuery({ ...searchQuery, [name]: value })
		const checkInDate = moment(searchQuery.checkInDate)
		const checkOutDate = moment(searchQuery.checkOutDate)
		if (checkInDate.isValid() && checkOutDate.isValid()) {
			setErrorMessage("")
		}
	}
	const handleClearSearch = () => {
		setSearchQuery({
			branch: "",
			checkInDate: "",
			checkOutDate: "",
			roomType: ""
		})
		setAvailableRooms([])
	}

	return (
		<>
			<Container className="shadow mt-n5 mb-5 py-5 overlay-filter">
				<Form onSubmit={handleSearch}>
					<Row className="justify-content-center">
						<Col xs={12} md={3}>
							<Form.Group controlId="branch">
								<Form.Label>Branch</Form.Label>
								
									<BranchTypeSelector
										handleBranchInputChange={handleInputChange}//handleBranchChange
										newBranch={searchQuery}
									/>
							</Form.Group>
						</Col>
						<Col xs={12} md={3}>
							<Form.Group controlId="checkInDate">
								<Form.Label>Check-in Date</Form.Label>
								<Form.Control
									type="date"
									name="checkInDate"
									value={searchQuery.checkInDate}
									onChange={handleInputChange}
									min={moment().format("YYYY-MM-DD")}
								/>
							</Form.Group>
						</Col>
						<Col xs={12} md={3}>
							<Form.Group controlId="checkOutDate">
								<Form.Label>Check-out Date</Form.Label>
								<Form.Control
									type="date"
									name="checkOutDate"
									value={searchQuery.checkOutDate}
									onChange={handleInputChange}
									min={moment().format("YYYY-MM-DD")}
								/>
							</Form.Group>
						</Col>
						<Col xs={12} md={3}>
							<Form.Group controlId="roomType">
								<Form.Label>Room Type</Form.Label>
								<div className="d-flex">
									<RoomTypeSelector
										roomTypes={roomTypes}
										handleRoomInputChange={handleInputChange}
										newRoom={searchQuery}
									/>
									<Button variant="secondary" type="submit" className="ml-2">
										Search
									</Button>
								</div>
							</Form.Group>
						</Col>
					</Row>
				</Form>

				{isLoading ? (
					<p className="mt-4">Finding availble rooms....</p>
				) : availableRooms ? (
					<RoomSearchResults results={availableRooms} onClearSearch={handleClearSearch} />
				) : (
					<p className="mt-4">No rooms available for the selected dates and room type.</p>
				)}
				{errorMessage && <p className="text-danger">{errorMessage}</p>}
			</Container>
		</>
	)
}

export default RoomSearch