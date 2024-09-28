// import React, { useEffect, useState } from "react";
// import { getUser, updateEmployee, api, endpoints } from "../utils/ApiFunctions"; 
// import { Link, useParams } from "react-router-dom";
// import RoleSelector from "./RoleSelector";

// const EditEmployee = () => {
//     const [employee, setEmployee] = useState({
//         username: "",
//         first_name: "",
//         last_name: "",
//         DOB: "",
//         address: "",
//         phone: "",
//         email: "",
//         sex: "",
//         role: "",
//     });

//     const [imagePreview, setImagePreview] = useState("");
//     const [successMessage, setSuccessMessage] = useState("");
//     const [errorMessage, setErrorMessage] = useState("");
//     const { employeeId } = useParams();
//     const [roles, setRoles] = useState([]);



//     const handleImageChange = (e) => {
//         const selectedImage = e.target.files[0];
//         setEmployee({ ...employee, avatar: selectedImage });
//         setImagePreview(URL.createObjectURL(selectedImage));
//     };

//     const handleInputChange = (event) => {
//         const { name, value } = event.target;
//         setEmployee({ ...employee, [name]: value });
//     };

//     useEffect(() => {
//         const fetchEmployee = async () => {
//             try {
//                 const employeeData = await getUser(employeeId);
//                 setEmployee(employeeData);
//                 setImagePreview(employeeData.avatar);
//             } catch (error) {
//                 console.error(error);
//             }
//         };

//         const fetchRoles = async () => {
//             try {
//               const response = await api.get(endpoints.getRoles);
//               setRoles(response.data);
//             } catch (error) {
//               console.error("Error fetching roles:", error);
//               setErrorMessage("Error fetching roles.");
//             }
//           };
      
//           fetchRoles();

//         fetchEmployee();
//     }, [employeeId]);

//     const handleSubmit = async (e) => {
//         e.preventDefault();
    
//         try {
//             console.log(employee)
//             const response = await updateEmployee(employeeId, employee);
//             console.log(response);
    
//             if (response.status === 200) {
//                 setSuccessMessage("Employee updated successfully!");
//                 const updatedEmployeeData = await getUser(employeeId);
//                 setEmployee(updatedEmployeeData);
//                 setImagePreview(updatedEmployeeData.avatar);
//                 setErrorMessage("");
//             } else {
//                 setErrorMessage("Error updating employee");
//             }
//         } catch (error) {
//             console.error('Error:', error.response || error.message);
//             setErrorMessage("Error updating employee: " + (error.response ? error.response.data : error.message));
//         }
//     };

