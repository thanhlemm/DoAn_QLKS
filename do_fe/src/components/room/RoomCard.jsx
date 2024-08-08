import React from "react";
import { Card, Col } from "react-bootstrap";
import { Link } from "react-router-dom";

const RoomCard = ({ room }) => {
  const cleanImageUrl = room.room_type?.image?.replace("image/upload/", "");
  return (
    <Col key={room.id} className="mb-4" xs={12} md={6} lg={4}>
      <Card className="room-card">
        <div className="room-img">
          <Link to={`/book-room/${room.id}`}>
            <Card.Img
              variant="top"
              // src={`data:image/png;base64, ${room.photo}`}
              src={cleanImageUrl}
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