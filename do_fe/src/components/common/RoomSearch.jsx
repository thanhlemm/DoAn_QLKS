import React, { useState } from "react"
import { useNavigate } from "react-router-dom"
import { Form, Button, Row, Col, Container } from "react-bootstrap"
import moment from "moment"
import { checkRoomAvailability } from "../utils/ApiFunctions"
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
    const [searchPerformed, setSearchPerformed] = useState(false) // Thêm biến trạng thái
    const navigate = useNavigate()

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
        setSearchPerformed(true) // Đặt searchPerformed thành true khi tìm kiếm được thực hiện
        setIsLoading(true)
        checkRoomAvailability(searchQuery.branch, searchQuery.roomType, searchQuery.checkInDate, searchQuery.checkOutDate)
            .then((response) => {
                setAvailableRooms(response.available_rooms)
                navigate("/", { state: { availableRooms: response.available_rooms } })  // Navigate to results page
                setTimeout(() => setIsLoading(false), 2000)
            })
            .catch((error) => {
                console.log(error)
            })
            .finally(() => {
                setIsLoading(false)
            })
    }

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
        setSearchPerformed(false) // Đặt searchPerformed thành false khi xóa tìm kiếm
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
                                    handleBranchInputChange={handleInputChange}
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
                                        roomTypes={[]} // Bạn có thể muốn load room types khi branch được chọn
                                        handleRoomInputChange={handleInputChange}
                                        branchId={searchQuery.branch}
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
                {isLoading && <p className="mt-4">Finding available rooms....</p>}
                {errorMessage && <p className="text-danger">{errorMessage}</p>}
                {/* {isLoading ? (
                    <p className="mt-4">Finding available rooms....</p>
                ) : searchPerformed && availableRooms.length === 0 ? (
                    <p className="mt-4">No rooms available for the selected dates and room type.</p>
                ) : (
                    availableRooms.length > 0 && <RoomSearchResults results={availableRooms} onClearSearch={handleClearSearch} />
                )}
                {errorMessage && <p className="text-danger">{errorMessage}</p>} */}
            </Container>
        </>
    )
}

export default RoomSearch