//     return (
//         <div className="container mt-5 mb-5">
//             <h3 className="text-center mb-5 mt-5">Edit Employee</h3>
//             <div className="row justify-content-center">
//                 <div className="col-md-8 col-lg-6">
//                     {successMessage && (
//                         <div className="alert alert-success" role="alert">
//                             {successMessage}
//                         </div>
//                     )}
//                     {errorMessage && (
//                         <div className="alert alert-danger" role="alert">
//                             {errorMessage}
//                         </div>
//                     )}
//                     <form onSubmit={handleSubmit}>
//                         <div className="mb-3">
//                             <label htmlFor="username" className="form-label">
//                                 Username
//                             </label>
//                             <input
//                                 type="text"
//                                 className="form-control"
//                                 id="username"
//                                 name="username"
//                                 value={employee.username}
//                                 onChange={handleInputChange}
//                             />
//                         </div>
//                         <div className="mb-3">
//                             <label htmlFor="first_name" className="form-label">
//                                 First Name
//                             </label>
//                             <input
//                                 type="text"
//                                 className="form-control"
//                                 id="first_name"
//                                 name="first_name"
//                                 value={employee.first_name}
//                                 onChange={handleInputChange}
//                             />
//                         </div>
//                         <div className="mb-3">
//                             <label htmlFor="last_name" className="form-label">
//                                 Last Name
//                             </label>
//                             <input
//                                 type="text"
//                                 className="form-control"
//                                 id="last_name"
//                                 name="last_name"
//                                 value={employee.last_name}
//                                 onChange={handleInputChange}
//                             />
//                         </div>
//                         <div className="mb-3">
//                             <label htmlFor="DOB" className="form-label">
//                                 Date of Birth
//                             </label>
//                             <input
//                                 type="date"
//                                 className="form-control"
//                                 id="DOB"
//                                 name="DOB"
//                                 value={employee.DOB}
//                                 onChange={handleInputChange}
//                             />
//                         </div>
//                         <div className="mb-3">
//                             <label htmlFor="address" className="form-label">
//                                 Address
//                             </label>
//                             <input
//                                 type="text"
//                                 className="form-control"
//                                 id="address"
//                                 name="address"
//                                 value={employee.address}
//                                 onChange={handleInputChange}
//                             />
//                         </div>
//                         <div className="mb-3">
//                             <label htmlFor="phone" className="form-label">
//                                 Phone
//                             </label>
//                             <input
//                                 type="text"
//                                 className="form-control"
//                                 id="phone"
//                                 name="phone"
//                                 value={employee.phone}
//                                 onChange={handleInputChange}
//                             />
//                         </div>
//                         <div className="mb-3">
//                             <label htmlFor="email" className="form-label">
//                                 Email
//                             </label>
//                             <input
//                                 type="email"
//                                 className="form-control"
//                                 id="email"
//                                 name="email"
//                                 value={employee.email}
//                                 onChange={handleInputChange}
//                             />
//                         </div>
//                         <div className="mb-3">
//                             <label htmlFor="sex" className="form-label">
//                                 Gender
//                             </label>
//                             <select
//                                 className="form-select"
//                                 id="sex"
//                                 name="sex"
//                                 value={employee.sex}
//                                 onChange={handleInputChange}
//                             >
//                                 <option value="">Select Gender</option>
//                                 <option value="1">Male</option>
//                                 <option value="2">Female</option>
//                             </select>
//                         </div>
//                         <div className="mb-3">
//                             <label htmlFor="role" className="form-label">
//                                 Role
//                             </label>
//                             <RoleSelector
//                                 handleRoleChange={handleInputChange}
//                                 selectedRole={employee.role}
//                                 roles={roles}
//                             />
//                         </div>
//                         <div className="mb-3">
//                             <label htmlFor="avatar" className="form-label">
//                                 Avatar
//                             </label>
//                             <input
//                                 type="file"
//                                 className="form-control"
//                                 id="avatar"
//                                 name="avatar"
//                                 onChange={handleImageChange}
//                             />
//                             {imagePreview && (
//                                 <img
//                                     src={imagePreview}
//                                     alt="Avatar Preview"
//                                     style={{ maxWidth: "400px", maxHeight: "400px" }}
//                                     className="mt-3"
//                                 />
//                             )}
//                         </div>
//                         <div className="d-grid gap-2 d-md-flex mt-2">
//                             <Link to={"/existing-employees"} className="btn btn-outline-info ml-5">
//                                 Back
//                             </Link>
//                             <button type="submit" className="btn btn-outline-warning">
//                                 Edit Employee
//                             </button>
//                         </div>
//                     </form>
//                 </div>
//             </div>
//         </div>
//     );
// };

// export default EditEmployee;
import React, { useEffect, useState } from "react";
import { getUser, updateEmployee, api, endpoints } from "../utils/ApiFunctions"; 
import { Link, useParams } from "react-router-dom";
import RoleSelector from "./RoleSelector";

