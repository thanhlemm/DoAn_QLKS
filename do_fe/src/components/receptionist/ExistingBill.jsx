import React, { useEffect, useState } from 'react';
import { api, endpoints } from '../utils/ApiFunctions'; // Đảm bảo rằng bạn có API và các endpoint phù hợp
import InvoiceModal from '../receptionist/InvoiceModal';
import Cookies from 'react-cookies';

const ExistingBill = () => {
    const [invoices, setInvoices] = useState([]);  // Lưu danh sách hóa đơn
    const [showInvoiceModal, setShowInvoiceModal] = useState(false);
    const [selectedInvoice, setSelectedInvoice] = useState(null);
    const token = Cookies.load('token');

    // Hàm lấy dữ liệu hóa đơn từ API
    const fetchInvoices = async () => {
        try {
            const response = await api.get(endpoints.get_invoices,{
                headers: {
                    'Authorization': `Bearer ${token}`,
                }
            }); 
            console.log(response)
            setInvoices(response.data);
        } catch (error) {
            console.error('Error fetching invoices:', error);
        }
    };

    // Hàm để hiển thị modal xem chi tiết hóa đơn
    const handleViewInvoice = (invoice) => {
        setSelectedInvoice(invoice);
        setShowInvoiceModal(true);
    };

    // Hàm xác nhận thanh toán (nếu cần thiết)
    const confirmPayment = async (invoiceId) => {
        try {
            const response = await api.post(`/hotel/invoice/${invoiceId}/confirm-payment/`, {
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': token
                }
            });
            if (response.status === 200) {
                alert("Xác nhận thanh toán thành công");
                fetchInvoices(); // Cập nhật lại danh sách hóa đơn sau khi thanh toán
                setShowInvoiceModal(false);
            }
        } catch (error) {
            console.error('Error confirming payment:', error);
        }
    };

    useEffect(() => {
        fetchInvoices();  // Lấy dữ liệu hóa đơn khi trang được load
    }, []);

    return (
        <div className="existing-bill-page">
            <h1 className="text-2xl font-bold mb-4">Danh Sách Hoá Đơn</h1>
            <table className="w-full border-collapse bg-neutral-50 shadow-md rounded-lg overflow-hidden">
                <thead>
                    <tr className="bg-neutral-100 border-b border-neutral-300">
                        <th className="p-4 text-center">S/N</th>
                        <th className="p-4 text-center">Invoice ID</th>
                        <th className="p-4 text-center">Booking ID</th>
                        <th className="p-4 text-center">Total Amount</th>
                        <th className="p-4 text-center">Payment Status</th>
                        <th className="p-4 text-center">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {invoices.map((invoice, index) => (
                        <tr key={invoice.id} className="border-b border-neutral-300 hover:bg-neutral-100">
                            <td>{index + 1}</td>
                            <td>{invoice.id}</td>
                            <td>{invoice.booking_id}</td>
                            <td>{invoice.amount}</td>
                            <td>{invoice.status}</td>
                            <td>
                                <button
                                    className="btn btn-sm"
                                    onClick={() => handleViewInvoice(invoice)}
                                >
                                    View Invoice
                                </button>
                                {invoice.status === 'pending' || invoice.status === 'failed' && (
                                    <button
                                        className="btn btn-sm ml-2"
                                        onClick={() => confirmPayment(invoice.id)}
                                    >
                                        Confirm Payment
                                    </button>
                                )}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {/* Modal để xem chi tiết hóa đơn */}
            <InvoiceModal
                show={showInvoiceModal}
                onHide={() => setShowInvoiceModal(false)}
                booking={selectedInvoice} 
                onConfirmPayment={confirmPayment} 
            />
        </div>
    );
};

export default ExistingBill;
