import React, { useContext, useState } from "react"
import { NavLink, Link } from "react-router-dom"
import Logout from "../auth/Logout"
import { MyUserContext } from '../utils/MyContext';




const NavBar = () => {
	const [showAccount, setShowAccount] = useState(false)
	const user = useContext(MyUserContext);

	const handleAccountClick = () => {
		setShowAccount(!showAccount)
	}
	const isUserAdmin = user && user.role && user.role.name === "Admin";

	// const isLoggedIn = localStorage.getItem("token")
	// const userRole = localStorage.getItem("userRole")
	// const user = JSON.parse(localStorage.getItem("user")); // Parse JSON để lấy user object
    // const userRole = user ? user.role.name : null; // Lấy userRole từ user object nếu tồn tại
	return (
		<nav className="navbar navbar-expand-lg bg-body-tertiary px-5 shadow sticky-top">
			<div className="container-fluid">
				<Link to={"/"} className="navbar-brand">
					<span className="hotel-color">Ocean Hotel</span>
				</Link>

				<button
					className="navbar-toggler"
					type="button"
					data-bs-toggle="collapse"
					data-bs-target="#navbarScroll"
					aria-controls="navbarScroll"
					aria-expanded="false"
					aria-label="Toggle navigation">
					<span className="navbar-toggler-icon"></span>
				</button>

				<div className="collapse navbar-collapse" id="navbarScroll">
					<ul className="navbar-nav me-auto my-2 my-lg-0 navbar-nav-scroll">
						<li className="nav-item">
							<NavLink className="nav-link" aria-current="page" to={"/browse-all-rooms"}>
								Browse all rooms
							</NavLink>
						</li>

						{isUserAdmin && (
							<li className="nav-item">
								<NavLink className="nav-link" aria-current="page" to={"/admin"}>
									Admin
								</NavLink>
							</li>
						)}
					</ul>

					<ul className="d-flex navbar-nav">
						<li className="nav-item">
							<NavLink className="nav-link" to={"/find-booking"}>
								Find my booking
							</NavLink>
						</li>

						<li className="nav-item dropdown">
							<a
								className={`nav-link dropdown-toggle ${showAccount ? "show" : ""}`}
								href="#"
								role="button"
								data-bs-toggle="dropdown"
								aria-expanded="false"
								onClick={handleAccountClick}>
								{" "}
								Account
							</a>

							<ul
								className={`dropdown-menu ${showAccount ? "show" : ""}`}
								aria-labelledby="navbarDropdown">
								{user ? (
									<Logout />
								) : (
									<li>
										<Link className="dropdown-item" to={"/login"}>
											Login
										</Link>
									</li>
								)}
							</ul>
						</li>
					</ul>
				</div>
			</div>
		</nav>
	)
}

export default NavBar