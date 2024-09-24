// import React, { useEffect, useState } from "react"
// import { getRoomById, updateRoom } from "../utils/ApiFunctions"
// import { Link, useParams } from "react-router-dom"
// const EditRoom = () => {
//     const [room, setRoom] = useState({
// 		photo: "",
// 		roomType: "",
// 		roomPrice: ""
// 	})

// 	const [imagePreview, setImagePreview] = useState("")
// 	const [successMessage, setSuccessMessage] = useState("")
// 	const [errorMessage, setErrorMessage] = useState("")
// 	const { roomId } = useParams()

//     const handleImageChange = (e) => {
// 		const selectedImage = e.target.files[0]
// 		setRoom({ ...room, photo: selectedImage })
// 		setImagePreview(URL.createObjectURL(selectedImage))
// 	}

//     const handleInputChange = (event) => {
// 		const { name, value } = event.target
// 		setRoom({ ...room, [name]: value })
// 	}

//     useEffect(() => {
// 		const fetchRoom = async () => {
// 			try {
// 				const roomData = await getRoomById(roomId)
// 				setRoom(roomData)
// 				setImagePreview(roomData.photo)
// 			} catch (error) {
// 				console.error(error)
// 			}
// 		}

// 		fetchRoom()
// 	}, [roomId])


//     const handleSubmit = async (e) => {
// 		e.preventDefault()

// 		try {
// 			const response = await updateRoom(roomId, room)
// 			if (response.status === 200) {
// 				setSuccessMessage("Room updated successfully!")
// 				const updatedRoomData = await getRoomById(roomId)
// 				setRoom(updatedRoomData)
// 				setImagePreview(updatedRoomData.photo)
// 				setErrorMessage("")
// 			} else {
// 				setErrorMessage("Error updating room")
// 			}
// 		} catch (error) {
// 			console.error(error)
// 			setErrorMessage(error.message)
// 		}
// 	}

//     return (
// 		<div className="container mt-5 mb-5">
// 			<h3 className="text-center mb-5 mt-5">Edit Room</h3>
// 			<div className="row justify-content-center">
// 				<div className="col-md-8 col-lg-6">
// 					{successMessage && (
// 						<div className="alert alert-success" role="alert">
// 							{successMessage}
// 						</div>
// 					)}
// 					{errorMessage && (
// 						<div className="alert alert-danger" role="alert">
// 							{errorMessage}
// 						</div>
// 					)}
// 					<form onSubmit={handleSubmit}>
// 						<div className="mb-3">
// 							<label htmlFor="roomType" className="form-label hotel-color">
// 								Room Type
// 							</label>
// 							<input
// 								type="text"
// 								className="form-control"
// 								id="roomType"
// 								name="roomType"
// 								value={room.roomType}
// 								onChange={handleInputChange}
// 							/>
// 						</div>
// 						<div className="mb-3">
// 							<label htmlFor="roomPrice" className="form-label hotel-color">
// 								Room Price
// 							</label>
// 							<input
// 								type="number"
// 								className="form-control"
// 								id="roomPrice"
// 								name="roomPrice"
// 								value={room.roomPrice}
// 								onChange={handleInputChange}
// 							/>
// 						</div>

// 						<div className="mb-3">
// 							<label htmlFor="photo" className="form-label hotel-color">
// 								Photo
// 							</label>
// 							<input
// 								required
// 								type="file"
// 								className="form-control"
// 								id="photo"
// 								name="photo"
// 								onChange={handleImageChange}
// 							/>
// 							{imagePreview && (
// 								<img
// 									src={`data:image/jpeg;base64,${imagePreview}`}
// 									alt="Room preview"
// 									style={{ maxWidth: "400px", maxHeight: "400" }}
// 									className="mt-3"
// 								/>
// 							)}
// 						</div>
// 						<div className="d-grid gap-2 d-md-flex mt-2">
// 							<Link to={"/existing-rooms"} className="btn btn-outline-info ml-5">
// 								back
// 							</Link>
// 							<button type="submit" className="btn btn-outline-warning">
// 								Edit Room
// 							</button>
// 						</div>
// 					</form>
// 				</div>
// 			</div>
// 		</div>
// 	)
// }

// export default EditRoom
import React, { useEffect, useState } from "react";
import { getRoomById, updateRoom, api } from "../utils/ApiFunctions";
import { Link, useParams } from "react-router-dom";

