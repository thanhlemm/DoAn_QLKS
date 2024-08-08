// import React, { useState, useEffect } from 'react';
// import { Container, Row, Col, Card, Button, Form } from 'react-bootstrap';
// import { useParams } from 'react-router-dom';
// import Header from "../common/Header"
// import { getRoomTypesByBranchId, checkRoomAvailability } from '../utils/ApiFunctions';

// const RoomSelection = () => {
//     const { id } = useParams();
//   const [rooms, setRooms] = useState([]);
//   const [roomTypes, setRoomTypes] = useState([]);
//   const [bookingDetails, setBookingDetails] = useState({
//     checkin: '',
//     checkout: '',
//     roomType: '',
//   });

//   useEffect(() => {
//     // Fetch room types and available rooms from the API
//     fetchRoomTypes();
//     fetchAvailableRooms();
//   }, []);

//   const fetchRoomTypes = async () => {
    
//     try {
//         const response = await getRoomTypesByBranchId(id);
//     // const data = await response.json();
//         setRoomTypes(response);
//     } catch (error) {
//         console.error('Error fetching room types:', error);
//     }
//   };

//   const fetchAvailableRooms = async () => {
//     const { checkin, checkout, roomType } = bookingDetails;

//     // Kiểm tra nếu tất cả các trường cần thiết đã được điền
//     if (checkin && checkout && roomType) {
//         try {
//             // Gọi API kiểm tra tình trạng phòng
//             const data = await checkRoomAvailability(id, roomType, checkin, checkout);

//             // Cập nhật state với dữ liệu phòng
//             console.log('Available Rooms:', data.available_rooms);
//             setRooms(data.available_rooms);
        
//         } catch (error) {
//         console.error('Error fetching available rooms:', error);
//         }
//     } else {
//         console.warn('Please provide all required details to fetch available rooms.');
//     }
//   };

//   const handleInputChange = (e) => {
//     const { name, value } = e.target;
//     setBookingDetails((prevDetails) => ({
//       ...prevDetails,
//       [name]: value,
//     }));
//   };

//   const handleCheckAvailability = async() => {
//     const { checkin, checkout, roomType } = bookingDetails;

//     if (id && roomType && checkin && checkout) {
//       try {
//         await fetchAvailableRooms()
//       } catch (error) {
//         alert('Failed to check room availability');
//       }
//     } else {
//       alert('Please fill in all fields');
//     }
//   };

//   return (
//     <Container >
//         <Header title={"All Available Rooms"} />
//       <Row>
//         <Col md={8}>
//           {/* <h1 className="text-center mb-4">All Available Rooms</h1> */}
//           {/* <p className="text-center text-muted mb-8">The {roomTypes.name} room has 3 available room(s)</p> */}
//           <Row>
//             {(rooms || []).map((room, index) => (
//                 <Col key={index} md={4} className="mb-4">
//                 <Card className="shadow-lg">
//                     <Card.Body>
//                     <Card.Title className="text-purple-600">Phòng {room.room_number}</Card.Title>
//                     <Card.Text>
//                         <span className="text-2xl font-bold">${room.price} <span className="text-muted">/Per Night</span></span><br />
//                         Beds: {room.number_of_beds}<br />
//                         Room Capacity: {room.room_capacity}
//                     </Card.Text>
//                     <Button variant="primary" className="mt-2">Add To Selection</Button>
//                     </Card.Body>
//                 </Card>
//                 </Col>
//             ))}
//             </Row>
//         </Col>
        
//         <Col md={4} style={{ marginTop: '100px' }}>
//           <Card className="shadow-lg">
//             <Card.Body>
//               <Card.Title className="text-purple-600">Booking</Card.Title>
//               <Form>
//                 <Form.Group controlId="checkin" className="mb-4">
//                   <Form.Label>Check-in Date</Form.Label>
//                   <Form.Control type="date" name="checkin" value={bookingDetails.checkin} onChange={handleInputChange} />
//                 </Form.Group>
//                 <Form.Group controlId="checkout" className="mb-4">
//                   <Form.Label>Check-out Date</Form.Label>
//                   <Form.Control type="date" name="checkout" value={bookingDetails.checkout} onChange={handleInputChange} />
//                 </Form.Group>
//                 <Form.Group controlId="roomType" className="mb-4">
//                                     <Form.Label>Room Type</Form.Label>
//                                     <Form.Control as="select" name="roomType" value={bookingDetails.roomType} onChange={handleInputChange}>
//                                         <option value="">Select a room type</option>
//                                         {roomTypes && roomTypes.map((type, index) => (
//                                             <option key={index} value={type.id}>
//                                                 {type.type}
//                                             </option>
//                                         ))}
//                                     </Form.Control>
//                                 </Form.Group>
//                                 <Button variant="primary" onClick={handleCheckAvailability}>Check Availability</Button>
//                 </Form>
//             </Card.Body>
//           </Card>
//         </Col>
//       </Row>
//     </Container>
//   );
// };

