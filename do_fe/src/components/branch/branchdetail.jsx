/** @jsxImportSource @emotion/react */
import styled from '@emotion/styled';
import React, { useEffect, useState, useContext } from 'react';
import { Card, Col, Form, Button, Row } from "react-bootstrap";
import { useParams, useNavigate } from 'react-router-dom';
import { getBranchDetails, getRoomTypesByBranchId, checkRoomAvailability, api } from '../utils/ApiFunctions';
import Header from "../common/Header";
import BranchFeedback from './BranchFeedback';
import ChatBubble from '../chat/ChatBubble';
import { MyUserContext } from '../utils/MyContext';
import ChatWebSocket from "../chat/ChatWebSocket";



const BranchDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [branch, setBranch] = useState(null);
  const [rooms, setRooms] = useState([]);
  const [roomTypes, setRoomTypes] = useState([]);
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [bookingDetails, setBookingDetails] = useState({
    checkin: '',
    checkout: '',
    roomType: '',
  });

  const user = useContext(MyUserContext);
  const [currentChatUser, setCurrentChatUser] = useState(null);
  const [chatBoxOpen, setChatBoxOpen] = useState(false);

  const fetchReceptionistForBranch = async (branchId) => {
    try {
        const response = await api.get(`/hotel/branch/${branchId}/receptionists/`);

        const receptionists = response.data;


        if (receptionists.length > 0) {
            return receptionists[Math.floor(Math.random() * receptionists.length)];
        } else {
            throw new Error("No receptionists found for this branch.");
        }
    } catch (error) {
        console.error("Error fetching receptionists:", error);
        throw error;
    }
};

  const openChatBox = async () => {
    if (!chatBoxOpen) {
        try {
            const user = await fetchReceptionistForBranch(id);
            setCurrentChatUser(user);
            setChatBoxOpen(true);
        } catch (error) {
            console.error("Failed to load receptionist:", error);
        }
    } else {
        setChatBoxOpen(false);
        setCurrentChatUser(null);
    }
  };

  const closeChatBox = () => {
    setChatBoxOpen(false);
    setCurrentChatUser(null);
  };

  const { messages, sendMessage } = ChatWebSocket(currentChatUser, user, id);

  useEffect(() => {
    setIsLoading(true);
    getBranchDetails(id)
      .then((data) => {
        setBranch(data);
        setIsLoading(false);
      })
      .catch((error) => {
        setErrorMessage(error.message);
        setIsLoading(false);
      });

    getRoomTypesByBranchId(id)
      .then((data) => {
        setRoomTypes(data);
      })
      .catch((error) => {
        setErrorMessage(error.message);
      });
  }, [id]);

  const fetchAvailableRooms = async () => {
    const { checkin, checkout, roomType } = bookingDetails;

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
    setBookingDetails((prevDetails) => ({
      ...prevDetails,
      [name]: value,
    }));
  };

  const handleCheckAvailability = async (e) => {
    e.preventDefault();
    const { checkin, checkout, roomType } = bookingDetails;
    // Tìm roomType dựa trên id
    const selectedRoomType = roomTypes.find(type => type.id === parseInt(roomType));
    if (id && roomType && checkin && checkout) {
      try {
        await fetchAvailableRooms();
        navigate(`/hotel/branch/${id}/roomtype/${selectedRoomType.type}`, {
          state: { availableRooms: rooms, bookingDetails }
        });
      } catch (error) {
        alert('Failed to check room availability');
      }
    } else {
      alert('Please fill in all fields');
    }
  };

  if (isLoading) {
    return <div>Loading branch details...</div>;
  }

  if (errorMessage) {
    return <div className="text-danger">Error: {errorMessage}</div>;
  }

  if (!branch) {
    return null;
  }

  return (
    <Container>
      <BranchImage src={branch.image.replace("image/upload/", "")} alt={branch.name} />
      <BranchInfo>
        <Title>{branch.name}</Title>
        <Address>{branch.address}</Address>
        <Contact>
          <div><i className="fa fa-phone"></i> {branch.phone}</div>
          <div><i className="fa fa-envelope"></i> {branch.email}</div>
        </Contact>
        <Tags>
          {branch.tags.split(',').map((tag) => (
            <Tag key={tag}>{tag.trim()}</Tag>
          ))}
        </Tags>
        
      </BranchInfo>
      <Row>
        <Col md={8}>
          {roomTypes.map((roomType) => (
            <Col key={roomType.id} className="mb-4" style={{ marginLeft: '50px', marginTop: '30px' }} xs={12} md={6} lg={4}>
              <Card className="room-card">
                <Card.Body className="room-details">
                  <Card.Title className="room-type">{roomType.type}</Card.Title>
                  <Card.Text className="room-price">Beds: {roomType.number_of_beds}</Card.Text>
                  <Card.Text className="room-price">Capacity: {roomType.room_capacity} people</Card.Text>
                  <Card.Text className="room-price">{roomType.price} / night</Card.Text>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Col>
       
        <Col md={4} style={{ marginTop: '20px', marginBottom: '70px' }}>
          <Card className="shadow-lg">
            <Card.Body>
              <Card.Title className="text-purple-600">Check Rooms Availability</Card.Title>
              <Form onSubmit={handleCheckAvailability}>
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
                <Button type="submit" variant="primary" className="btn-block">
                  Check Availability
                </Button>
              </Form>
            </Card.Body>
          </Card>
        </Col>
        <button
          onClick={() => openChatBox(user)}
          className="p-3 text-orange-700 hover:text-red-700 hover:underline cursor-pointer"
        ></button>
        
      </Row>
      {!chatBoxOpen && (
      <div id="chat" className='max-w-[300px] fixed right-2 bottom-2 p-4 bg-orange-600 border boder-gray-300 rounded-xl' >
          <div id="chat_icon">
                <button id="chat_open" className='w-[25px] flex items-center' onClick={() => openChatBox(user)}>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="h-6 text-white text-right">
                <path stroke-linecap="round" stroke-linejoin="round" d="M8.625 12a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H8.25m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H12m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 0 1-2.555-.337A5.972 5.972 0 0 1 5.41 20.97a5.969 5.969 0 0 1-.474-.065 4.48 4.48 0 0 0 .978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25Z" />
                </svg>
                </button>
          </div>
        </div>
      )}
      <ChatBubble 
          currentChatUser={currentChatUser}
          messages={messages}
          sendMessage={sendMessage}
          closeChatBox={closeChatBox}
      />
      <Header title={"Feedbacks"} />
      <BranchFeedback branchId={id} />
    </Container>
  );
};
const Container = styled.div`
  max-width: 100%;
  margin: 0 auto;
`;

const BranchImage = styled.img`
  width: 100%;
  height: 400px;
  object-fit: cover;
  margin-bottom: 20px;
`;

const BranchInfo = styled.div`
  text-align: left;
  width: 80%;
  margin-left: 50px;
  margin-top: -200px;
  margin-bottom: 20px;
`;

const Title = styled.h1`
  margin-bottom: 10px;
  color: white;

`;

const Address = styled.p`
  margin: 0;
  color: gray;
  color: white;

`;

const Contact = styled.div`
  margin-top: 10px;
  font-size: 0.9em;
  color: white;
`;

const Tags = styled.div`
  margin-top: 10px;
  margin-bottom: 10px;
`;

const Tag = styled.span`
  background-color: purple;
  color: white;
  padding: 5px 10px;
  border-radius: 5px;
  margin-right: 5px;
  font-size: 12px;
`;
export default BranchDetail;
