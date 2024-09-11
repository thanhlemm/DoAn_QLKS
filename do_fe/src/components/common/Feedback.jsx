import React, { useState } from 'react';
import { Modal, Button } from 'react-bootstrap';
import { createFeedback, api, endpoints } from '../utils/ApiFunctions';
import cookie from "react-cookies";
import styled from "styled-components";

const Feedback = ({ show, handleClose, booking }) => {
    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState('');
    const [message, setMessage] = useState('');
    const [errorMessage, setErrorMessage] = useState('');

    const handleSubmitFeedback = async () => {
        if (booking) {
            try {
                const token = cookie.load('token'); // Lấy token từ cookie
                console.log(booking)
                // const branchID = await api.get(endpoints.booking_info(booking.id))
                const feedbackData = {
                  booking: booking.id,
                  branch: booking.branch, 
                  rating,
                  comment,
              };
              console.log(booking.id)
              await createFeedback(feedbackData, token);
              setMessage('Feedback submitted successfully.');
              handleClose();
            } catch (error) {
                setErrorMessage('Error submitting feedback.');
            }
        }
    };

    return (
        <StyledModal show={show} onHide={handleClose}>
            <Modal.Header closeButton>
                <StyledTitle>Feedback</StyledTitle>            
            </Modal.Header>
            <Modal.Body>
                <div className="form-group">
                    <div className="rating">
                        {[5, 4, 3, 2, 1].map((value) => (
                            <React.Fragment key={value}>
                                <input
                                    type="radio"
                                    id={`star${value}`}
                                    name="rate"
                                    value={value}
                                    checked={rating === value}
                                    onChange={() => setRating(value)}
                                />
                                <label htmlFor={`star${value}`} title={`${value} stars`}>
                                    <svg
                                        viewBox="0 0 576 512"
                                        height="1em"
                                        xmlns="http://www.w3.org/2000/svg"
                                        className="star-solid"
                                    >
                                        <path d="M316.9 18C311.6 7 300.4 0 288.1 0s-23.4 7-28.8 18L195 150.3 51.4 171.5c-12 1.8-22 10.2-25.7 21.7s-.7 24.2 7.9 32.7L137.8 329 113.2 474.7c-2 12 3 24.2 12.9 31.3s23 8 33.8 2.3l128.3-68.5 128.3 68.5c10.8 5.7 23.9 4.9 33.8-2.3s14.9-19.3 12.9-31.3L438.5 329 542.7 225.9c8.6-8.5 11.7-21.2 7.9-32.7s-13.7-19.9-25.7-21.7L381.2 150.3 316.9 18z" />
                                    </svg>
                                </label>
                            </React.Fragment>
                        ))}
                    </div>
                </div>
                <div className="form-group">
                    <textarea
                        className="comment-box"
                        id="comment"
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        placeholder="What's Your Feedback?"
                    />
                </div>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={handleClose}>
                    Close
                </Button>
                <Button variant="primary" onClick={handleSubmitFeedback}>
                    Submit Feedback
                </Button>
            </Modal.Footer>
        </StyledModal>
    );
};

const StyledModal = styled(Modal)`
  .modal-dialog {
    max-width: 450px;
    margin: 8rem auto;
  }

  .modal-content {
    border-radius: 10px;
    box-shadow: 0 0 15px rgba(0, 0, 0, 0.2);
    background-color: #f9f9f9;
    border: none;
  }

  .modal-header {
    border-bottom: 1px solid #ddd;
    background-color: #fff;
    padding: 1rem 1.5rem;
  }

  .modal-body {
    padding: 1.5rem;
  }

  .form-group {
    margin-bottom: 1rem;
  }

  .comment-box {
    width: 100%;
    min-height: 120px;
    padding: 0.75rem;
    border: 1px solid #ccc;
    border-radius: 5px;
    background-color: #fff;
    font-size: 1rem;
    resize: vertical;
    outline: none;
    box-shadow: inset 0 0 5px rgba(0, 0, 0, 0.1);
  }

  .rating {
    display: inline-block;
    direction: rtl;
    font-size: 0;
  }

  .rating > input {
    display: none;
  }

  .rating > label {
    float: right;
    cursor: pointer;
    font-size: 30px;
    color: #666;
  }

  .rating > label > svg {
    fill: currentColor;
    transition: fill 0.3s ease;
  }

  .rating > input:checked + label,
  .rating > input:checked ~ label {
    color: #e58e09;
  }

  .rating:not(:checked) > label:hover,
  .rating:not(:checked) > label:hover ~ label {
    color: #ff9e0b;
  }

  .rating > input:checked ~ label > svg {
    fill: #ffa723;
  }
`;
const StyledTitle = styled.h1`
  font-size: 2rem;
  font-weight: bold;
  color: #4b5563; /* Text Slate-400 color */
  text-transform: capitalize;
`;

export default Feedback;
