import React, { useEffect, useState } from "react";
import { deleteCoupon, api } from "../utils/ApiFunctions";
import { Col, Row } from "react-bootstrap";
import RoomPaginator from "../common/RoomPaginator";
import { FaEdit, FaEye, FaPlus, FaTrashAlt } from "react-icons/fa";
import { Link } from "react-router-dom";

const ExistingCoupons = () => {
  const [coupons, setCoupons] = useState([]);
  const [filteredCoupons, setFilteredCoupons] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [couponsPerPage] = useState(8);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    fetchCoupons();
  }, []);

  const fetchCoupons = async () => {
    setIsLoading(true);
    try {
      const result = await api.get("/hotel/coupon/");
      setCoupons(result.data);
      setFilteredCoupons(result.data);
      setIsLoading(false);
    } catch (error) {
      setErrorMessage(error.message);
      setIsLoading(false);
    }
  };

  const handleDelete = async (couponId) => {
    try {
      const result = await deleteCoupon(couponId);
      console.log(result)
      if (result.success === true) {
        setSuccessMessage(`Coupon ${couponId} was deleted`);
        fetchCoupons();
      } else {
        console.error(`Error deleting coupon: ${result.message}`);
      }
    } catch (error) {
      setErrorMessage(error.message);
    }
    setTimeout(() => {
      setSuccessMessage("");
      setErrorMessage("");
    }, 3000);
  };

  const calculateTotalPages = (filteredCoupons, couponsPerPage) => {
    const totalCoupons = filteredCoupons.length;
    return Math.ceil(totalCoupons / couponsPerPage);
  };
  const handlePaginationClick = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const indexOfLastCoupon = currentPage * couponsPerPage;
  const indexOfFirstCoupon = indexOfLastCoupon - couponsPerPage;
  const currentCoupons = filteredCoupons.slice(indexOfFirstCoupon, indexOfLastCoupon);

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
        <p>Loading existing coupons</p>
      ) : (
        <>
          <section className="flex-1 p-10 bg-neutral-50">
            <div className="d-flex justify-content-between mb-3 mt-5">
              <h2>Existing Coupons</h2>
            </div>

            <Row>
              <Col
                className="d-flex justify-content-md-end justify-content-center mb-3"
              >
                <Link
                  to={"/add-coupon"}
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
                  <FaPlus style={{ marginRight: "0.5rem" }} /> Add Coupon
                </Link>
              </Col>
            </Row>

            <table className="w-full border-collapse bg-neutral-50 shadow-md rounded-lg overflow-hidden" style={{borderRadius: "24px"}}>
              <thead>
                <tr className="bg-neutral-100 border-b border-neutral-300">
                  <th className="p-4 text-center">ID</th>
                  <th className="p-4 text-center">Code</th>
                  <th className="p-4 text-center">Type</th>
                  <th className="p-4 text-center">Discount</th>
                  <th className="p-4 text-center">Redemptions</th>
                  <th className="p-4 text-center">Max Redemptions</th>
                  <th className="p-4 text-center">Valid From</th>
                  <th className="p-4 text-center">Valid To</th>
                  <th className="p-4 text-center">Actions</th>
                </tr>
              </thead>

              <tbody>
                {coupons.map((coupon) => (
                  <tr key={coupon.id} className="border-b border-neutral-300 hover:bg-neutral-100">
                    <td >{coupon.id}</td>
                    <td className="p-4">{coupon.code}</td>
                    <td >{coupon.type}</td>
                    <td >{coupon.discount}{coupon.type === 'percentage' ? '%' : ''}</td>
                    <td >{coupon.redemptions}</td>
                    <td >{coupon.max_redemptions}</td>
                    <td >{new Date(coupon.valid_from).toLocaleDateString()}</td>
                    <td className="p-4">{new Date(coupon.valid_to).toLocaleDateString()}</td>
                    <td className="gap-2">
                      <Link to={`/edit-coupon/${coupon.id}`} className="gap-2">
                        <span className="btn btn-info btn-sm">
                          <FaEye />
                        </span>
                        <span className="btn btn-warning btn-sm ml-5">
                          <FaEdit />
                        </span>
                      </Link>
                      <button
                        className="btn btn-danger btn-sm ml-5"
                        onClick={() => handleDelete(coupon.id)}
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
              totalPages={calculateTotalPages(filteredCoupons, couponsPerPage)}
              onPageChange={handlePaginationClick}
            />
          </section>
        </>
      )}
    </>
  );
};

export default ExistingCoupons;
