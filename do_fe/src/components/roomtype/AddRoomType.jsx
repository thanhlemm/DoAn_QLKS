import React, { useState, useEffect } from "react";
import { addRoomType, uploadToCloudinary, api } from "../utils/ApiFunctions";
import { Link } from "react-router-dom";

const AddRoomType = () => {
    const [newRoomType, setNewRoomType] = useState({
        branch: "",
        type: "",
        price: "",
        number_of_beds: "",
        room_capacity: "",
        image: ""
    });

    const [branches, setBranches] = useState([]);
    const [roomTypes, setRoomTypes] = useState([]);
    const [successMessage, setSuccessMessage] = useState("");
    const [errorMessage, setErrorMessage] = useState("");
    const [imagePreview, setImagePreview] = useState("");

    const handleRoomInputChange = (e) => {
        const { name, value } = e.target;
        setNewRoomType({ ...newRoomType, [name]: value });
    };

    const handleImageChange = (e) => {
        const selectedImage = e.target.files[0];
        setNewRoomType({ ...newRoomType, image: selectedImage });
        setImagePreview(URL.createObjectURL(selectedImage));
    };

    useEffect(() => {
        const fetchBranches = async () => {
            try {
                const response = await api.get("/hotel/branch/");
                setBranches(response.data);
            } catch (error) {
                console.error("Error fetching branches:", error);
                setErrorMessage("Error fetching branches.");
            }
        };

        const fetchRoomTypes = async () => {
            try {
                const response = await api.get("/hotel/roomtypes/");
                setRoomTypes(response.data);
            } catch (error) {
                console.error("Error fetching room types:", error);
                setErrorMessage("Error fetching room types.");
            }
        };

        fetchBranches();
        fetchRoomTypes();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const photoUrl = await uploadToCloudinary(newRoomType.image);
            const success = await addRoomType(
                newRoomType.branch,
                newRoomType.type,
                newRoomType.price,
                newRoomType.number_of_beds,
                newRoomType.room_capacity,
                photoUrl
            );

            if (success) {
                setSuccessMessage("A new room type was added successfully!");
                setNewRoomType({
                    branch: "",
                    type: "",
                    price: "",
                    number_of_beds: "",
                    room_capacity: "",
                    image: ""
                });
                setImagePreview("");
                setErrorMessage("");
            } else {
                setErrorMessage("Error adding new room type");
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
        <>
            <section className="container mt-5 mb-5">
                <div className="row justify-content-center">
                    <div className="col-md-8 col-lg-6">
                        <h2 className="mt-5 mb-2">Add a New Room Type</h2>
                        {successMessage && (
                            <div className="alert alert-success fade show">{successMessage}</div>
                        )}

                        {errorMessage && <div className="alert alert-danger fade show">{errorMessage}</div>}

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
                                    value={newRoomType.branch}
                                    onChange={handleRoomInputChange}
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
                                <label htmlFor="type" className="form-label">
                                    Room Type
                                </label>
                                <input
                                    required
                                    type="text"
                                    className="form-control"
                                    id="type"
                                    name="type"
                                    value={newRoomType.type}
                                    onChange={handleRoomInputChange}
                                />
                            </div>
                            <div className="mb-3">
                                <label htmlFor="price" className="form-label">
                                    Price
                                </label>
                                <input
                                    required
                                    type="number"
                                    step="0.01"
                                    className="form-control"
                                    id="price"
                                    name="price"
                                    value={newRoomType.price}
                                    onChange={handleRoomInputChange}
                                />
                            </div>
                            <div className="mb-3">
                                <label htmlFor="number_of_beds" className="form-label">
                                    Number of Beds
                                </label>
                                <input
                                    required
                                    type="number"
                                    className="form-control"
                                    id="number_of_beds"
                                    name="number_of_beds"
                                    value={newRoomType.number_of_beds}
                                    onChange={handleRoomInputChange}
                                />
                            </div>
                            <div className="mb-3">
                                <label htmlFor="room_capacity" className="form-label">
                                    Room Capacity
                                </label>
                                <input
                                    required
                                    type="number"
                                    className="form-control"
                                    id="room_capacity"
                                    name="room_capacity"
                                    value={newRoomType.room_capacity}
                                    onChange={handleRoomInputChange}
                                />
                            </div>
                            <div className="mb-3">
                                <label htmlFor="image" className="form-label">
                                    Room Type Photo
                                </label>
                                <input
                                    required
                                    name="image"
                                    id="image"
                                    type="file"
                                    className="form-control"
                                    onChange={handleImageChange}
                                />
                                {imagePreview && (
                                    <img
                                        src={imagePreview}
                                        alt="Preview room photo"
                                        style={{ maxWidth: "400px", maxHeight: "400px" }}
                                        className="mb-3"
                                    />
                                )}
                            </div>
                            <div className="d-grid gap-2 d-md-flex mt-2">
                                <Link to={"/existing-roomtypes"} className="btn btn-outline-info">
                                    Existing room types
                                </Link>
                                <button type="submit" className="btn btn-outline-primary ml-5">
                                    Save Room Type
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </section>
        </>
    );
};

export default AddRoomType;
