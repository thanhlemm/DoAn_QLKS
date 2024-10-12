
import React, { useEffect, useState } from "react";
import { deleteRoom, getAllRooms, api, getRoomTypes } from "../utils/ApiFunctions";
import { Col, Row } from "react-bootstrap";
import RoomFilter from "../common/RoomFilter";
import RoomPaginator from "../common/RoomPaginator";
import { FaEdit, FaEye, FaPlus, FaTrashAlt } from "react-icons/fa";
import { Link } from "react-router-dom";

const ExistingRooms = () => {
  const [rooms, setRooms] = useState([]);
  const [branches, setBranches] = useState([]);
  const [roomTypes, setRoomTypes] = useState([]);
  const [filteredRoomTypes, setFilteredRoomTypes] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [roomsPerPage] = useState(8);
  const [isLoading, setIsLoading] = useState(false);
  const [filteredRooms, setFilteredRooms] = useState([]);
  const [selectedRoomType, setSelectedRoomType] = useState("");
  const [selectedBranch, setSelectedBranch] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  

  useEffect(() => {
    fetchRooms();
    fetchBranches();
    fetchRoomTypes(); // Fetch all room types on component mount
  }, []);
  

  useEffect(() => {
    if (selectedBranch) {
      fetchRoomTypes(selectedBranch); // Fetch room types theo branch
    } else {
      fetchRoomTypes(); // Fetch all room types if no branch is selected
    }
  }, [selectedBranch]);

  const fetchRooms = async () => {
    setIsLoading(true);
    try {
      const result = await getAllRooms();
      setRooms(result);
      setFilteredRooms(result);
      setIsLoading(false);
    } catch (error) {
      setErrorMessage(error.message);
      setIsLoading(false);
    }
  };

  const fetchBranches = async () => {
    try {
      const response = await api.get('/hotel/branch/');
      setBranches(response.data);
    } catch (error) {
      console.error("Error fetching branches:", error);
    }
  };

  
  const fetchRoomTypes = async (branchId = null) => {
    try {
      let response;
      if (branchId) {
        response = await getRoomTypes(branchId); // Lấy room types theo branch
      } else {
        response = await api.get('/hotel/roomtypes/'); // Lấy toàn bộ room types
      }
  
      if (Array.isArray(response.data)) {
        setRoomTypes(response.data);
        setFilteredRoomTypes(response.data); // Set danh sách room types
      } else {
        setRoomTypes([]);
        setFilteredRoomTypes([]);
      }
    } catch (error) {
      console.error("Error fetching room types:", error);
    }
  };
  

  useEffect(() => {
    if (selectedRoomType === "") {
      setFilteredRooms(rooms);
    } else {
      const filteredRooms = rooms.filter(
        (room) => room.room_type === selectedRoomType
      );
      setFilteredRooms(filteredRooms);
    }
    setCurrentPage(1);
  }, [rooms, selectedRoomType]);

  const handlePaginationClick = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const handleDelete = async (roomId) => {
    try {
      const result = await deleteRoom(roomId);
      if (result === "") {
        setSuccessMessage(`Room No ${roomId} was deleted`);
        fetchRooms();
      } else {
        console.error(`Error deleting room: ${result.message}`);
      }
    } catch (error) {
      setErrorMessage(error.message);
    }
    setTimeout(() => {
      setSuccessMessage("");
      setErrorMessage("");
    }, 3000);
  };

  const calculateTotalPages = (filteredRooms, roomsPerPage) => {
    const totalRooms = filteredRooms.length;
    return Math.ceil(totalRooms / roomsPerPage);
  };

  const indexOfLastRoom = currentPage * roomsPerPage;
  const indexOfFirstRoom = indexOfLastRoom - roomsPerPage;
  const currentRooms = filteredRooms.slice(indexOfFirstRoom, indexOfLastRoom);

  const getBranchName = (id) => {
    const branch = branches.find(branch => branch.id === id);
    return branch ? branch.name : 'Unknown';
  };

  const getRoomTypeName = (id) => {
    const roomType = roomTypes.find(type => type.id === id);
    return roomType ? `${roomType.type} ` : 'Unknown';
  };

  const getRoomTypePrice = (id) => {
    const roomType = roomTypes.find(type => type.id === id);
    return roomType ? `${roomType.price}` : 'Unknown';
  };

  return (
    <>
      <div className="container col-md-8 col-lg-6">
        {successMessage && (
          <p className="alert alert-success mt-5">{successMessage}</p>
        )}

        {errorMessage && (
          <p className="alert alert-danger mt-5">{errorMessage}</p>
        )}
      </div>

      {isLoading ? (
        <p>Loading existing rooms</p>
      ) : (
        <>
          <section className="flex-1 p-10 bg-neutral-50">
            <div className="d-flex justify-content-between mb-3 mt-5">
              <h2>Existing Rooms</h2>
            </div>

            <Row>
              <Col md={6} className="mb-2 md-mb-0">
                <RoomFilter 
                  data={rooms} 
                  roomTypes={filteredRoomTypes} 
                  setFilteredData={setFilteredRooms} 
                  setSelectedRoomType={setSelectedRoomType}
                  setSelectedBranch={setSelectedBranch}
                />
              </Col>

              <Col
                md={6}
                className="d-flex justify-content-md-end justify-content-center mb-3"
              >
                <Link
                  to={"/add-room"}
                  className="bg-primary text-white rounded-md py-2 px-4 flex items-center"
                  style={{
                    backgroundColor: "#007bff",
                    borderColor: "#007bff",
                    color: "#fff",
                    textDecoration: "none",
                    display: "flex",
                    alignItems: "center",
                    padding: "0.5rem 1rem",
                    borderRadius: "0.25rem",
                  }}
                >
                  <FaPlus style={{ marginRight: "0.5rem" }} /> Add Room
                </Link>
              </Col>
            </Row>

            <table className="w-full border-collapse bg-neutral-50 shadow-md rounded-lg overflow-hidden" style={{borderRadius: "24px"}}>
              <thead>
                <tr className="bg-neutral-100 border-b border-neutral-300">
                  <th className="p-4 text-center">ID</th>
                  <th className="p-4 text-center">Branch</th>
                  <th className="p-4 text-center">Room Type</th>
                  <th className="p-4 text-center">Room Number</th>
                  <th className="p-4 text-center">Room Price</th>
                  <th className="p-4 text-center">Available</th>
                  <th className="p-4 text-center">Actions</th>
                </tr>
              </thead>

              <tbody>
                {currentRooms.map((room) => (
                  <tr key={room.id} className="border-b border-neutral-300 hover:bg-neutral-100">
                    <td className="p-4">{room.id}</td>
                    <td className="p-4">{getBranchName(room.branch)}</td>
                    <td className="p-4">{getRoomTypeName(room.room_type)}</td>
                    <td className="p-4">{room.room_number}</td>
                    <td className="p-4">{getRoomTypePrice(room.room_type)}</td>
                    <td className="p-4">{room.is_available ? "Yes" : "No"}</td>
                    <td className="gap-2">
                      <Link to={`/edit-room/${room.id}`} className="gap-2">
                        <span className="btn btn-info btn-sm">
                          <FaEye />
                        </span>
                        <span className="btn btn-warning btn-sm ml-5">
                          <FaEdit />
                        </span>
                      </Link>
                      <button
                        className="btn btn-danger btn-sm ml-5"
                        onClick={() => handleDelete(room.id)}
                      >
                        <FaTrashAlt />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <RoomPaginator
              currentPage={currentPage}
              totalPages={calculateTotalPages(filteredRooms, roomsPerPage)}
              onPageChange={handlePaginationClick}
            />
          </section>
        </>
      )}
    </>
  );
};

export default ExistingRooms;
