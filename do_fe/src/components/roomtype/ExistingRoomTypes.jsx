import React, { useEffect, useState } from "react";
import { deleteRoomType, getRoomTypes } from "../utils/ApiFunctions";
import { Col, Row } from "react-bootstrap";
import RoomFilter from "../common/RoomFilter";
import RoomPaginator from "../common/RoomPaginator";
import { FaEdit, FaEye, FaPlus, FaTrashAlt } from "react-icons/fa";
import { Link } from "react-router-dom";

const ExistingRoomTypes = () => {
  const [roomTypes, setRoomTypes] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [roomTypesPerPage] = useState(8);
  const [isLoading, setIsLoading] = useState(false);
  const [filteredRooms, setFilteredRooms] = useState([
    // { id: "", roomType: "", status: ""},
  ]);
  const [selectedRoomType, setSelectedRoomType] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    fetchRoomTypes();
  }, []);

  const fetchRoomTypes = async () => {
    setIsLoading(true);
    try {
      const result = await getRoomTypes();
      const activeRoomTypes = result.filter(roomType => roomType.active);

      setRoomTypes(activeRoomTypes);
      setIsLoading(false);
    } catch (error) {
      setErrorMessage(error.message);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (selectedRoomType === "") {
      setFilteredRooms(roomTypes);
    } else {
      const filteredRooms = rooms.filter(
        (roomTypes) => roomTypes.nameRoomType === selectedRoomType
      );
      setFilteredRooms(filteredRooms);
    }
    setCurrentPage(1);
  }, [roomTypes, selectedRoomType]);

  const handlePaginationClick = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const handleDelete = async (roomTypeId) => {
    try {
      const result = await deleteRoomType(roomTypeId);
      console.log(result);

      if (result.success) {
        setSuccessMessage(`RoomType No ${roomTypeId} was deleted`);
        fetchRoomTypes();
      } else {
        console.error(`Error deleting room type: ${result.message}`);
        setErrorMessage(result.message);
      }
    } catch (error) {
      setErrorMessage(error.message);
    }
    setTimeout(() => {
      setSuccessMessage("");
      setErrorMessage("");
    }, 3000);
  };


  const calculateTotalPages = (filteredRoomTypes, roomTypesPerPage, roomTypes) => {
    const totalRoomTypes =
      filteredRoomTypes.length > 0 ? filteredRoomTypes.length : roomTypes.length;
    return Math.ceil(totalRoomTypes / roomTypesPerPage);
  };

  const indexOfLastRoomType = currentPage * roomTypesPerPage;
  const indexOfFirstRoomType = indexOfLastRoomType - roomTypesPerPage;
  const currentRoomTypes = filteredRooms.slice(indexOfFirstRoomType, indexOfLastRoomType);

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
        <p>Loading existing roomTypes</p>
      ) : (
        <>
          <section className="mt-5 mb-5 container">
            <div className="d-flex justify-content-between mb-3 mt-5">
              <h2>Existing RoomTypes</h2>
            </div>

            <Row>

              <Col
                md={6}
                className="d-flex justify-content-md-end justify-content-center mb-3"
              >
                <Link
                  to={"/add-roomtype"}
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
                  <FaPlus style={{ marginRight: "0.5rem" }} /> Add RoomType
                </Link>
              </Col>
            </Row>

            <table className="w-full border-collapse bg-neutral-50 shadow-md rounded-lg overflow-hidden" style={{ borderRadius: "24px" }}>
              <thead>
                <tr className="bg-neutral-100 border-b border-neutral-300">
                  <th className="p-4 text-center">ID</th>
                  <th className="p-4 text-center">Name Room Type</th>
                  <th className="p-4 text-center"> Price</th>
                  <th className="p-4 text-center"> Bed </th>
                  <th className="p-4 text-center"> Quantity</th>
                  <th className="p-4 text-center">Image</th>
                  <th className="p-4 text-center">Actions</th>
                </tr>
              </thead>

              <tbody>
                {currentRoomTypes.map((roomType) => (
                  <tr key={roomType.id} className="border-b border-neutral-300 hover:bg-neutral-100">
                    <td className="p-4">{roomType.id}</td>
                    <td className="p-4">{roomType.type}</td>
                    <td className="p-4">{roomType.price}</td>
                    <td className="p-4">{roomType.number_of_beds}</td>
                    <td className="p-4">{roomType.room_capacity}</td>
                    <td className="p-4">{roomType.image ? (
                      <img
                        src={roomType.image.replace("image/upload/", "")}
                        alt={`Image of ${roomType.type}`}
                        style={{ maxWidth: "100px", maxHeight: "100px" }}
                      />
                    ) : (
                      "No Image"
                    )}</td>
                    <td className="gap-2">
                      <Link to={`/edit-roomtype/${roomType.id}`} className="gap-2">
                        <span className="btn btn-info btn-sm">
                          <FaEye />
                        </span>
                        <span className="btn btn-warning btn-sm ml-5">
                          <FaEdit />
                        </span>
                      </Link >
                      <button
                        className="btn btn-danger btn-sm ml-5"
                        onClick={() => handleDelete(roomType.id)}
                      >
                        <FaTrashAlt />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {/* <RoomPaginator
              currentPage={currentPage}
              totalPages={calculateTotalPages(
                filteredRoomTypes,
                roomTypesPerPage,
                roomTypes
              )}
              onPageChange={handlePaginationClick}
            /> */}
          </section>
        </>
      )}
    </>
  );
};

export default ExistingRoomTypes;
