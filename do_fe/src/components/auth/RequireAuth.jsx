import React from "react"
import { Navigate, useLocation } from "react-router-dom"

const RequireAuth = ({ children }) => {
	const user = useContext(MyUserContext)
	const location = useLocation()
	if (!user) {
		return <Navigate to="/login" state={{ path: location.pathname }} />
	}
	return children
}
export default RequireAuth