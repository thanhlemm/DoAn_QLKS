import React, { useEffect, useState } from "react";
import { api, endpoints } from "../utils/ApiFunctions"; // Assuming you have these functions
import { Link, useParams } from "react-router-dom";

const EditCoupon = () => {
  const [coupon, setCoupon] = useState({
    code: "",
    type: "percentage",
    discount: "",
    redemptions: 0,
    valid_from: "",
    valid_to: "",
    max_redemptions: 100
  });

  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const { couponId } = useParams();

  useEffect(() => {
    const fetchCoupon = async () => {
      try {
        const couponData = await api.get(endpoints.get_couponByID(couponId));
        setCoupon(couponData.data);
      } catch (error) {
        console.error(error);
        setErrorMessage("Error fetching coupon data.");
      }
    };

    fetchCoupon();
  }, [couponId]);

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setCoupon({ ...coupon, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await api.patch(`/hotel/coupon/${couponId}/`, coupon);
      if (response.status === 200) {
        setSuccessMessage("Coupon updated successfully!");
        const updatedCouponData = await api.get(endpoints.get_couponByID(couponId));
        setCoupon(updatedCouponData.data);
        setErrorMessage("");
      } else {
        setErrorMessage("Error updating coupon");
      }
    } catch (error) {
      console.error(error);
      setErrorMessage(error.message);
    }

    setTimeout(() => {
      setSuccessMessage("");
      setErrorMessage("");
    }, 3000);
  };

  return (
    <div className="container mt-5 mb-5">
      <h3 className="text-center mb-5 mt-5">Edit Coupon</h3>
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
              <label htmlFor="code" className="form-label">
                Coupon Code
              </label>
              <input
                type="text"
                className="form-control"
                id="code"
                name="code"
                value={coupon.code}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="mb-3">
              <label htmlFor="type" className="form-label">
                Coupon Type
              </label>
              <select
                className="form-control"
                id="type"
                name="type"
                value={coupon.type}
                onChange={handleInputChange}
                required
              >
                <option value="percentage">Percentage</option>
                <option value="fixed">Fixed Amount</option>
              </select>
            </div>
            <div className="mb-3">
              <label htmlFor="discount" className="form-label">
                Discount
              </label>
              <input
                type="number"
                className="form-control"
                id="discount"
                name="discount"
                value={coupon.discount}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="mb-3">
              <label htmlFor="redemptions" className="form-label">
                Redemptions
              </label>
              <input
                type="number"
                className="form-control"
                id="redemptions"
                name="redemptions"
                value={coupon.redemptions}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="mb-3">
              <label htmlFor="valid_from" className="form-label">
                Valid From
              </label>
              <input
                type="datetime-local"
                className="form-control"
                id="valid_from"
                name="valid_from"
                value={coupon.valid_from}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="mb-3">
              <label htmlFor="valid_to" className="form-label">
                Valid To
              </label>
              <input
                type="datetime-local"
                className="form-control"
                id="valid_to"
                name="valid_to"
                value={coupon.valid_to}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="mb-3">
              <label htmlFor="max_redemptions" className="form-label">
                Max Redemptions
              </label>
              <input
                type="number"
                className="form-control"
                id="max_redemptions"
                name="max_redemptions"
                value={coupon.max_redemptions}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="d-grid gap-2 d-md-flex mt-2">
              <Link to={"/existing-coupons"} className="btn btn-outline-info ml-5">
                Back
              </Link>
              <button type="submit" className="btn btn-outline-warning">
                Edit Coupon
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditCoupon;
