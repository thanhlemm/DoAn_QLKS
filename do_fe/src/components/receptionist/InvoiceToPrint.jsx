import React, { forwardRef } from 'react';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import ReactToPrint from 'react-to-print';

const InvoiceToPrint = forwardRef(({ show, onHide, booking }, ref) => {
    return (
        <Modal
            show={show}
            onHide={onHide}
            backdrop="static"
            keyboard={false}
        >
            <Modal.Header closeButton>
                <Modal.Title>Thông tin Booking</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <div ref={ref}> {/* Truyền ref vào đây */}
                    {booking ? (
                        <div>
                            <p>ID: {booking.id}</p>
                            <p>Email khách hàng: {booking.email}</p>
                            <p>Ngày nhận phòng: {booking.check_in_date}</p>
                            <p>Ngày trả phòng: {booking.check_out_date}</p>
                            <p>Giá: {booking.before_discount}</p>
                            <p>Số tiền giảm: {booking.saved}</p>
                            <p>Sau khi giảm: {booking.total}</p>
                            <p>Trạng thái: {booking.payment_status}</p>
                        </div>
                    ) : (
                        <p>Không có thông tin booking.</p>
                    )}
                </div>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={onHide}>
                    Đóng
                </Button>
                <ReactToPrint
                    trigger={() => <Button variant="primary">In hóa đơn</Button>}
                    content={() => ref.current} 
                />
            </Modal.Footer>
        </Modal>
    );
});

export default InvoiceToPrint;
