import React, { useState, useEffect } from "react";
import { addRoom, api } from "../utils/ApiFunctions";
import { Link } from "react-router-dom";

const AddRoom = () => {
  const [newRoom, setNewRoom] = useState({
    branch: "",
    room_type: "",
    room_number: "",
    is_available: true
  });

  const [branches, setBranches] = useState([]);
  const [roomTypes, setRoomTypes] = useState([]);
  const [filteredRoomTypes, setFilteredRoomTypes] = useState([]);
  const [roomPrice, setRoomPrice] = useState("");
  const [numberOfBeds, setNumberOfBeds] = useState(0);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
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

    fetchBranches();
    fetchRoomTypes();
  }, []);

  useEffect(() => {
    if (newRoom.branch) {
      const branchId = Number(newRoom.branch);
      const filteredTypes = roomTypes.filter(type => type.branch === branchId);
      setFilteredRoomTypes(filteredTypes);
      setNewRoom(prevState => ({
        ...prevState,
        room_type: "",
      }));
      setRoomPrice("");
      setNumberOfBeds(0);
    } else {
      setFilteredRoomTypes([]);
    }
  }, [newRoom.branch, roomTypes]);

  const handleRoomInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setNewRoom({ ...newRoom, [name]: type === 'checkbox' ? checked : value });
  };

  const handleBranchChange = (e) => {
    const branchId = e.target.value;
    setNewRoom(prevState => ({
      ...prevState,
      branch: branchId
    }));
  };

  const handleRoomTypeChange = (e) => {
    const roomTypeId = e.target.value;
    setNewRoom(prevState => ({
      ...prevState,
      room_type: roomTypeId
    }));

    const selectedRoomType = filteredRoomTypes.find(type => type.id === Number(roomTypeId));
    if (selectedRoomType) {
      setRoomPrice(selectedRoomType.price);
      setNumberOfBeds(selectedRoomType.number_of_beds);
    } else {
      setRoomPrice("");
      setNumberOfBeds(0);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const success = await addRoom(
        newRoom.branch, 
        newRoom.room_type,
        newRoom.room_number,
        newRoom.is_available
      );

      if (success) {
        setSuccessMessage("A new room was added successfully!");
        setNewRoom({
          branch: "",
          room_type: "",
          room_number: "",
          is_available: true
        });
        setRoomPrice("");
        setNumberOfBeds(0);
        setErrorMessage("");
      } else {
        setErrorMessage("Error adding new room");
      }
    } catch (error) {
      setErrorMessage(error.message);
    }
    setTimeout(() => {
      setSuccessMessage("");
      setErrorMessage("");
    }, 3000);
  };

  return (
    <section className="container mt-5 mb-5">
      <div className="row justify-content-center">
        <div className="col-md-8 col-lg-6">
          <h2 className="mt-5 mb-2">Add a New Room</h2>
          {successMessage && (
            <div className="alert alert-success fade show">{successMessage}</div>
          )}

          {errorMessage && <div className="alert alert-danger fade show">{errorMessage}</div>}

          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label htmlFor="branch" className="form-label">Branch</label>
              <select
                required
                className="form-control"
                id="branch"
                name="branch"
                value={newRoom.branch}
                onChange={handleBranchChange}
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
              <label htmlFor="room_type" className="form-label">Room Type</label>
              <select
                required
                className="form-control"
                id="room_type"
                name="room_type"
                value={newRoom.room_type}
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
              <label htmlFor="room_number" className="form-label">Room Number</label>
              <input
                required
                type="text"
                className="form-control"
                id="room_number"
                name="room_number"
                value={newRoom.room_number}
                onChange={handleRoomInputChange}
              />
            </div>

            {roomPrice && (
              <div className="mb-3">
                <label className="form-label">Room Price</label>
                <input
                  type="text"
                  className="form-control"
                  value={roomPrice}
                  disabled
                />
              </div>
            )}

            {numberOfBeds > 0 && (
              <div className="mb-3">
                <label className="form-label">Number of Beds</label>
                <input
                  type="text"
                  className="form-control"
                  value={numberOfBeds}
                  disabled
                />
              </div>
            )}

            <div className="mb-3">
              <label htmlFor="isAvailable" className="form-label">Is Available</label>
              <input
                type="checkbox"
                id="isAvailable"
                name="is_available"
                checked={newRoom.is_available}
                onChange={handleRoomInputChange}
              />
            </div>

            <div className="d-grid gap-2 d-md-flex mt-2">
              <Link to={"/existing-rooms"} className="btn btn-outline-info">
                Existing rooms
              </Link>
              <button type="submit" className="btn btn-outline-primary ml-5">
                Save Room
              </button>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
};

export default AddRoom;