const EditRoom = () => {
    const [room, setRoom] = useState({
        room_type: "",
        room_number: "",
        is_available: true,
        photo: ""
    });

    const [branches, setBranches] = useState([]);
    const [roomTypes, setRoomTypes] = useState([]);
    const [filteredRoomTypes, setFilteredRoomTypes] = useState([]);
    const [roomPrice, setRoomPrice] = useState("");
    const [imagePreview, setImagePreview] = useState("");
    const [successMessage, setSuccessMessage] = useState("");
    const [errorMessage, setErrorMessage] = useState("");
    const { roomId } = useParams();

    useEffect(() => {
        const fetchRoomData = async () => {
            try {
                const roomData = await getRoomById(roomId);
                setRoom(roomData);
                setImagePreview(roomData.photo); // Keep current image preview
                if (roomData.room_type) {
                    setRoomPrice(roomData.room_type.price); // Set price immediately
                }
            } catch (error) {
                setErrorMessage("Error fetching room data.");
                console.error(error);
            }
        };

        const fetchBranches = async () => {
            try {
                const response = await api.get("/hotel/branch/");
                setBranches(response.data);
            } catch (error) {
                setErrorMessage("Error fetching branches.");
            }
        };

        const fetchRoomTypes = async () => {
            try {
                const response = await api.get("/hotel/roomtypes/");
                setRoomTypes(response.data);
            } catch (error) {
                setErrorMessage("Error fetching room types.");
            }
        };

        fetchRoomData();
        fetchBranches();
        fetchRoomTypes();
    }, [roomId]);

    useEffect(() => {
        if (room.branch) {
            const filteredTypes = roomTypes.filter(type => type.branch === room.branch);
            setFilteredRoomTypes(filteredTypes);
        }
    }, [room.branch, roomTypes]);

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setRoom({ ...room, [name]: type === 'checkbox' ? checked : value });
    };

    const handleRoomTypeChange = (e) => {
        const roomTypeId = e.target.value;
        setRoom(prevState => ({
            ...prevState,
            room_type: roomTypeId
        }));

        const selectedRoomType = filteredRoomTypes.find(type => type.id === Number(roomTypeId));
        if (selectedRoomType) {
            setRoomPrice(selectedRoomType.price); // Set price when room type changes
        } else {
            setRoomPrice("");
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
		console.log(room)
        try {
            const response = await updateRoom(roomId, room);
            if (response.status === 200) {
                setSuccessMessage("Room updated successfully!");
                const updatedRoomData = await getRoomById(roomId);
                setRoom(updatedRoomData);
                setImagePreview(updatedRoomData.photo); // Preserve image
                setErrorMessage("");
            } else {
                setErrorMessage("Error updating room");
            }
        } catch (error) {
            console.error(error);
            setErrorMessage(error.message);
        }
    };

    return (
        <div className="container mt-5 mb-5">
            <h3 className="text-center mb-5 mt-5">Edit Room</h3>
            <div className="row justify-content-center">
                <div className="col-md-8 col-lg-6">
                    {successMessage && (
                        <div className="alert alert-success" role="alert">
                            {successMessage}
                        </div>
                    )}
                    {errorMessage && (
                        <div className="alert alert-danger" role="alert">
                            {errorMessage}
                        </div>
                    )}
                    <form onSubmit={handleSubmit}>
                        <div className="mb-3">
                            <label htmlFor="branch" className="form-label hotel-color">Branch</label>
                            <select
                                className="form-control"
                                id="branch"
                                name="branch"
                                value={room.branch}
                                onChange={handleInputChange}
                            >
                                <option value="">Select Branch</option>
                                {branches.map(branch => (
                                    <option key={branch.id} value={branch.id}>
                                        {branch.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="mb-3">
                            <label htmlFor="room_type" className="form-label hotel-color">Room Type</label>
                            <select
                                className="form-control"
                                id="room_type"
                                name="room_type"
                                value={room.room_type}
                                onChange={handleRoomTypeChange}
                            >
                                <option value="">Select Room Type</option>
                                {filteredRoomTypes.map(type => (
                                    <option key={type.id} value={type.id}>
                                        {type.type}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="mb-3">
                            <label htmlFor="roomPrice" className="form-label hotel-color">Room Price</label>
                            <input
                                type="text"
                                className="form-control"
                                id="roomPrice"
                                name="roomPrice"
                                value={roomPrice}
                                disabled
                            />
                        </div>

                        <div className="mb-3">
                            <label htmlFor="room_number" className="form-label hotel-color">Room Number</label>
                            <input
                                type="text"
                                className="form-control"
                                id="room_number"
                                name="room_number"
                                value={room.room_number}
                                onChange={handleInputChange}
                            />
                        </div>

                        <div className="mb-3">
                            <label htmlFor="photo" className="form-label hotel-color">Photo</label>
                            <input
                                type="file"
                                className="form-control"
                                id="photo"
                                name="photo"
                                onChange={(e) => handleInputChange(e)}
                            />
                            {imagePreview && (
                                <img
                                    src={imagePreview.startsWith("data:") ? imagePreview : `data:image/jpeg;base64,${imagePreview}`}
                                    alt="Room preview"
                                    style={{ maxWidth: "400px", maxHeight: "400px" }}
                                    className="mt-3"
                                />
                            )}
                        </div>

                        <div className="mb-3">
                            <label htmlFor="is_available" className="form-label hotel-color">Is Available</label>
                            <input
                                type="checkbox"
                                id="is_available"
                                name="is_available"
                                checked={room.is_available}
                                onChange={handleInputChange}
                            />
                        </div>

                        <div className="d-grid gap-2 d-md-flex mt-2">
                            <Link to={"/existing-rooms"} className="btn btn-outline-info ml-5">Back</Link>
                            <button type="submit" className="btn btn-outline-warning">Edit Room</button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default EditRoom;
