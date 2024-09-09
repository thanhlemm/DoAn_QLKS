import React, { useEffect, useState } from "react";
import { Card, Col } from "react-bootstrap";
import  { getAllRooms, getRoomTypes } from "../utils/ApiFunctions";
import { Link } from "react-router-dom";

const RoomCard = ({ room }) => {
  const [roomTypes, setRoomTypes] = useState([]);

  useEffect(() => {
		fetchRoomTypes();
	  }, []);

  const fetchRoomTypes = async () => {
		try {
		  const response = await getRoomTypes();
		  setRoomTypes(response);
		} catch (error) {
		  console.error("Error fetching room types:", error);
		}
	  };
    const getRoomTypeImage = (id) => {
      const roomType = roomTypes.find(type => type.id === id);
      return roomType ? `${roomType.image}` : 'Unknown';
      };
  return (
    <Col key={room.id} className="mb-4" xs={12} md={6} lg={4}>
      <Card className="room-card">
        <div className="room-img">
          <Link to={`/book-room/${room.id}`}>
            <Card.Img
              variant="top"
              // src={`data:image/png;base64, ${room.photo}`}
              src={getRoomTypeImage(room.room_type).replace("image/upload/", "")}
              alt="Room Photo"
              style={{ height: "200px" }}
            />
          </Link>
        </div>
        <Card.Body className="room-details">
          <Card.Title className="room-type">{room.branch?.name}</Card.Title>
          {/* <Card.Text className="room-price">{`Price: ${room.roomType.price}`}</Card.Text> */}
          <Card.Text className="room-type">Loại phòng: {room.room_type?.type}</Card.Text>
          <Card.Text className="room-type">Số phòng: {room.room_number}</Card.Text>
          <Card.Text className="room-price">
            {room.price ? `${room.price} USD` : "Price not available"}
          </Card.Text>
          <Link to={`/book-room/${room.id}`} className="btn btn-primary btn-block">
            Book Now
          </Link>
        </Card.Body>
      </Card>
    </Col>
  );
};

export default RoomCard;