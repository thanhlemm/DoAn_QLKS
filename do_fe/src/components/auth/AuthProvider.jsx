// import React, { createContext, useState, useContext } from "react"
// import jwt_decode from "jwt-decode"

// export const AuthContext = createContext({
// 	user: null,
// 	handleLogin: (token) => {},
// 	handleLogout: () => {}
// })

// export const AuthProvider = ({ children }) => {
// 	const [user, setUser] = useState(null)

// 	const handleLogin = (token) => {
// 		const decodedUser = jwt_decode(token)
// 		localStorage.setItem("userId", decodedUser.sub)
// 		localStorage.setItem("userRole", decodedUser.roles)
// 		localStorage.setItem("token", token)
// 		setUser(decodedUser)
// 	}

// 	const handleLogout = () => {
// 		localStorage.removeItem("userId")
// 		localStorage.removeItem("userRole")
// 		localStorage.removeItem("token")
// 		setUser(null)
// 	}

// 	return (
// 		<AuthContext.Provider value={{ user, handleLogin, handleLogout }}>
// 			{children}
// 		</AuthContext.Provider>
// 	)
// }

// export const useAuth = () => {
// 	return useContext(AuthContext)
// }

// import React, { createContext, useState, useContext } from "react";
// import { jwtDecode } from "jwt-decode";  

// // Tạo Context
// export const AuthContext = createContext({
//     user: null,
//     handleLogin: (token) => {},
//     handleLogout: () => {}
// });

// export const AuthProvider = ({ children }) => {
//     const [user, setUser] = useState(null);

//     const handleLogin = (token) => {
//         try {
//             const decodedUser = jwtDecode(token);
//             localStorage.setItem("token", token);

//             // Gán giá trị cho user từ decoded token
//             const userData = {
//                 username: decodedUser.username,
//                 fullname: decodedUser.fullname,
//                 avatar: decodedUser.avatar,
//                 DOB: decodedUser.DOB,
//                 address: decodedUser.address,
//                 phone: decodedUser.phone,
//                 sex: decodedUser.sex,
//                 role: decodedUser.role,
//             };
//             localStorage.setItem("user", JSON.stringify(userData));
//             setUser(userData);
//         } catch (error) {
//             console.error("Invalid token:", error);
//             // Handle invalid token case
//         }
//     };

//     const handleLogout = () => {
//         localStorage.removeItem("token");
//         localStorage.removeItem("user");
//         setUser(null);
//     };

//     return (
//         <AuthContext.Provider value={{ user, handleLogin, handleLogout }}>
//             {children}
//         </AuthContext.Provider>
//     );
// };

// export const useAuth = () => {
//     return useContext(AuthContext);
// };

