import React, { useState, useEffect } from "react";
import { addEmployee, uploadToCloudinary, api, endpoints } from "../utils/ApiFunctions";
import RoleSelector from "./RoleSelector";
import { Link } from "react-router-dom";

const AddEmployee = () => {
  const [newEmployee, setNewEmployee] = useState({
    username: "",
    first_name: "", // Changed from 'name' to 'first_name' and added 'last_name'
    last_name: "",
    DOB: "", // Date of Birth
    address: "",
    phone: "",
    email: "",
    sex: 1, // Assuming 1 for male, adjust as needed
    role: "", // Role ID or name
    password: "123456", // Default password
    isActive: true,
    avatar: null,
  });

  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [imagePreview, setImagePreview] = useState("");
  const [roles, setRoles] = useState([]);

  useEffect(() => {
    // Fetch roles from the API
    const fetchRoles = async () => {
      try {
        const response = await api.get(endpoints.getRoles);
        setRoles(response.data);
      } catch (error) {
        console.error("Error fetching roles:", error);
        setErrorMessage("Error fetching roles.");
      }
    };

    fetchRoles();
  }, []);

  const handleEmployeeInputChange = (e) => {
    const { name, value } = e.target;
    setNewEmployee({ ...newEmployee, [name]: value });
  };

  const handleImageChange = (e) => {
    const selectedImage = e.target.files[0];
    setNewEmployee({ ...newEmployee, avatar: selectedImage });
    setImagePreview(URL.createObjectURL(selectedImage));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("New Employee Data:", newEmployee);
    try {
      const photoUrl = await uploadToCloudinary(newEmployee.avatar);
      const success = await addEmployee(
        newEmployee.username,
        newEmployee.first_name, // Changed from 'name' to 'first_name'
        newEmployee.last_name,
        newEmployee.DOB,
        newEmployee.address,
        newEmployee.phone,
        newEmployee.email,
        newEmployee.sex,
        newEmployee.role,
        newEmployee.password,
        newEmployee.isActive,
        newEmployee.avatar
      );
      console.log("API response:", success);
      if (success) {
        setSuccessMessage("A new employee was added successfully!");
        setNewEmployee({
          username: "",
          first_name: "",
          last_name: "",
          DOB: "",
          address: "",
          phone: "",
          email: "",
          sex: "",
          role: "",
          password: "123456",
          isActive: true,
          avatar: photoUrl,
        });
        setImagePreview("");
        setErrorMessage("");
      } else {
        setErrorMessage("Error adding new employee");
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
            <h2 className="mt-5 mb-2">Add a New Employee</h2>
            {successMessage && (
              <div className="alert alert-success fade show">{successMessage}</div>
            )}

            {errorMessage && <div className="alert alert-danger fade show">{errorMessage}</div>}

            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label htmlFor="username" className="form-label">
                  Username
                </label>
                <input
                  required
                  type="text"
                  className="form-control"
                  id="username"
                  name="username"
                  value={newEmployee.username}
                  onChange={handleEmployeeInputChange}
                />
              </div>
              <div className="mb-3">
                <label htmlFor="first_name" className="form-label">
                  First Name
                </label>
                <input
                  required
                  type="text"
                  className="form-control"
                  id="first_name"
                  name="first_name"
                  value={newEmployee.first_name}
                  onChange={handleEmployeeInputChange}
                />
              </div>
              <div className="mb-3">
                <label htmlFor="last_name" className="form-label">
                  Last Name
                </label>
                <input
                  required
                  type="text"
                  className="form-control"
                  id="last_name"
                  name="last_name"
                  value={newEmployee.last_name}
                  onChange={handleEmployeeInputChange}
                />
              </div>
              <div className="mb-3">
                <label htmlFor="DOB" className="form-label">
                  Date of Birth
                </label>
                <input
                  type="date"
                  className="form-control"
                  id="DOB"
                  name="DOB"
                  value={newEmployee.DOB}
                  onChange={handleEmployeeInputChange}
                />
              </div>
              <div className="mb-3">
                <label htmlFor="address" className="form-label">
                  Address
                </label>
                <input
                  type="text"
                  className="form-control"
                  id="address"
                  name="address"
                  value={newEmployee.address}
                  onChange={handleEmployeeInputChange}
                />
              </div>
              <div className="mb-3">
                <label htmlFor="phone" className="form-label">
                  Phone
                </label>
                <input
                  type="text"
                  className="form-control"
                  id="phone"
                  name="phone"
                  value={newEmployee.phone}
                  onChange={handleEmployeeInputChange}
                />
              </div>
              <div className="mb-3">
                <label htmlFor="email" className="form-label">
                  Email
                </label>
                <input
                  required
                  type="email"
                  className="form-control"
                  id="email"
                  name="email"
                  value={newEmployee.email}
                  onChange={handleEmployeeInputChange}
                />
              </div>
              <div className="mb-3">
                <label htmlFor="sex" className="form-label">
                  Sex
                </label>
                <select
                  className="form-control"
                  id="sex"
                  name="sex"
                  value={newEmployee.sex}
                  onChange={handleEmployeeInputChange}
                >
                  <option value={1}>Male</option>
                  <option value={2}>Female</option>
                </select>
              </div>
              <div className="mb-3">
                <label htmlFor="role" className="form-label">
                  Role
                </label>
                <RoleSelector
                  handleRoleChange={handleEmployeeInputChange}
                  selectedRole={newEmployee.role}
                  roles={roles}
                />
              </div>
              <div className="mb-3">
                <label htmlFor="avatar" className="form-label">
                  Avatar
                </label>
                <input
                  type="file"
                  className="form-control"
                  id="avatar"
                  name="avatar"
                  onChange={handleImageChange}
                />
                {imagePreview && <img src={imagePreview} alt="Avatar Preview" className="mt-3" />}
              </div>
              <div className="d-grid gap-2 d-md-flex mt-2">
                <Link to={"/existing-employees"} className="btn btn-outline-info">
                  Existing employees
                </Link>
                <button type="submit" className="btn btn-outline-primary ml-5">
                  Save Employee
                </button>
              </div>
            </form>
          </div>
        </div>
      </section>
    </>
  );
};

export default AddEmployee;
