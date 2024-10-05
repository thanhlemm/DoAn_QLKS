import React, { useEffect, useState, useRef } from 'react';
import { api, endpoints } from '../utils/ApiFunctions'; 
import InvoiceModal from '../receptionist/InvoiceModal';
import Cookies from 'react-cookies';
import ReactToPrint from 'react-to-print';
import InvoiceToPrint from './InvoiceToPrint';


const ExistingBill = () => {
    const [invoices, setInvoices] = useState([]);  
    const [showInvoiceModal, setShowInvoiceModal] = useState(false);
    const [showPrintModal, setShowPrintModal] = useState(false);
    const [selectedInvoice, setSelectedInvoice] = useState(null);
    const [selectedBooking, setSelectedBooking] = useState(null);
    const token = Cookies.load('token');
    const componentRef = useRef();

    const fetchInvoices = async () => {
        try {
            const response = await api.get(endpoints.get_invoices,{
                headers: {
                    'Authorization': `Bearer ${token}`,
                }
            }); 
            setInvoices(response.data);
        } catch (error) {
            console.error('Error fetching invoices:', error);
        }
    };

    const fetchBooking = async (bookingId) => {
        try {
            const response = await api.get(`/hotel/booking/${bookingId}/`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                }
            });
            setSelectedBooking(response.data); // Store the fetched booking
        } catch (error) {
            console.error('Error fetching booking:', error);
        }
    };

    // Hàm để hiển thị modal xem chi tiết hóa đơn
    const handleViewInvoice = async (invoice) => {
        setSelectedInvoice(invoice);
        await fetchBooking(invoice.booking_id);
        setShowInvoiceModal(true);
    };

    const confirmPayment = async (invoiceId) => {
        try {
            const response = await api.post(`/hotel/invoices/${invoiceId}/confirm-payment/`, {}, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                }
            });
            if (response.status === 200) {
                alert("Xác nhận thanh toán thành công");
                fetchInvoices(); // Update the invoice list after payment
                setShowInvoiceModal(false);
            }
        } catch (error) {
            console.error('Error confirming payment:', error);
            alert('Error confirming payment: ' + error.response?.data?.detail || 'Something went wrong');
        }
    };
   
    const handlePrintBooking = async(booking) => {
        // console.log(selectedBooking);
        await fetchBooking(booking);
        setShowPrintModal(true); // Mở modal in booking
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
                                {invoice.status === 'pending' || invoice.status === 'failed' ? (
                                    <button
                                        className="btn btn-sm ml-2"
                                        onClick={() => confirmPayment(invoice.id)}
                                    >
                                        Confirm Payment
                                    </button>
                                ) : invoice.status === 'paid' ? (
                                    <button
                                        className="btn btn-sm ml-2"
                                        onClick={() => handlePrintBooking(invoice.booking_id)} // Gọi hàm in booking
                                    >
                                        Print Invoice
                                    </button>
                                ) : null}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {/* Modal để xem chi tiết hóa đơn */}
            <InvoiceModal
                show={showInvoiceModal}
                onHide={() => setShowInvoiceModal(false)}
                booking={selectedBooking} 
                invoice={selectedInvoice}
                onConfirmPayment={confirmPayment} 
            />

            <InvoiceToPrint
                show={showPrintModal}
                onHide={() => setShowPrintModal(false)}
                booking={selectedBooking} 
                ref={componentRef}
            />
        </div>
    );
};

export default ExistingBill;
