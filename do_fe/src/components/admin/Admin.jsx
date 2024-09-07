import React from "react"
import { Link } from "react-router-dom"
import { Outlet } from "react-router-dom";

import Sidebar from "./Sidebar"
import Main from "../Container/Main"
import Header from "./Header"
import Content from "../Container/Content"
const Admin = () => {

	return (
		// <section className="container mt-5">
		// 	<h2>Welcome to Admin Panel</h2>
		// 	<hr />
		// 	<div className="btn-group">
		// 		<Link to={"/existing-rooms"} className="btn">Manage Rooms</Link>
		// 		<Link to={"/existing-bookings"} className="btn">Manage Bookings</Link>
		// 	</div>
		// </section>
		<div>
			<Header />
		</div>
	);

}

export default Admin