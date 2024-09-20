import React, {useEffect, useContext, useState} from "react"  
import MainHeader from "../layout/MainHeader"
import HotelService from "../common/HotelService"
import Parallax from "../common/Parallax"
import RoomCarousel from "../common/RoomCarousel"
// import RoomSearch from "../common/RoomSearch"
import PopularBranch from "../common/PopularBranch"
import { useLocation, useNavigate } from "react-router-dom"
import cookie from "react-cookies";
import { MyDispatchContext } from '../utils/MyContext';
import { authAPI,endpoints } from "../utils/ApiFunctions"
import RoomSearchResult from "../common/RoomSearchResult"



// import { useAuth } from "../auth/AuthProvider"
const Home = () => {
	const location = useLocation();
    const navigate = useNavigate();
    const dispatch = useContext(MyDispatchContext);
    const [availableRooms, setAvailableRooms] = useState([]);


    useEffect(() => {
        const fetchData = async () => {
            const queryParams = new URLSearchParams(window.location.search);
            const token = queryParams.get("token");
			const expires = new Date();
			expires.setDate(expires.getDate() + 7); // Token expires in 7 days
            if (token) {
                // Lưu token vào cookie với thời gian sống (expires) và đường dẫn (path)
				cookie.save("token", token);

                try {
                    // Yêu cầu thông tin người dùng từ API
                    let userdata = await authAPI(token).get(endpoints['current_user']);

                    // Lưu thông tin người dùng vào cookie
                    cookie.save('user', userdata.data);
                    // Cập nhật trạng thái người dùng trong Redux store
                    dispatch({
                        type: "login",
                        payload: userdata.data
                    });
                } catch (error) {
                    console.error("Lỗi khi lấy thông tin người dùng:", error);
                }

                // Sau khi lưu token, có thể xoá token khỏi URL để giữ sạch
                // queryParams.delete("token");
                window.history.replaceState(null, null, window.location.pathname);
				// window.history.replaceState(null, '', `${window.location.pathname}?${queryParams.toString()}`);
            } 
            // Điều hướng tới trang chủ
            navigate("/");
        };

        fetchData();
    }, [navigate, dispatch]);

    useEffect(() => {
        if (location.state && location.state.availableRooms) {
            setAvailableRooms(location.state.availableRooms);
        }
    }, [location.state]);

	const message = location.state && location.state.message
	const currentUser = localStorage.getItem("userId")
	return (
		<section>
			{message && <p className="text-warning px-5">{message}</p>}
			{currentUser && (
				<h6 className="text-success text-center"> You are logged-In as {currentUser}</h6>
			)}
			<MainHeader />
			<div className="container">
                {availableRooms.length > 0 && (
                    <RoomSearchResult results={availableRooms} onClearSearch={() => setAvailableRooms([])} />
                )}
				<PopularBranch />
				<Parallax />
				<RoomCarousel />
				<HotelService />
				<Parallax />
			</div>
		</section>
	)
}

export default Home