const EditEmployee = () => {
    const [employee, setEmployee] = useState({
        username: "",
        first_name: "",
        last_name: "",
        DOB: "",
        address: "",
        phone: "",
        email: "",
        sex: "",
        role: "",
        avatar: null,
        branch: "",
    });

    const [imagePreview, setImagePreview] = useState("");
    const [successMessage, setSuccessMessage] = useState("");
    const [errorMessage, setErrorMessage] = useState("");
    const { employeeId } = useParams();
    const [roles, setRoles] = useState([]);
    const [branches, setBranches] = useState([]);

    // Handle image change for preview
    const handleImageChange = (e) => {
        const selectedImage = e.target.files[0];
        if (selectedImage) {
            setEmployee({ ...employee, avatar: selectedImage });
            setImagePreview(URL.createObjectURL(selectedImage));
        }
    };

    // Handle input changes for form fields
    const handleInputChange = (event) => {
        const { name, value } = event.target;
        setEmployee({ ...employee, [name]: value });
    };

    // Fetch roles and employee data
    useEffect(() => {
        const fetchEmployee = async () => {
            try {
                const employeeData = await getUser(employeeId);
                setEmployee(employeeData);
                setImagePreview(employeeData.avatar);
            } catch (error) {
                setErrorMessage("Error fetching employee data.");
                console.error("Fetch employee error:", error);
            }
        };

        const fetchRoles = async () => {
            try {
                const response = await api.get(endpoints.getRoles);
                setRoles(response.data);
            } catch (error) {
                setErrorMessage("Error fetching roles.");
                console.error("Error fetching roles:", error);
            }
        };

        const fetchBranches = async () => {
            try {
                const response = await api.get(endpoints.getBranches);  // Fetch branches
                setBranches(response.data);
            } catch (error) {
                console.error("Error fetching branches:", error);
                setErrorMessage("Error fetching branches.");
            }
        };

        fetchEmployee();
        fetchRoles();
        fetchBranches();
    }, [employeeId]);

    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            console.log(employee)
            const response = await updateEmployee(employeeId, employee);
            if (response.status === 200) {
                setSuccessMessage("Employee updated successfully!");
                const updatedEmployeeData = await getUser(employeeId);
                setEmployee(updatedEmployeeData);
                setImagePreview(updatedEmployeeData.avatar);
                setErrorMessage("");
            } else {
                setErrorMessage("Error updating employee.");
            }
        } catch (error) {
            setErrorMessage("Error updating employee: " + (error.response ? error.response.data : error.message));
            console.error('Error updating employee:', error.response || error.message);
        }
    };

    return (
        <div className="container mt-5 mb-5">
            <h3 className="text-center mb-5 mt-5">Edit Employee</h3>
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
                            <label htmlFor="username" className="form-label">Username</label>
                            <input
                                type="text"
                                className="form-control"
                                id="username"
                                name="username"
                                value={employee.username}
                                onChange={handleInputChange}
                            />
                        </div>
                        <div className="mb-3">
                            <label htmlFor="first_name" className="form-label">First Name</label>
                            <input
                                type="text"
                                className="form-control"
                                id="first_name"
                                name="first_name"
                                value={employee.first_name}
                                onChange={handleInputChange}
                            />
                        </div>
                        <div className="mb-3">
                            <label htmlFor="last_name" className="form-label">Last Name</label>
                            <input
                                type="text"
                                className="form-control"
                                id="last_name"
                                name="last_name"
                                value={employee.last_name}
                                onChange={handleInputChange}
                            />
                        </div>
                        <div className="mb-3">
                            <label htmlFor="DOB" className="form-label">Date of Birth</label>
                            <input
                                type="date"
                                className="form-control"
                                id="DOB"
                                name="DOB"
                                value={employee.DOB}
                                onChange={handleInputChange}
                            />
                        </div>
                        <div className="mb-3">
                            <label htmlFor="address" className="form-label">Address</label>
                            <input
                                type="text"
                                className="form-control"
                                id="address"
                                name="address"
                                value={employee.address}
                                onChange={handleInputChange}
                            />
                        </div>
                        <div className="mb-3">
                            <label htmlFor="phone" className="form-label">Phone</label>
                            <input
                                type="text"
                                className="form-control"
                                id="phone"
                                name="phone"
                                value={employee.phone}
                                onChange={handleInputChange}
                            />
                        </div>
                        <div className="mb-3">
                            <label htmlFor="email" className="form-label">Email</label>
                            <input
                                type="email"
                                className="form-control"
                                id="email"
                                name="email"
                                value={employee.email}
                                onChange={handleInputChange}
                            />
                        </div>
                        <div className="mb-3">
                            <label htmlFor="sex" className="form-label">Gender</label>
                            <select
                                className="form-select"
                                id="sex"
                                name="sex"
                                value={employee.sex}
                                onChange={handleInputChange}
                            >
                                <option value="">Select Gender</option>
                                <option value="1">Male</option>
                                <option value="2">Female</option>
                            </select>
                        </div>
                        <div className="mb-3">
                            <label htmlFor="role" className="form-label">Role</label>
                            <RoleSelector
                                handleRoleChange={handleInputChange}
                                selectedRole={employee.role}
                                roles={roles}
                            />
                        </div>
                        <div className="mb-3">
                            <label htmlFor="branch" className="form-label">Branch</label>
                            <select
                                className="form-select"
                                id="branch"
                                name="branch"
                                value={employee.branch}  
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
                            <label htmlFor="avatar" className="form-label">Avatar</label>
                            <input
                                type="file"
                                className="form-control"
                                id="avatar"
                                name="avatar"
                                onChange={handleImageChange}
                            />
                            {imagePreview && (
                                <img
                                    src={imagePreview}
                                    alt="Avatar Preview"
                                    style={{ maxWidth: "400px", maxHeight: "400px" }}
                                    className="mt-3"
                                />
                            )}
                        </div>
                        <div className="d-grid gap-2 d-md-flex mt-2">
                            <Link to="/existing-employees" className="btn btn-outline-info ml-5">
                                Back
                            </Link>
                            <button type="submit" className="btn btn-outline-warning">
                                Edit Employee
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default EditEmployee;
