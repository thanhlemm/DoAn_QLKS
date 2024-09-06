import React, { useState, useEffect, useContext } from 'react';
import { Container, Row, Col, Card, Button, Form, FormControl } from 'react-bootstrap';
import { useLocation, useParams,useNavigate } from 'react-router-dom';
import Header from "../common/Header";
import { getRoomTypesByBranchId, checkRoomAvailability, bookRoom } from '../utils/ApiFunctions';
import { MyUserContext } from '../utils/MyContext';
import moment from "moment"
import BookingSummary from "../booking/BookingSummary"

const RoomSelection = () => {
  const location = useLocation();
  const { availableRooms, bookingDetails } = location.state || {};
  const { id } = useParams();
  const [rooms, setRooms] = useState(availableRooms || []);
  const [roomTypes, setRoomTypes] = useState([]);
  const user = useContext(MyUserContext);

  const [details, setDetails] = useState(bookingDetails || {
    checkin: '',
    checkout: '',
    roomType: '',
    branch_id: id,
    branch_name: '', 
  });
  const [booking, setBooking] = useState({
		user: user.id,
		email: user.email,
		phone: "",
		branch: id,
		room_type:bookingDetails.roomType,
		room:[],
		check_in_date: bookingDetails.checkin,
		check_out_date: bookingDetails.checkout,
	})
  const [errorMessage, setErrorMessage] = useState("")
  const [validated, setValidated] = useState(false)
	const [isSubmitted, setIsSubmitted] = useState(false)
  const navigate = useNavigate()
  const [selectionData, setSelectionData] = useState({});
  const [roomPrice, setRoomPrice] = useState(0)


  useEffect(() => {
    fetchRoomTypes();
    if (!rooms.length) {
      fetchAvailableRooms();
    }
    loadSelectionData();
  }, [id]);
  useEffect(() => {
    // Khi roomPrice thay đổi, nó sẽ log ra giá trị mới
  }, [roomPrice]);

  const fetchRoomTypes = async () => {
    try {
      const response = await getRoomTypesByBranchId(id);
      setRoomTypes(response);
    } catch (error) {
      console.error('Error fetching room types:', error);
    }
  };

  const fetchAvailableRooms = async () => {
    const { checkin, checkout, roomType } = details;
    if (checkin && checkout && roomType) {
      try {
        const data = await checkRoomAvailability(id, roomType, checkin, checkout);
        setRoomPrice(data.available_rooms[0].price);
        setRooms(data.available_rooms);
      } catch (error) {
        console.error('Error fetching available rooms:', error);
      }
    } else {
      console.warn('Please provide all required details to fetch available rooms.');
    }
  };


  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setDetails((prevDetails) => ({
      ...prevDetails,
      [name]: value,
    }));
    setBooking((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  // const handleCheckAvailability = async() => {
  //   const { checkin, checkout, roomType } = bookingDetails;

  //   if (id && roomType && checkin && checkout) {
  //     try {
  //       await fetchAvailableRooms()
  //     } catch (error) {
  //       alert('Failed to check room availability');
  //     }
  //   } else {
  //     alert('Please fill in all fields');
  //   }
  // };

  
  const loadSelectionData = () => {
    // Lấy dữ liệu giỏ hàng của user từ localStorage
    const storedData = JSON.parse(localStorage.getItem(`selection_data_${user.id}`) || '{}');
    setSelectionData(storedData);
  };

  const handleAddToSelection = (room) => {
    const { id: room_id, branch, price, number_of_beds, room_number, room_type } = room;
    const { checkin, checkout } = details;

    const expirationTime = Date.now() + 3 * 60 * 1000; // 3 phút sau

    try {
      // Lấy dữ liệu hiện tại của user từ localStorage
      const currentData = JSON.parse(localStorage.getItem(`selection_data_${user.id}`) || '{}');

      const newRoomData = {
        [room_id]: {
          user: user.id,
          branch_id: branch.id,
          branch_name: branch.name,
          price,
          number_of_beds,
          room_number,
          room_type: room_type.name,
          room_id: room_id,
          checkin,
          checkout,
          expirationTime
        }
      };

      const updatedData = {
        ...currentData,
        ...newRoomData
      };

      // Cập nhật giỏ hàng của user trong localStorage
      localStorage.setItem(`selection_data_${user.id}`, JSON.stringify(updatedData));
      setSelectionData(updatedData);

      alert('Room added to selection successfully');
    } catch (error) {
      alert('Failed to add room to selection');
      console.error(error);
    }
  };

  const handleRemoveFromSelection = async (room_id) => {
    try {
      const currentData = JSON.parse(localStorage.getItem(`selection_data_${user.id}`) || '{}');
      
      if (currentData[room_id]) {
        delete currentData[room_id];
        localStorage.setItem(`selection_data_${user.id}`, JSON.stringify(currentData));
        setSelectionData(currentData);
        alert('Room removed from selection successfully');
      } else {
        alert('Room not found in selection');
      }
    } catch (error) {
      alert('Failed to remove room from selection');
      console.error(error);
    }
  };

  const isRoomInSelection = (room_id) => {
    const selection = JSON.parse(localStorage.getItem(`selection_data_${user.id}`) || '{}');
    return Object.keys(selection).includes(String(room_id));
  };


  if (!rooms.length) {
    return <div>Loading available rooms...</div>;
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
    const selectionData = JSON.parse(localStorage.getItem('selection_data_obj') || '{}');
    // Lọc ra tất cả room_id từ selection_data
    const roomIds = Object.keys(selectionData)
      .filter(key => !isNaN(key)) // Loại bỏ các keys không phải là số (như expirationTime)
      .map(key => parseInt(key));  // Lấy ra room_id (key chính là room_id)

    // Đặt roomIds vào phiếu đặt phòng
    setBooking(prevState => ({
        ...prevState,
        room: roomIds  // Gửi danh sách các room_id
    }));
    console.log(booking)
    navigate('/cart', { state: { booking, payment: calculatePayment(), validated } });
	}
  const calculatePayment = () => {
		const checkInDate = moment(booking.check_in_date)
		const checkOutDate = moment(booking.check_out_date)
		const diffInDays = checkOutDate.diff(checkInDate, "days")
    if (!booking.room || booking.room.length === 0) {
      // Nếu không có phòng, giá phòng bằng 0 hoặc số ngày <= 0 thì giá tiền bằng 0
      return 0;
  }
    const numberOfRooms = booking.room.length;  // Số lượng phòng đã chọn
		const paymentPerDay = roomPrice ? roomPrice : 0
		return diffInDays * paymentPerDay * numberOfRooms
	}
  const handleFormSubmit = async () => {
		try {
			const confirmationCode = await bookRoom( booking)
			console.log(confirmationCode)
			setIsSubmitted(true)
			navigate("/booking-success", { state: { message: confirmationCode } })
		} catch (error) {
			const errorMessage = error.message
			console.log(errorMessage)
			navigate("/booking-success", { state: { error: errorMessage } })
		}
	}

  return (
        <Container >
        <Header title={"All Available Rooms"} />
      <Row>
        <Col md={8}>
          {/* <h1 className="text-center mb-4">All Available Rooms</h1> */}
          {/* <p className="text-center text-muted mb-8">The {roomTypes.name} room has 3 available room(s)</p> */}
          <Row>
            {(rooms || []).map((room, index) => (
                <Col key={index} md={4} className="mb-4 mt-4" >
                <Card className="shadow-lg">
                    <Card.Body>
                    <Card.Title className="text-purple-600">Phòng {room.room_number}</Card.Title>
                    <Card.Text>
                        <span className="text-2xl font-bold">${room.price} <span className="text-muted">/Per Night</span></span><br />
                        Beds: {room.number_of_beds}<br />
                        Room Capacity: {room.room_type.room_capacity}
                    </Card.Text>
                    <Button variant="primary" className="mt-2" onClick={() => handleAddToSelection(room)}>Add To Selection</Button>
                    <Button 
                      variant="danger" 
                      className="mt-2 ml-2" 
                      onClick={() => handleRemoveFromSelection(room.id)}
                      disabled={!isRoomInSelection(room.id)}
                    >
                      Remove From Selection
                    </Button>
                    <Button 
                      variant={isRoomInSelection(room.id) ? "success" : "secondary"} 
                      className="mt-2 ml-2" 
                      disabled
                    >
                      {isRoomInSelection(room.id) ? "In Selection" : "Not Selected"}
                    </Button>
                    </Card.Body>
                </Card>
                </Col>
            ))}
            </Row>
        </Col>
        <Col md={4} className="mb-4 mt-4">
          <Card className="shadow-lg">
            <Card.Body>
              <Card.Title className="text-purple-600">Booking</Card.Title>
              <Form noValidate validated={validated} onSubmit={handleSubmit}>
                  {/* <Button variant="primary" onClick={handleCheckAvailability}>Check Availability</Button> */}
                <Form.Group>
                    <Form.Label className="hotel-color">Room Type</Form.Label>
                    <Form.Control as="select" name="roomType" value={booking.room_type} onChange={handleInputChange}>
                        <option value="">Select a room type</option>
                        {roomTypes && roomTypes.map((type, index) => (
                            <option key={index} value={type.id}>
                                {type.type}
                            </option>
                        ))}
                    </Form.Control>
                  </Form.Group>
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
                    <Form.Label htmlFor="phone" className="hotel-color">
                      Phone
                    </Form.Label>
                    <FormControl
                      required
                      type="text"
                      id="phone"
                      name="phone"
                      value={booking.phone}
                      placeholder="Enter your phone number"
                      onChange={handleInputChange}
                    />
                    <Form.Control.Feedback type="invalid">
                      Please enter your phonenumber.
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
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default RoomSelection;
