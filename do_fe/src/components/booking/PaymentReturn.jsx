import React, { useEffect, useState } from 'react';
import {  api, endpoints } from "../utils/ApiFunctions"
import PaymentResult from "./PaymentResult"

const PaymentReturn = () => {
  const [paymentResult, setPaymentResult] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);

  useEffect(() => {
    // Get query params from the URL (if using a modern router or manual parsing)
    const fetchPaymentResult = async () => {
      try {
        const response = await api.get('/hotel/payment/payment_return/');
        setPaymentResult(response.data);
      } catch (error) {
        setErrorMsg(error.response?.data?.msg || 'An error occurred while fetching the payment result.');
      }
    };

    fetchPaymentResult();
  }, []);

  return (
    <div>
      {paymentResult ? (
          <PaymentResult
          title={paymentResult.title}
          result={paymentResult.result}
          orderId={paymentResult.orderId}
          amount={paymentResult.amount}
          orderDesc={paymentResult.orderDesc}
          vnpTransactionNo={paymentResult.vnpTransactionNo}
          vnpResponseCode={paymentResult.vnpResponseCode}
          msg={paymentResult.msg}
      />
      ) : (
        <p>{errorMsg || 'Loading payment result...'}</p>
      )}
    </div>
  );
};

export default PaymentReturn;
