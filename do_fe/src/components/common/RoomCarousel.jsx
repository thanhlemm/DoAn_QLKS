import React, { useEffect, useState } from "react";
import  { getAllRooms, getRoomTypes } from "../utils/ApiFunctions";
import { Link } from "react-router-dom";
import { Card, Carousel, Col, Container, Row } from "react-bootstrap";

const RoomCarousel = () => {
  const [rooms, setRooms] = useState([]);
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [roomTypes, setRoomTypes] = useState([]);
  const [currentPage, setCurrentPage] = useState(1)


  useEffect(() => {
		fetchRoomTypes();
	  }, []);

  useEffect(() => {
    setIsLoading(true);
    getAllRooms()
      .then((data) => {
        setRooms(data);
        setIsLoading(false);
      })
      .catch((error) => {
        setErrorMessage(error.message);
        setIsLoading(false);
      });
  }, []);

  const fetchRoomTypes = async () => {
		try {
		  const response = await getRoomTypes();
		  setRoomTypes(response);
		} catch (error) {
		  console.error("Error fetching room types:", error);
		}
	  };
    
	const handlePageChange = (pageNumber) => {
		setCurrentPage(pageNumber)
	}

  if (isLoading) {
    return <div className="mt-5">Loading rooms....</div>;
  }
  if (errorMessage) {
    return <div className=" text-danger mb-5 mt-5">Error : {errorMessage}</div>;
  }
  const getRoomTypeImage = (id) => {
		const roomType = roomTypes.find(type => type.id === id);
		return roomType ? `${roomType.image}` : 'Unknown';
	  };

  return (
    <section className="bg-light mb-5 mt-5 shadow">
      <Link to={"/browse-all-rooms"} className="hotel-color text-center">
        Browse all rooms
      </Link>
      <Container>
        <Carousel indicators={false}>
          {[...Array(Math.ceil(rooms.length / 4))].map((_, index) => (
            <Carousel.Item key={index}>
              <Row>
                {rooms.slice(index * 4, index * 4 + 4).map((room) => {
                  // Clean the image URL for each room
                  return (
                    <Col key={room.id} className="mb-4" xs={12} md={6} lg={3}>
                      <Card>
                        <Link to={`/book-room/${room.id}`}>
                          <Card.Img
                            variant="top"
                            src={getRoomTypeImage(room.room_type).replace("image/upload/", "")}
                            alt="Room Photo"
                            className="w-100"
                            style={{ height: "200px" }}
                          />
                        </Link>
                        <Card.Body>
                          <Card.Title className="hotel-color">{room.room_type?.type}</Card.Title>
                          <Card.Title className="room-price">${room.price}</Card.Title>
						              <Card.Text className="room-price">Beds: {room.room_type?.number_of_beds}</Card.Text>
                    		<Card.Text className="room-price">Capacity: {room.room_type?.room_capacity} people</Card.Text>
                          <div className="flex-shrink-0">
                            <Link to={`/book-room/${room.id}`} className="btn btn-outline-secondary">
                              Book Now
                            </Link>
                          </div>
                        </Card.Body>
                      </Card>
                    </Col>
                  );
                })}
              </Row>
            </Carousel.Item>
          ))}
        </Carousel>
      </Container>
    </section>
  );
};

export default RoomCarousel;