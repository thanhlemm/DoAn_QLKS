import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const PaymentResult = () => {
    const location = useLocation();
    const navigate = useNavigate();

    const [paymentResult, setPaymentResult] = useState(null);

    useEffect(() => {
        const queryParams = new URLSearchParams(location.search);
        
        const result = queryParams.get('vnp_TransactionStatus');

        const savedBooking = JSON.parse(sessionStorage.getItem('booking'));
        const savedPayment = sessionStorage.getItem('payment');
        const savedOnConfirm = sessionStorage.getItem('onConfirm');
        if (result) {
            const isSuccess = result === '00';
            setPaymentResult({
                title: result === '00' ? "Payment Success" : "Payment Failure",
                result: result === '00' ? "Success" : "Failed",
                orderId: queryParams.get('vnp_TxnRef'),
                amount: queryParams.get('vnp_Amount'),
                orderDesc: queryParams.get('vnp_OrderInfo'),
                vnpTransactionNo: queryParams.get('vnp_TransactionNo'),
                vnpResponseCode: queryParams.get('vnp_ResponseCode'),
                msg: queryParams.get('vnp_Message') || "No message provided"
            });
            if (isSuccess && savedOnConfirm) {
                // Call onConfirm if it exists
                try {
                    const onConfirm = new Function('return ' + savedOnConfirm)();
                    onConfirm();
                } catch (error) {
                    console.error('Error calling onConfirm:', error);
                }
                // Redirect to booking success page
                setTimeout(() => navigate('/booking-success'), 3000);
            } else {
                // Handle failure case
                setTimeout(() => navigate('/booking-failure'), 3000);
            }
        }
    }, [location.search]);

    return (
        <div className="payment-result-container">
            {paymentResult ? (
                <div>
                    <h3>{paymentResult.title}</h3>
                    <div className="payment-result-details">
                        <p><strong>Transaction Result:</strong> {paymentResult.result}</p>
                        <p><strong>Order ID:</strong> {paymentResult.orderId}</p>
                        <p><strong>Amount:</strong> {paymentResult.amount} VND</p>
                        <p><strong>Order Description:</strong> {paymentResult.orderDesc}</p>
                        <p><strong>VNPay Transaction No:</strong> {paymentResult.vnpTransactionNo}</p>
                        <p><strong>VNPay Response Code:</strong> {paymentResult.vnpResponseCode}</p>
                        <p><strong>Message:</strong> {paymentResult.msg}</p>
                    </div>
                </div>
            ) : (
                <p>Loading payment result...</p>
            )}
        </div>
    );
};

export default PaymentResult;
