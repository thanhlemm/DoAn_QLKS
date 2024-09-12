import React, { useState, useEffect } from "react";
import { addCoupon, api } from "../utils/ApiFunctions";
import { Link } from "react-router-dom";

const AddCoupon = () => {
  const [newCoupon, setNewCoupon] = useState({
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

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setNewCoupon({ ...newCoupon, [name]: type === 'checkbox' ? checked : value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const success = await api.post('/hotel/coupon/', newCoupon);
      if (success) {
        setSuccessMessage("A new coupon was added successfully!");
        setNewCoupon({
          code: "",
          type: "percentage",
          discount: "",
          redemptions: 0,
          valid_from: "",
          valid_to: "",
          max_redemptions: 100
        });
        setErrorMessage("");
      } else {
        setErrorMessage("Error adding new coupon");
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
            <h2 className="mt-5 mb-2">Add a New Coupon</h2>
            {successMessage && (
              <div className="alert alert-success fade show">{successMessage}</div>
            )}

            {errorMessage && <div className="alert alert-danger fade show">{errorMessage}</div>}

            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label htmlFor="code" className="form-label">
                  Coupon Code
                </label>
                <input
                  required
                  type="text"
                  className="form-control"
                  id="code"
                  name="code"
                  value={newCoupon.code}
                  onChange={handleInputChange}
                />
              </div>
              <div className="mb-3">
                <label htmlFor="type" className="form-label">
                  Coupon Type
                </label>
                <select
                  required
                  className="form-control"
                  id="type"
                  name="type"
                  value={newCoupon.type}
                  onChange={handleInputChange}
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
                  required
                  type="number"
                  className="form-control"
                  id="discount"
                  name="discount"
                  value={newCoupon.discount}
                  onChange={handleInputChange}
                />
              </div>
              <div className="mb-3">
                <label htmlFor="valid_from" className="form-label">
                  Valid From
                </label>
                <input
                  required
                  type="datetime-local"
                  className="form-control"
                  id="valid_from"
                  name="valid_from"
                  value={newCoupon.valid_from}
                  onChange={handleInputChange}
                />
              </div>
              <div className="mb-3">
                <label htmlFor="valid_to" className="form-label">
                  Valid To
                </label>
                <input
                  required
                  type="datetime-local"
                  className="form-control"
                  id="valid_to"
                  name="valid_to"
                  value={newCoupon.valid_to}
                  onChange={handleInputChange}
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
                  value={newCoupon.max_redemptions}
                  onChange={handleInputChange}
                />
              </div>
              <div className="d-grid gap-2 d-md-flex mt-2">
                <Link to={"/existing-coupons"} className="btn btn-outline-info">
                  Existing Coupons
                </Link>
                <button type="submit" className="btn btn-outline-primary ml-5">
                  Save Coupon
                </button>
              </div>
            </form>
          </div>
        </div>
      </section>
    </>
  );
};

export default AddCoupon;
