import { css } from '@emotion/react';
import styled from '@emotion/styled';
import React, { useState, useEffect, useContext } from 'react';
import { useLocation } from "react-router-dom";
import { api } from "../utils/ApiFunctions";
import Cookies from 'react-cookies';
import PaymentResult from './PaymentResult';
import { MyUserContext } from '../utils/MyContext';

const PaymentForm = () => {
  const [paymentResult, setPaymentResult] = useState(null);
  const location = useLocation();
  const user = useContext(MyUserContext);
  
  const { booking, payment } = location.state || {};
  const bookingId = Number(localStorage.getItem('bookingId'));
  const bookingConfirmationCode = localStorage.getItem('bookingConfirmationCode');
  const [formData, setFormData] = useState({
    order_type: 'topup',
    order_id: new Date().toISOString().replace(/[^0-9]/g, '').slice(0, 14),
    amount: payment || 10000,
    order_desc: `Thanh toan don dat phong ${bookingConfirmationCode} thoi gian: ${new Date().toLocaleString()}`,
    bank_code: '',
    language: 'vn',
    booking_id: bookingId,
    user: user.id,
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const csrftoken = Cookies.load('csrftoken');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await api.post('/hotel/payment/create_payment/', formData, {
        headers: {
          'Content-Type': 'application/json',
          'X-CSRFToken': csrftoken,
        }
      });
      console.log(response)
      const paymentUrl = response?.data?.payment_url;
      // const paymentUrl = response?.data[0];
      if (paymentUrl && typeof paymentUrl === 'string' && paymentUrl.startsWith('http')) {
        window.open(paymentUrl, '_blank');
      } else {
        console.error('Payment URL is not available in response.');
      }
    } catch (error) {
      console.error('Error submitting payment form:', error);
    }
  };

  useEffect(() => {
    const queryParams = new URLSearchParams(window.location.search);
    const result = queryParams.get('vnp_TransactionStatus');
    if (result) {
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
    }
  }, [location.search, bookingId, bookingConfirmationCode]);

  return (
    <div className='p-6 space-y-4 flex flex-col items-center'>
        <h1 className="text-2xl font-title">Thanh toán</h1>      
        <form onSubmit={handleSubmit} className="space-y-4 w-full max-w-lg">
          <div className="form-group">          
              <label htmlFor="booking_id">Confirmation Code</label>
            <input
              id="booking_id"
              name="booking_id"
              type="text"
              value={bookingConfirmationCode}
              readOnly // Để người dùng không thay đổi
              className="w-full p-3 rounded-md border border-gray-300"
            />
          </div>
          <div className="form-group">
              <label htmlFor="order_type">Loại hàng hóa</label>
            <select
              name="order_type"
              id="order_type"
              value={formData.order_type}
              onChange={handleChange}
              className="w-full p-2 pr-10 rounded-md border border-gray-300 appearance-none bg-neutral-50"
            >
              <option value="billpayment">Thanh toán hóa đơn</option>
              <option value="other">Khác - Xem thêm tại VNPAY</option>
            </select>
          </div>
          <div className="form-group">
            <label htmlFor="order_id">Mã hóa đơn</label>
            <input
              id="order_id"
              name="order_id"
              type="text"
              value={formData.order_id}
              onChange={handleChange}
              className="w-full p-3 rounded-md border border-gray-300"
            />
          </div>
          <div className="form-group">
            <label htmlFor="amount">Số tiền</label>
            <input
              id="amount"
              name="amount"
              type="number"
              value={formData.amount}
              onChange={handleChange}
              className="w-full p-3 rounded-md border border-gray-300"
              min="0" // Đảm bảo số tiền không âm
              required // Đảm bảo trường này không trống
            />
          </div>
          <div className="form-group">
            <label htmlFor="order_desc">Nội dung thanh toán</label>
            <textarea
              id="order_desc"
              name="order_desc"
              rows="2"
              value={formData.order_desc}
              onChange={handleChange}
              className="w-full p-3 rounded-md border border-gray-300"
              required // Đảm bảo trường này không trống
            />
          </div>
          <div className="form-group">
            <label htmlFor="bank_code">Ngân hàng</label>
            <select
              name="bank_code"
              id="bank_code"
              value={formData.bank_code}
              onChange={handleChange}
              className="w-full p-2 pr-10 rounded-md border border-gray-300 appearance-none bg-neutral-50"
            >
              <option value="">Không chọn</option>
              <option value="NCB">Ngân hàng NCB</option>
              <option value="AGRIBANK">Ngân hàng Agribank</option>
              <option value="SCB">Ngân hàng SCB</option>
              <option value="SACOMBANK">Ngân hàng SacomBank</option>
              <option value="EXIMBANK">Ngân hàng EximBank</option>
              <option value="MSBANK">Ngân hàng MSBANK</option>
              <option value="NAMABANK">Ngân hàng NamABank</option>
              <option value="VNMART">Ví điện tử VnMart</option>
              <option value="VIETINBANK">Ngân hàng Vietinbank</option>
              <option value="VIETCOMBANK">Ngân hàng VCB</option>
              <option value="HDBANK">Ngân hàng HDBank</option>
              <option value="DONGABANK">Ngân hàng Dong A</option>
              <option value="TPBANK">Ngân hàng TPBank</option>
              <option value="OJB">Ngân hàng OceanBank</option>
              <option value="BIDV">Ngân hàng BIDV</option>
              <option value="TECHCOMBANK">Ngân hàng Techcombank</option>
              <option value="VPBANK">Ngân hàng VPBank</option>
              <option value="MBBANK">Ngân hàng MBBank</option>
              <option value="ACB">Ngân hàng ACB</option>
              <option value="OCB">Ngân hàng OCB</option>
              <option value="IVB">Ngân hàng IVB</option>
              <option value="VISA">Thanh toán qua VISA/MASTER</option>
            </select>
          </div>
          <div className="form-group">
            <label htmlFor="language">Ngôn ngữ</label>
            <select
              name="language"
              id="language"
              value={formData.language}
              onChange={handleChange}
              className="w-full p-2 pr-10 rounded-md border border-gray-300 appearance-none bg-neutral-50"
            >
              <option value="vn">Tiếng Việt</option>
              <option value="en">English</option>
            </select>
          </div>
          <button className="bg-purple-400 p-3 rounded-full text-white w-[150px]" type="submit">Thanh toán</button>
        </form>

      {paymentResult && (
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
      )}
    </div>
  );
};

export default PaymentForm;
