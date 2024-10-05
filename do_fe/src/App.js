import React, { useReducer } from "react"
import "../node_modules/bootstrap/dist/css/bootstrap.min.css"
import "/node_modules/bootstrap/dist/js/bootstrap.min.js"
import { BrowserRouter, Routes, Route } from "react-router-dom"
import Home from "./components/home/Home"
// import NavBar from "./components/layout/NavBar"
// import Footer from "./components/layout/Footer"
import BranchDetail from "./components/branch/branchdetail"
import RoomSelection from "./components/room/RoomSelection"
import RoomListing from "./components/room/RoomListing"
import Admin from "./components/admin/Admin"
import ExistingEmployees from "./components/employee/ExistingEmployees"
import ExistingRooms from "./components/room/ExistingRooms"
import ExistingRoomTypes from "./components/roomtype/ExistingRoomTypes"
import ExistingCoupons from "./components/coupon/ExistingCoupons"
import EditRoom from "./components/room/EditRoom"
import EditRoomType from "./components/roomtype/EditRoomType"
import EditEmployee from "./components/employee/EditEmployee"
import EditCoupon from "./components/coupon/EditCoupon"
import AddRoom from "./components/room/AddRoom"
import AddRoomType from "./components/roomtype/AddRoomType"
import AddEmployee from "./components/employee/AddEmployee"
import AddCoupon from "./components/coupon/AddCoupon"
import Checkout from "./components/booking/Checkout"
import BookingSuccess from "./components/booking/BookingSuccess"
import Bookings from "./components/booking/Bookings"
import FindBooking from "./components/booking/FindBooking"
import Login from "./components/auth/Login"
import FaceBookCallBack from "./components/auth/FaceBookCallBack"
import MyUserReducer from './components/Myreducer/MyUserReducer';
import cookie from "react-cookies";
import { MyDispatchContext, MyUserContext } from './components/utils/MyContext';
import Registration from "./components/auth/Registration"
import Profile from "./components/auth/Profile"
import RequireAuth from "./components/auth/RequireAuth"
import RequireAdmin from "./components/auth/RequireAdmin"
import RequireReceptionist from "./components/auth/RequireReceptionist"
import MainLayout from './components/layout/MainLayout';
import AdminLayout from './components/layout/AdminLayout';
import ReceptionistLayout from './components/layout/ReceptionistLayout'
import Receptionist from './components/receptionist/Receptionist'
import PaymentForm from './components/booking/PaymentForm'
import PaymentResult from './components/booking/PaymentResult'
import ExistingBill from './components/receptionist/ExistingBill'
import ExistingMessage from './components/receptionist/ExistingMessage'


import "./App.css"

function App() {
  const [user, dispatch] = useReducer(MyUserReducer, cookie.load("user") || null);

	return (
			<BrowserRouter>
			<MyUserContext.Provider value={user}>
				<MyDispatchContext.Provider value={dispatch}>
					<Routes>
						<Route path="/" element={<MainLayout><Home /></MainLayout>} />
						<Route path="/browse-all-rooms" element={<MainLayout><RoomListing /></MainLayout>} />
						<Route path="/booking-success" element={<MainLayout><BookingSuccess /></MainLayout>} />
						<Route path="/find-booking" element={<MainLayout><FindBooking /></MainLayout>} />
						<Route path="/hotel/branch/:id" element={<MainLayout><BranchDetail /></MainLayout>} />
						<Route path="/hotel/branch/:id/roomtype/:roomname" element={<RequireAuth><MainLayout><RoomSelection /></MainLayout></RequireAuth>} />
						<Route path="/login" element={<MainLayout><Login /></MainLayout>} />
						<Route path="/register" element={<MainLayout><Registration /></MainLayout>} />
						<Route path="/profile" element={<MainLayout><Profile /></MainLayout>} />
						<Route path="/logout" element={<MainLayout><FindBooking /></MainLayout>} />
						<Route path="/payment-form" element={<MainLayout><PaymentForm /></MainLayout>} />
						<Route path="/payment-result" element={<MainLayout><PaymentResult /></MainLayout>} />
						<Route path="/auth/facebook/callback" element={<FaceBookCallBack />} />


						<Route path="/admin" element={
							<RequireAdmin>
								<AdminLayout><Admin /></AdminLayout>
							</RequireAdmin>
						} />
						<Route path="/existing-rooms" element={
							<RequireAdmin>
								<AdminLayout><ExistingRooms /></AdminLayout>
							</RequireAdmin>
						} />
						<Route path="/existing-roomtypes" element={
							<RequireAdmin>
								<AdminLayout><ExistingRoomTypes /></AdminLayout>
							</RequireAdmin>
						} />
						<Route path="/existing-coupons" element={
							<RequireAdmin>
								<AdminLayout><ExistingCoupons /></AdminLayout>
							</RequireAdmin>
						} />
						<Route path="/add-room" element={
							<RequireAdmin>
								<AdminLayout><AddRoom /></AdminLayout>
							</RequireAdmin>
						} />
						<Route path="/add-roomtype" element={
							<RequireAdmin>
								<AdminLayout><AddRoomType /></AdminLayout>
							</RequireAdmin>
						} />
						<Route path="/add-coupon" element={
							<RequireAdmin>
								<AdminLayout><AddCoupon /></AdminLayout>
							</RequireAdmin>
						} />
						<Route path="/edit-room/:roomId" element={
							<RequireAdmin>
								<AdminLayout><EditRoom /></AdminLayout>
							</RequireAdmin>
						} />
						<Route path="/edit-roomtype/:roomTypeId" element={
							<RequireAdmin>
								<AdminLayout><EditRoomType /></AdminLayout>
							</RequireAdmin>
						} />
						<Route path="/edit-employee/:employeeId" element={
							<RequireAdmin>
								<AdminLayout><EditEmployee /></AdminLayout>
							</RequireAdmin>
						} />
						<Route path="/edit-coupon/:couponId" element={
							<RequireAdmin>
								<AdminLayout><EditCoupon /></AdminLayout>
							</RequireAdmin>
						} />

						<Route path="/book-room/:roomId" element={
							<RequireAuth>
								<MainLayout><Checkout /></MainLayout>
							</RequireAuth>
						} />
						
						<Route path="/existing-employees" element={
							<RequireAdmin>
								<AdminLayout><ExistingEmployees /></AdminLayout>
							</RequireAdmin>
						} />
						<Route path="/add-employee" element={
							<RequireAdmin>
								<AdminLayout><AddEmployee /></AdminLayout>
							</RequireAdmin>
						} />
						<Route path="/cart" element={
							<RequireAuth>
								<MainLayout><Checkout /></MainLayout>
							</RequireAuth>
						} />

						<Route path='/receptionist' element={
							<RequireReceptionist>
								<ReceptionistLayout><Receptionist /></ReceptionistLayout>
							</RequireReceptionist>
						} />
						<Route path="/existing-bookings" element={
							<RequireReceptionist>
								<ReceptionistLayout><Bookings /></ReceptionistLayout>
							</RequireReceptionist>
						} />
						<Route path="/existing-bills" element={
							<RequireReceptionist>
								<ReceptionistLayout><ExistingBill /></ReceptionistLayout>
							</RequireReceptionist>
						} />
						<Route path="/existing-messages" element={
							<RequireReceptionist>
								<ReceptionistLayout><ExistingMessage /></ReceptionistLayout>
							</RequireReceptionist>
						} />

					</Routes>
				</MyDispatchContext.Provider>
			</MyUserContext.Provider>
			</BrowserRouter>

	)
}

export default App
