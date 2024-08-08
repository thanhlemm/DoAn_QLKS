// import React, { useContext } from "react"
// import { AuthContext } from "./AuthProvider"
// import { Link, useNavigate } from "react-router-dom"

// const Logout = () => {
// 	const auth = useContext(AuthContext)
// 	const navigate = useNavigate()

// 	const handleLogout = () => {
// 		auth.handleLogout()
// 		navigate("/", { state: { message: " You have been logged out!" } })
// 	}

// 	return (
// 		<>
// 			<li>
// 				<Link className="dropdown-item" to={"/profile"}>
// 					Profile
// 				</Link>
// 			</li>
// 			<li>
// 				<hr className="dropdown-divider" />
// 			</li>
// 			<button className="dropdown-item" onClick={handleLogout}>
// 				Logout
// 			</button>
// 		</>
// 	)
// }

// export default Logout

import React, { useContext } from "react"
import { Link, useNavigate } from "react-router-dom"
import { MyDispatchContext, MyUserContext } from '../utils/MyContext'
import cookie from "react-cookies";

const Logout = () => {
	const dispatch = useContext(MyDispatchContext)
	const navigate = useNavigate()

	const handleLogout = () => {
		// Xóa token và user từ cookie
		cookie.remove("token");
		cookie.remove("user");
		localStorage.removeItem('selection_data');
		// Cập nhật ngữ cảnh
		dispatch({ type: 'logout' });
		
		// Điều hướng về trang chủ
		navigate("/", { state: { message: "You have been logged out!" } })
	}

	return (
		<>
			<li>
				<Link className="dropdown-item" to={"/profile"}>
					Profile
				</Link>
			</li>
			<li>
				<hr className="dropdown-divider" />
			</li>
			<button className="dropdown-item" onClick={handleLogout}>
				Logout
			</button>
		</>
	)
}

export default Logout
