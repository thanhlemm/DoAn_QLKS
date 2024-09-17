import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from "react-router-dom";
import {  api, endpoints } from "../utils/ApiFunctions"
import Cookies from 'react-cookies';
import PaymentResult from './PaymentResult';

const PaymentForm = () => {
    const [paymentResult, setPaymentResult] = useState(null);
    const location = useLocation();

    const { booking, payment } = location.state || {};
    const [formData, setFormData] = useState({
        order_type: 'topup',
        order_id: new Date().toISOString().replace(/[^0-9]/g, '').slice(0, 14),
        amount: payment || 10000,
        order_desc: `Thanh toan don hang thoi gian: ${new Date().toLocaleString()}`,
        bank_code: '',
        language: 'vn'
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
            // Adjust the endpoint as needed
            const response = await api.post('/hotel/payment/create_payment/', formData, {
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': csrftoken                }
            });
            console.log('Payment form submitted successfully', response);
            const bookingId = localStorage.getItem('bookingId');           
            console.log(bookingId)
            if (response.data) {
            
                window.location.href = response.data;
              
             } 
        } catch (error) {
            console.error('Error submitting payment form:', error);
        }
    };

    
    useEffect(() => {
        const queryParams = new URLSearchParams(window.location.search);
        const result = queryParams.get('vnp_TransactionStatus');
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
        }
    }, [location.search]);

    

    return (
        <div className="container">
            <h3>Thanh toán</h3>
            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label htmlFor="order_type">Loại hàng hóa</label>
                    <select
                        name="order_type"
                        id="order_type"
                        className="form-control"
                        value={formData.order_type}
                        onChange={handleChange}
                    >
                        <option value="topup">Nạp tiền điện thoại</option>
                        <option value="billpayment">Thanh toán hóa đơn</option>
                        <option value="fashion">Thời trang</option>
                        <option value="other">Khác - Xem thêm tại VNPAY</option>
                    </select>
                </div>
                <div className="form-group">
                    <label htmlFor="order_id">Mã hóa đơn</label>
                    <input
                        className="form-control"
                        id="order_id"
                        name="order_id"
                        type="text"
                        value={formData.order_id}
                        onChange={handleChange}
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="amount">Số tiền</label>
                    <input
                        className="form-control"
                        id="amount"
                        name="amount"
                        type="number"
                        value={formData.amount}
                        onChange={handleChange}
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="order_desc">Nội dung thanh toán</label>
                    <textarea
                        className="form-control"
                        id="order_desc"
                        name="order_desc"
                        rows="2"
                        value={formData.order_desc}
                        onChange={handleChange}
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="bank_code">Ngân hàng</label>
                    <select
                        name="bank_code"
                        id="bank_code"
                        className="form-control"
                        value={formData.bank_code}
                        onChange={handleChange}
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
                        className="form-control"
                        value={formData.language}
                        onChange={handleChange}
                    >
                        <option value="vn">Tiếng Việt</option>
                        <option value="en">English</option>
                    </select>
                </div>
                <button type="submit" className="btn btn-default">Thanh toán</button>
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
