import React, { useEffect, useState } from "react";
import { getRoomTypeById, updateRoomType, api } from "../utils/ApiFunctions";
import { Link, useParams } from "react-router-dom";

const EditRoomType = () => {
  const [roomType, setRoomType] = useState({
    branch: "",
    type: "",
    price: "",
    number_of_beds: "",
    room_capacity: "",
    image: ""
  });

  const [branches, setBranches] = useState([]);
  const [imagePreview, setImagePreview] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const { roomTypeId } = useParams();

  const handleImageChange = (e) => {
    const selectedImage = e.target.files[0];
    setRoomType({ ...roomType, image: selectedImage });
    setImagePreview(URL.createObjectURL(selectedImage));
  };

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setRoomType({ ...roomType, [name]: value });
  };

  useEffect(() => {
    const fetchRoomType = async () => {
      try {
        const roomTypeData = await getRoomTypeById(roomTypeId);
        setRoomType(roomTypeData);
        setImagePreview(roomTypeData.image);
      } catch (error) {
        console.error(error);
        setErrorMessage("Error fetching room type details.");
      }
    };

    const fetchBranches = async () => {
      try {
        const response = await api.get("/hotel/branch/");
        setBranches(response.data);
      } catch (error) {
        console.error("Error fetching branches:", error);
        setErrorMessage("Error fetching branches.");
      }
    };

    fetchRoomType();
    fetchBranches();
  }, [roomTypeId]);

//   const handleSubmit = async (e) => {
//     e.preventDefault();

//     try {
//       const formData = new FormData();
//       formData.append("branch", roomType.branch);
//       formData.append("type", roomType.type);
//       formData.append("price", roomType.price);
//       formData.append("number_of_beds", roomType.number_of_beds);
//       formData.append("room_capacity", roomType.room_capacity);
//       if (roomType.image) formData.append("image", roomType.image);

//       const response = await updateRoomType(roomTypeId, formData);
//       if (response.status === 200) {
//         setSuccessMessage("Room type updated successfully!");
//         const updatedRoomTypeData = await getRoomTypeById(roomTypeId);
//         setRoomType(updatedRoomTypeData);
//         setImagePreview(updatedRoomTypeData.image);
//         setErrorMessage("");
//       } else {
//         setErrorMessage("Error updating room type.");
//       }
//     } catch (error) {
//       console.error(error);
//       setErrorMessage(error.message);
//     }
//   };
const handleSubmit = async (e) => {
    e.preventDefault();

    try {
        console.log('Submitting Room Type:', roomType); // Log roomType for debugging
        const response = await updateRoomType(roomTypeId, roomType);
        if (response) {
            setSuccessMessage("Room type updated successfully!");
            const updatedRoomTypeData = await getRoomTypeById(roomTypeId);
            setRoomType(updatedRoomTypeData);
            setImagePreview(updatedRoomTypeData.image);
            setErrorMessage("");
        } else {
            setErrorMessage("Error updating room type.");
        }
    } catch (error) {
        console.error(error);
        setErrorMessage(error.message);
    }
};


  return (
    <div className="container mt-5 mb-5">
      <h3 className="text-center mb-5 mt-5">Edit Room Type</h3>
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
              <label htmlFor="branch" className="form-label">
                Branch
              </label>
              <select
                required
                className="form-control"
                id="branch"
                name="branch"
                value={roomType.branch}
                onChange={handleInputChange}
              >
                <option value="">Select Branch</option>
                {branches.map((branch) => (
                  <option key={branch.id} value={branch.id}>
                    {branch.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="mb-3">
              <label htmlFor="type" className="form-label">
                Room Type
              </label>
              <input
                type="text"
                className="form-control"
                id="type"
                name="type"
                value={roomType.type}
                onChange={handleInputChange}
              />
            </div>
            <div className="mb-3">
              <label htmlFor="price" className="form-label">
                Price
              </label>
              <input
                type="text"
                className="form-control"
                id="price"
                name="price"
                value={roomType.price}
                onChange={handleInputChange}
              />
            </div>
            <div className="mb-3">
              <label htmlFor="number_of_beds" className="form-label">
                Number of Beds
              </label>
              <input
                type="text"
                className="form-control"
                id="number_of_beds"
                name="number_of_beds"
                value={roomType.number_of_beds}
                onChange={handleInputChange}
              />
            </div>
            <div className="mb-3">
              <label htmlFor="room_capacity" className="form-label">
                Room Capacity
              </label>
              <input
                type="text"
                className="form-control"
                id="room_capacity"
                name="room_capacity"
                value={roomType.room_capacity}
                onChange={handleInputChange}
              />
            </div>
            <div className="mb-3">
              <label htmlFor="image" className="form-label">
                Room Type Image
              </label>
              <input
                type="file"
                className="form-control"
                id="image"
                name="image"
                onChange={handleImageChange}
              />
            </div>
            {imagePreview && (
              <img
                src={imagePreview.replace("image/upload/", "")}
                alt="Room Type preview"
                style={{ maxWidth: "400px", maxHeight: "400px" }}
                className="mt-3"
              />
            )}
            <div className="d-grid gap-2 d-md-flex mt-2">
              <Link to={"/existing-roomtypes"} className="btn btn-outline-info ml-5">
                Back
              </Link>
              <button type="submit" className="btn btn-outline-warning">
                Edit Room Type
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditRoomType;
