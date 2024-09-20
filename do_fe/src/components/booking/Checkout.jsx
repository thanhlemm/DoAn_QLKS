import React, { useEffect, useState, useContext } from "react"
import BookingForm from "../booking/BookingForm"
// import {
// 	FaUtensils,
// 	FaWifi,
// 	FaTv,
// 	FaWineGlassAlt,
// 	FaParking,
// 	FaCar,
// 	FaTshirt
// } from "react-icons/fa"
import { FaTrash } from "react-icons/fa" 
import { MyUserContext } from '../utils/MyContext';
import { useParams } from "react-router-dom"
import { getRoomById, getRoomTypes } from "../utils/ApiFunctions"
import RoomCarousel from "../common/RoomCarousel"

const Checkout = () => {
	const [error, setError] = useState(null)
	const [isLoading, setIsLoading] = useState(true)
	const [roomsInfo, setRoomsInfo] = useState([])
	const [roomInfo, setRoomInfo] = useState({
		photo: "",
		room_type: "",
		roomPrice: ""
	})

	const { roomId } = useParams()
	const user = useContext(MyUserContext);
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
	const getRoomTypeName = (id) => {
		const roomType = roomTypes.find(type => type.id === id);
		  return roomType ? `${roomType.type}` : 'Unknown';
	  };

	useEffect(() => {
		const fetchRooms = async () => {
			try {
			  if (roomId) {
				const response = await getRoomById(roomId);
				setRoomInfo(response);
				setIsLoading(false);
			  } else {
				const selectionData = JSON.parse(localStorage.getItem(`selection_data_${user.id}`) || '{}');
				const roomIds = Object.keys(selectionData).filter(key => !isNaN(key)).map(key => parseInt(key));
				const roomPromises = roomIds.map(id => getRoomById(id));
				const rooms = await Promise.all(roomPromises);
				setRoomsInfo(rooms);
				setIsLoading(false);
			  }
			} catch (err) {
				console.error("Fetch Error:", err); // In lỗi ra console
				setError(new Error(err.message || "An error occurred"));
				setIsLoading(false);
			}
		  };
	  
		  fetchRooms();
	}, [roomId])

	const handleRemoveRoom = (id) => {
		// Lấy dữ liệu từ localStorage
		const selectionData = JSON.parse(localStorage.getItem(`selection_data_${user.id}`) || '{}');
		// Xóa phòng khỏi đối tượng selectionData
		delete selectionData[id];
		// Cập nhật lại localStorage
		localStorage.setItem(`selection_data_${user.id}`, JSON.stringify(selectionData));
		// Cập nhật lại roomsInfo sau khi xóa
		setRoomsInfo(prevRooms => prevRooms.filter(room => room.id !== id));
	}
	

	return (
		<div>
			<section className="container">
				<div className="row">
					<div className="col-md-4 mt-5 mb-5">
						{isLoading ? (
							<p>Loading room information...</p>
						) : error ? (
							<p>Error: {error.message || "An error occurred"}</p>
						  
						) : roomId ? (
								<div className="room-info mb-4">
									<img
										src={getRoomTypeImage(roomInfo.room_type).replace("image/upload/", "")}
										alt="Room in the hotel"
										style={{ width: "100%", height: "200px" }}
									/>
									<table className="w-full border-collapse bg-neutral-50 shadow-md rounded-lg overflow-hidden" style={{borderRadius: "24px"}}>
									<tbody>
										<tr className="border-b border-neutral-300 hover:bg-neutral-100">
												<th className="text-center">Room Number:</th>
												<td>{roomInfo.room_number}</td>
										</tr>
										<tr className="border-b border-neutral-300 hover:bg-neutral-100"> 
											<th className="text-center">Room Type:</th>
											<td>{getRoomTypeName(roomInfo.room_type)}</td>
										</tr>
										<tr className="border-b border-neutral-300 hover:bg-neutral-100">
											<th className="text-center">Price per night:</th>
											<td>${roomInfo.price}</td>
										</tr>
										<tr >
											<td colSpan="2" className="p-2">
												<button
													className="btn btn-sm"
													style={{backgroundColor:"#C40000"}}
													onClick={() => handleRemoveRoom(roomInfo.id)}
												>
													<FaTrash />
												</button>
											</td>
										</tr>
									</tbody>
								</table>
								</div>
							) : (
							roomsInfo.length > 0 ? (
							roomsInfo.map((room, index) => (
								<div key={index} className="room-info mb-4">
								<img
									src={getRoomTypeImage(room.room_type).replace("image/upload/", "")}
									alt="Room in the hotel"
									style={{ width: "100%", height: "200px", borderRadius: "24px" }}
								/>
								<table className="w-full border-collapse bg-neutral-50 shadow-md rounded-lg overflow-hidden" style={{borderRadius: "24px"}}>
									<tbody>
										<tr className="border-b border-neutral-300 hover:bg-neutral-100">
												<th className="text-center">Room Number:</th>
												<td>{room.room_number}</td>
										</tr>
										<tr className="border-b border-neutral-300 hover:bg-neutral-100"> 
											<th className="text-center">Room Type:</th>
											<td>{getRoomTypeName(room.room_type)}</td>
										</tr>
										<tr className="border-b border-neutral-300 hover:bg-neutral-100">
											<th className="text-center">Price per night:</th>
											<td>${room.price}</td>
										</tr>
										<tr >
											<td colSpan="2" className="p-2">
												<button
													className="btn btn-sm"
													style={{backgroundColor:"#C40000"}}
													onClick={() => handleRemoveRoom(room.id)}
												>
													<FaTrash />
												</button>
											</td>
										</tr>
									</tbody>
								</table>
							</div>
							))
							) : (
								<p>No rooms found.</p>
							  )
							)}
					</div>
					<div className="col-md-8">
						<BookingForm />
					</div>
				</div>
			</section>
			<div className="container">
				<RoomCarousel />
			</div>
		</div>
	)
}
export default Checkout