// export default RoomSelection;
import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Form } from 'react-bootstrap';
import { useLocation, useParams } from 'react-router-dom';
import Header from "../common/Header";
import { getRoomTypesByBranchId, checkRoomAvailability, addRoomToSelection } from '../utils/ApiFunctions';

const RoomSelection = () => {
  const location = useLocation();
  const { availableRooms, bookingDetails } = location.state || {};
  const { id } = useParams();
  const [rooms, setRooms] = useState(availableRooms || []);
  const [roomTypes, setRoomTypes] = useState([]);
  const [details, setDetails] = useState(bookingDetails || {
    checkin: '',
    checkout: '',
    roomType: '',
    branch_id: id,
    branch_name: '', 
  });

  useEffect(() => {
    fetchRoomTypes();
    if (!rooms.length) {
      fetchAvailableRooms();
    }
    loadSelectionData();
  }, [id]);

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
  };

  const handleCheckAvailability = async() => {
    const { checkin, checkout, roomType } = bookingDetails;

    if (id && roomType && checkin && checkout) {
      try {
        await fetchAvailableRooms()
      } catch (error) {
        alert('Failed to check room availability');
      }
    } else {
      alert('Please fill in all fields');
    }
  };

  const [selectionData, setSelectionData] = useState({});
  
  const loadSelectionData = () => {
    const storedData = JSON.parse(localStorage.getItem('selectionData') || '{}');
    setSelectionData(storedData);
};


  
  const handleAddToSelection = async (room) => {
    const { id: room_id, branch, price, number_of_beds, room_number, room_type } = room;
    const { checkin, checkout } = details;
    const expirationTime = Date.now() + 5 * 60 * 1000; // 5 phút sau

    try {
        const response = await addRoomToSelection({
            id: room_id,
            branch: branch.id,  // Gửi chỉ ID của branch
            price,
            number_of_beds,
            room_number,
            room_type: room_type.id,  // Gửi chỉ ID của room_type
            room_id: room_id,
            checkin,
            checkout
        });
        if (response.data) {
          console.log("Previous data from localStorage:", JSON.parse(localStorage.getItem('selection_data') || '{}'));
          console.log("Data from response:", response.data.data);

          const currentData = JSON.parse(localStorage.getItem('selection_data') || '{}');
          const updatedData = {
              ...currentData,
              ...response.data,
              expirationTime
          };

          console.log("Updated data before saving to localStorage:", updatedData);
          localStorage.setItem('selection_data', JSON.stringify(updatedData));

          setSelectionData(updatedData);
          console.log("Selection data after setSelectionData:", updatedData);

          alert('Room added to selection successfully');
      } else {
          console.log("No data in response");
      }
  } catch (error) {
      alert('Failed to add room to selection');
      console.error(error);
  }
};

  if (!rooms.length) {
    return <div>Loading available rooms...</div>;
  }
  
  if (!rooms.length) {
    return <div>Loading available rooms...</div>;
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
              <Form>
                <Form.Group controlId="checkin" className="mb-4">
                  <Form.Label>Check-in Date</Form.Label>
                  <Form.Control type="date" name="checkin" value={bookingDetails.checkin} onChange={handleInputChange} />
                </Form.Group>
                <Form.Group controlId="checkout" className="mb-4">
                  <Form.Label>Check-out Date</Form.Label>
                  <Form.Control type="date" name="checkout" value={bookingDetails.checkout} onChange={handleInputChange} />
                </Form.Group>
                <Form.Group controlId="roomType" className="mb-4">
                  <Form.Label>Room Type</Form.Label>
                  <Form.Control as="select" name="roomType" value={bookingDetails.roomType} onChange={handleInputChange}>
                      <option value="">Select a room type</option>
                      {roomTypes && roomTypes.map((type, index) => (
                          <option key={index} value={type.id}>
                              {type.type}
                          </option>
                      ))}
                  </Form.Control>
                </Form.Group>
                <Button variant="primary" onClick={handleCheckAvailability}>Check Availability</Button>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default RoomSelection;
