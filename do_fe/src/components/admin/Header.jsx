import React, { useContext } from "react";
import { IoLogOutOutline, IoNotifications, IoSearch } from "react-icons/io5";
import "./Header.css";
import { MyUserContext, MyDispatchContext } from '../utils/MyContext';
import { useNavigate } from "react-router-dom"
import cookie from "react-cookies";

const Header = () => {
  const user = useContext(MyUserContext);
  const dispatch = useContext(MyDispatchContext);
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
    <div className='header-admin'>
      <h2 className="header-title-admin">Oceanhotel</h2>

      <div className='search-box'>
        <input type="text" placeholder='Search...' />
        <IoSearch className="search-icon" />
      </div>

      <div className="user-box">
        <IoNotifications className="user--icon" />
        <IoLogOutOutline
          className="user--icon"
          onClick={handleLogout} // Xử lý sự kiện click
        />
      </div>
    </div>
  )
}

export default Header;
