import React, { useEffect, useState } from 'react';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import { getUser } from '../utils/ApiFunctions'; 

const InvoiceModal = ({ show, onHide, booking, invoice, onConfirmPayment }) => {
    const [guestFirstName, setGuestFirstName] = useState('');
    const [guestLastName, setGuestLastName] = useState('');

    useEffect(() => {
        if (booking && booking.user) {
            const fetchGuestName = async () => {
                try {
                    const user = await getUser(booking.user);
                    setGuestLastName(user.last_name); 
                    setGuestFirstName(user.first_name)
                } catch (error) {
                    console.error('Error fetching guest name:', error);
                }
            };

            fetchGuestName();
        }
    }, [booking]);

    if (!booking) return null;

    return (
        <Modal show={show} onHide={onHide}>
            <Modal.Header closeButton>
                <Modal.Title>Invoice for Booking ID: {booking.id}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <p><strong>Room Number:</strong> {booking.room}</p>
                <p><strong>Room Type:</strong> {booking.room_type}</p>
                <p><strong>Check-In Date:</strong> {booking.check_in_date}</p>
                <p><strong>Check-Out Date:</strong> {booking.check_out_date}</p>
                <p><strong>First Name:</strong> { guestFirstName}</p>
                <p><strong>Last Name:</strong> {guestLastName}</p>
                <p><strong>Guest Email:</strong> {booking.email}</p>
                <p><strong>Confirmation Code:</strong> {booking.confirmationCode}</p>
                <p><strong>Total Amount:</strong> ${booking.total}</p>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={onHide}>
                    Close
                </Button>
                <Button variant="primary" onClick={() => onConfirmPayment(invoice.id)}>
                    Confirm Payment
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

export default InvoiceModal;
