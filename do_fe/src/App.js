import React, { useReducer } from "react"
import "../node_modules/bootstrap/dist/css/bootstrap.min.css"
import "/node_modules/bootstrap/dist/js/bootstrap.min.js"
import ExistingRooms from "./components/room/ExistingRooms"
import { BrowserRouter, Routes, Route } from "react-router-dom"
import Home from "./components/home/Home"
import EditRoom from "./components/room/EditRoom"
import AddRoom from "./components/room/AddRoom"
import NavBar from "./components/layout/NavBar"
import Footer from "./components/layout/Footer"
import BranchDetail from "./components/branch/branchdetail"
import RoomSelection from "./components/room/RoomSelection"
import RoomListing from "./components/room/RoomListing"
// import RoomSearchResults from "./components/common/RoomSearchResult"
import Admin from "./components/admin/Admin"
import Sidebar from "./components/admin/Sidebar"
import Checkout from "./components/booking/Checkout"
import BookingSuccess from "./components/booking/BookingSuccess"
import Bookings from "./components/booking/Bookings"
import FindBooking from "./components/booking/FindBooking"
import Login from "./components/auth/Login"
import MyUserReducer from './components/Myreducer/MyUserReducer';
import cookie from "react-cookies";
import { MyDispatchContext, MyUserContext } from './components/utils/MyContext';
import Registration from "./components/auth/Registration"
import Profile from "./components/auth/Profile"
import RequireAuth from "./components/auth/RequireAuth"
import MainLayout from './components/layout/MainLayout';
import AdminLayout from './components/layout/AdminLayout';

function App() {
  const [user, dispatch] = useReducer(MyUserReducer, cookie.load("user") || null);

	return (
			<BrowserRouter>
			<MyUserContext.Provider value={user}>
				<MyDispatchContext.Provider value={dispatch}>
					{/* <NavBar/>
					<Routes>
						<Route path="/" element={<MainLayout><Home /></MainLayout>} /> 
						<Route path="/edit-room/:roomId" element={<EditRoom />} />
						<Route path="/existing-rooms" element={<ExistingRooms />} />
						<Route path="/add-room" element={<AddRoom />} />
						
						<Route
							path="/book-room/:roomId"
							element={
								<RequireAuth>
									<Checkout />
								</RequireAuth>
							}
						/>
						<Route path="/cart" element={<Checkout/>} />

						<Route path="/browse-all-rooms" element={<RoomListing />} />

						<Route path="/admin" element={<Admin />} />
						<Route path="/admin1" element={<Sidebar />} />

						<Route path="/booking-success" element={<BookingSuccess />} />
						<Route path="/existing-bookings" element={<Bookings />} />
						<Route path="/find-booking" element={<FindBooking />} />
						<Route path="/hotel/branch/:id"  element={<BranchDetail />}/>
						<Route path="/hotel/branch/:id/roomtype/:roomname" element={<RoomSelection />} />
						<Route path="/login" element={<Login />} />
						<Route path="/register" element={<Registration />} />

						<Route path="/profile" element={<Profile />} />
						<Route path="/logout" element={<FindBooking />} />
						
					</Routes>
					<Footer/> */}
					<Routes>
						{/* Routes sử dụng MainLayout */}
						<Route path="/" element={<MainLayout><Home /></MainLayout>} />
						<Route path="/edit-room/:roomId" element={<MainLayout><EditRoom /></MainLayout>} />
						<Route path="/existing-rooms" element={<AdminLayout><ExistingRooms /></AdminLayout>} />
						<Route path="/add-room" element={<AdminLayout><AddRoom /></AdminLayout>} />
						<Route path="/browse-all-rooms" element={<MainLayout><RoomListing /></MainLayout>} />
						<Route path="/booking-success" element={<MainLayout><BookingSuccess /></MainLayout>} />
						<Route path="/existing-bookings" element={<AdminLayout><Bookings /></AdminLayout>} />
						<Route path="/find-booking" element={<MainLayout><FindBooking /></MainLayout>} />
						<Route path="/hotel/branch/:id" element={<MainLayout><BranchDetail /></MainLayout>} />
						<Route path="/hotel/branch/:id/roomtype/:roomname" element={<MainLayout><RoomSelection /></MainLayout>} />
						<Route path="/login" element={<MainLayout><Login /></MainLayout>} />
						<Route path="/register" element={<MainLayout><Registration /></MainLayout>} />
						<Route path="/profile" element={<MainLayout><Profile /></MainLayout>} />
						<Route path="/logout" element={<MainLayout><FindBooking /></MainLayout>} />

						{/* Routes sử dụng AdminLayout */}
							<Route path="/admin" element={<AdminLayout><Admin /></AdminLayout>} />

						{/* Các route yêu cầu xác thực */}
						<Route path="/book-room/:roomId" element={
						<RequireAuth>
							<MainLayout><Checkout /></MainLayout>
						</RequireAuth>
						} />
						<Route path="/cart" element={<MainLayout><Checkout /></MainLayout>} />
					</Routes>
				</MyDispatchContext.Provider>
			</MyUserContext.Provider>
			</BrowserRouter>

	)
}

export default App
