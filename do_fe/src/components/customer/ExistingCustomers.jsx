import React, { useEffect, useState } from "react";
import { endpoints, api, authAPI } from "../utils/ApiFunctions";
import { Row, Col } from "react-bootstrap";
import { FaEdit, FaEye, FaPlus, FaTrashAlt } from "react-icons/fa";
import { Link } from "react-router-dom";

const ExistingCustomers = () => {
    const [customers, setCustomers] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [customersPerPage] = useState(8);
    const [isLoading, setIsLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const [successMessage, setSuccessMessage] = useState("");

    useEffect(() => {
        fetchCustomers();
    }, []);

    const fetchCustomers = async () => {
        setIsLoading(true);
        try {
            const response = await api.get(endpoints.getEmployees); // Replace with the correct endpoint if needed
            const result = response.data;

            if (Array.isArray(result)) {
                const filteredResult = result.filter(
                    (customer) => customer.role.name === "Khách hàng"
                );
                setCustomers(filteredResult);
            } else {
                console.error("API response is not an array");
            }
            setIsLoading(false);
        } catch (error) {
            setErrorMessage(error.message);
            setIsLoading(false);
        }
    };

    const handleDelete = async (customerId) => {
        try {
            const response = await authAPI().delete(endpoints.deleteCustomer(customerId));

            if (response.status === 204) {
                setSuccessMessage(`Customer No ${customerId} was deleted`);
                fetchCustomers(); // Refresh the customer list
            } else {
                console.error(`Error deleting customer: ${response.data.message}`);
            }
        } catch (error) {
            console.error("Error:", error.response || error.message);
            setErrorMessage("Error deleting customer: " + (error.response ? error.response.data : error.message));
        }

        // Clear messages after a delay
        setTimeout(() => {
            setSuccessMessage("");
            setErrorMessage("");
        }, 3000);
    };

    const calculateTotalPages = (customers, customersPerPage) => {
        return Math.ceil(customers.length / customersPerPage);
    };

    const indexOfLastCustomer = currentPage * customersPerPage;
    const indexOfFirstCustomer = indexOfLastCustomer - customersPerPage;
    const currentCustomers = customers.slice(indexOfFirstCustomer, indexOfLastCustomer);

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
                <p>Loading existing customers</p>
            ) : (
                <>
                    <section className="mt-5 mb-5 container">
                        <div className="d-flex justify-content-between mb-3 mt-5">
                            <h2>Existing Customers</h2>
                        </div>

                        <Row>
                            <Col
                                md={6}
                                className="d-flex justify-content-md-end justify-content-center mb-3"
                            >
                                <Link
                                    to={"/add-customer"}
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
                                    <FaPlus style={{ marginRight: "0.5rem" }} /> Add Customer
                                </Link>
                            </Col>
                        </Row>

                        <table className="w-full border-collapse bg-neutral-50 shadow-md rounded-lg overflow-hidden" style={{ borderRadius: "24px" }}>
                            <thead>
                                <tr className="bg-neutral-100 border-b border-neutral-300">
                                    <th className="p-4 text-center">ID</th>
                                    <th className="p-4 text-center">User name</th>
                                    <th className="p-4 text-center">First name</th>
                                    <th className="p-4 text-center">Last name</th>
                                    <th className="p-4 text-center">Role</th>
                                    <th className="p-4 text-center">Actions</th>
                                </tr>
                            </thead>

                            <tbody>
                                {currentCustomers.map((customer) => (
                                    <tr key={customer.id} className="border-b border-neutral-300 hover:bg-neutral-100">
                                        <td className="p-4">{customer.id}</td>
                                        <td className="p-4">{customer.username}</td>
                                        <td className="p-4">{customer.first_name}</td>
                                        <td className="p-4">{customer.last_name}</td>
                                        <td className="p-4">{customer.role?.name}</td>
                                        <td className="gap-2">
                                            <Link to={`/edit-customer/${customer.id}`} className="gap-2">
                                                <span className="btn btn-info btn-sm">
                                                    <FaEye />
                                                </span>
                                                <span className="btn btn-warning btn-sm ml-5">
                                                    <FaEdit />
                                                </span>
                                            </Link>
                                            <button
                                                className="btn btn-danger btn-sm ml-5"
                                                onClick={() => handleDelete(customer.id)}
                                            >
                                                <FaTrashAlt />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </section>
                </>
            )}
        </>
    );
};

export default ExistingCustomers;
