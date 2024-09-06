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
import { getRoomById } from "../utils/ApiFunctions"
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
		localStorage.setItem('selection_data_obj', JSON.stringify(selectionData));
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
										src={roomInfo.room_type?.image.replace("image/upload/", "")}
										alt="Room in the hotel"
										style={{ width: "100%", height: "200px" }}
									/>
									<table className="table table-bordered">
										<tbody>
											<tr>
												<th>Room Type:</th>
												<td>{roomInfo.room_type?.type}</td>
											</tr>
											<tr>
												<th>Price per night:</th>
												<td>${roomInfo.price}</td>
											</tr>
											<tr>
												<th>Room Service:</th>
												<td>
													{/* Các dịch vụ phòng hiển thị tại đây */}
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
									src={room.room_type?.image.replace("image/upload/", "")}
									alt="Room in the hotel"
									style={{ width: "100%", height: "200px" }}
								/>
								<table className="table table-bordered">
									<tbody>
										<tr>
											<th>Room Type:</th>
											<td>{room.room_type?.type}</td>
										</tr>
										<tr>
											<th>Price per night:</th>
											<td>${room.price}</td>
										</tr>
										<tr>
											<th>Room Service:</th>
											<td>
												{/* <ul className="list-unstyled">
													<li>
														<FaWifi /> Wifi
													</li>
													<li>
														<FaTv /> Netfilx Premium
													</li>
													<li>
														<FaUtensils /> Breakfast
													</li>
													<li>
														<FaWineGlassAlt /> Mini bar refreshment
													</li>
													<li>
														<FaCar /> Car Service
													</li>
													<li>
														<FaParking /> Parking Space
													</li>
													<li>
														<FaTshirt /> Laundry
													</li>
												</ul> */}
											</td>
										</tr>
										<tr>
											<td colSpan="2">
												<button
													className="btn btn-danger btn-sm"
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
