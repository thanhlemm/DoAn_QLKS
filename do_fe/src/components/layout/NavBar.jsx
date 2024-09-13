import React, { useContext, useState, useEffect } from "react"; 
import { NavLink, Link } from "react-router-dom"
import Logout from "../auth/Logout"
import { MyUserContext } from '../utils/MyContext';
import { api, endpoints } from "../utils/ApiFunctions"
import cookie from "react-cookies"

const NavBar = () => {
	const [showAccount, setShowAccount] = useState(false)
	const [showNotifications, setShowNotifications] = useState(false);
	const user = useContext(MyUserContext);

	const handleAccountClick = () => {
		setShowAccount(!showAccount)
	}

	const handleNotificationsClick = () => {
		setShowNotifications(!showNotifications);
	};
	const markNotificationAsRead = async (notificationId) => {
		try {
			const token = cookie.load('token');
			await api.patch(`/hotel/notification/${notificationId}/mark_as_read/`, {}, {
				headers: {
				'Authorization': `Bearer ${token}`
				}
			});
			// Update the notifications state to reflect the change
			setNotifications(prevNotifications => 
				prevNotifications.filter(notification => notification.id !== notificationId)
			);
		} catch (error) {
		  console.error('Failed to mark notification as read:', error);
		}
	};	  
	const isUserAdmin = user && user.role && user.role.name === "Admin";
	const isUserReceptionist = user && user.role && user.role.name === "Lễ tân"; // Check if user is a receptionist

	const [cartItemCount, setCartItemCount] = useState(0);
	const [notifications, setNotifications] = useState([]);

	useEffect(() => {
		if (user) {
			const selectionData = JSON.parse(localStorage.getItem(`selection_data_${user.id}`) || '{}');
			const roomIds = Object.keys(selectionData).filter(key => !isNaN(key));
			setCartItemCount(roomIds.length);
		}
		else {
			setCartItemCount([]);
		}
	}, []);

	useEffect(() => {
        const fetchNotifications = async () => {
            if (user) {
                try {
					const token = cookie.load('token')
                    // Thay thế 'your-api-url' bằng URL API thực tế của bạn
                    const response = await api.get('/hotel/notification/user_notifications/', {
                        headers: {
                            'Authorization': `Bearer ${token}`  // Đính kèm token xác thực nếu cần
                        }
                    });
                    setNotifications(response.data);
                } catch (error) {
                    console.error('Failed to fetch notifications:', error);
                }
			} else {
				// Nếu không có người dùng, xóa thông báo
				setNotifications([]);
			}
        };
        // Polling interval
		const intervalId = setInterval(() => {
			fetchNotifications();
		}, 10000); // Poll every 10 seconds
	
		// Cleanup interval on component unmount or when user changes
		return () => clearInterval(intervalId);
	}, [user]);


	
	
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

						{isUserReceptionist && (
							<>
								<li className="nav-item">
									<NavLink className="nav-link" aria-current="page" to={"/existing-bookings"}>
										Existing Bookings
									</NavLink>
								</li>
							</>
						)}
					</ul>

					<ul className="d-flex navbar-nav">
						<li className="nav-item">
							<NavLink className="nav-link" to={"/find-booking"}>
								Find my booking
							</NavLink>
						</li>
						<li className="nav-item">

						

						<NavLink className="nav-link position-relative" to={"/cart"}>
							<i className="fa fa-shopping-cart"></i> Cart
							{cartItemCount > 0 && (
							<span className="badge bg-danger position-absolute top-0 start-100 translate-middle">
								{cartItemCount}
							</span>
							)}
						</NavLink>
						</li>
						<li className="nav-item dropdown">
							<button
								className={`nav-link dropdown-toggle position-relative ${showNotifications ? "show" : ""}`}
								type="button"
								onClick={handleNotificationsClick}
								aria-expanded={showNotifications}
							>
								<i className="fa fa-bell"></i> Notifications
								{notifications.length > 0 && (
									<span className="badge bg-danger position-absolute top-0 start-100 translate-middle">
										{notifications.length}
									</span>
								)}
							</button>
							<ul
								className={`dropdown-menu ${showNotifications ? "show" : ""}`}
								aria-labelledby="navbarDropdown">
								{notifications.length > 0 ? (
									notifications.map((notification, index) => (
										<li key={index}>
											<a
												className="dropdown-item"
												href="#"
												onClick={(e) => {
													e.preventDefault(); // Prevent the default action of the anchor tag
													markNotificationAsRead(notification.id); // Mark the notification as read
												  }}
												style={{ whiteSpace: "normal", wordWrap: "break-word", overflowWrap: "break-word" }}
											>
												{notification.type === "Booking Confirmed" ? (
												`Your booking ${notification.booking} has been placed.`
												) : notification.type === "Booking Cancelled" ? (
												`Your booking ${notification.booking} has been cancelled`
												) : notification.type === "Coupon Issued" ? (
												notification.content
												) : notification.type === "Coupon Expired" ? (
												notification.content
												) : null}
											</a>
										</li>
									))
								) : (
									<li>
										<a className="dropdown-item" href="#">
											No notifications
										</a>
									</li>
								)}
							</ul>
						</li>

						<li className="nav-item dropdown">
							<button
								className={`nav-link dropdown-toggle ${showAccount ? "show" : ""}`}
								type="button"
								onClick={handleAccountClick}
								aria-expanded={showAccount}
							>
								Account
							</button>

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