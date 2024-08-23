import React, { useEffect, useState } from "react"
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

	useEffect(() => {
		// if(roomId){
		// setTimeout(() => {
		// 	getRoomById(roomId)
		// 		.then((response) => {
		// 			setRoomInfo(response)
		// 			setIsLoading(false)
		// 		})
		// 		.catch((error) => {
		// 			setError(error)
		// 			setIsLoading(false)
		// 		})
		// }, 1000)
		// } else {
		// 	const selectionData = JSON.parse(localStorage.getItem('selection_data_obj') || '{}');
		// 	const roomIds = Object.keys(selectionData).filter(key => !isNaN(key)).map(key => parseInt(key));
			
		// 	const roomPromises = roomIds.map(roomId => getRoomById(roomId));
			
		// 	Promise.all(roomPromises)
		// 		.then(rooms => {
		// 			setRoomsInfo(rooms)
		// 			setIsLoading(false)
		// 		})
		// 		.catch((error) => {
		// 			setError(error.message || "An error occurred");
		// 			setIsLoading(false)
		// 		})
		// }
		const fetchRooms = async () => {
			try {
			  if (roomId) {
				const response = await getRoomById(roomId);
				setRoomInfo(response);
				setIsLoading(false);
			  } else {
				const selectionData = JSON.parse(localStorage.getItem('selection_data_obj') || '{}');
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

	return (
		<div>
			<section className="container">
				<div className="row">
					<div className="col-md-4 mt-5 mb-5">
						{isLoading ? (
							<p>Loading room information...</p>
						) : error ? (
							<p>Error: {error.message || "An error occurred"}</p>
						  
						) : (
							roomsInfo.length > 0 ? (
							roomsInfo.map((room, index) => (
								<div key={index} className="room-info mb-4">
								<img
									src={room.room_type?.image.replace("image/upload/", "")}
									alt="Room photo"
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
