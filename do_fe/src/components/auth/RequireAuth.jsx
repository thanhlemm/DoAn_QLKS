import React, {useContext} from "react"
import { Navigate, useLocation } from "react-router-dom"
import { MyUserContext } from '../utils/MyContext';

const RequireAuth = ({ children }) => {
	const user = useContext(MyUserContext)
	const location = useLocation()
	if (!user) {
		return <Navigate to="/login" state={{ path: location.pathname }} />
	}
	return children
}
export default RequireAuth