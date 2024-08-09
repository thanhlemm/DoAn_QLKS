import React, {useEffect, useContext} from "react"  
import MainHeader from "../layout/MainHeader"
import HotelService from "../common/HotelService"
import Parallax from "../common/Parallax"
import RoomCarousel from "../common/RoomCarousel"
import RoomSearch from "../common/RoomSearch"
import PopularBranch from "../common/PopularBranch"
import { useLocation, useNavigate } from "react-router-dom"
import cookie from "react-cookies";
import { MyDispatchContext } from '../utils/MyContext';
import axios from "axios";




// import { useAuth } from "../auth/AuthProvider"
const Home = () => {
	const location = useLocation();
    const navigate = useNavigate();
    const dispatch = useContext(MyDispatchContext);

    useEffect(() => {
        const fetchData = async () => {
            const queryParams = new URLSearchParams(window.location.search);
            const token = queryParams.get("token");
			console.log(queryParams)
			const expires = new Date();
			expires.setDate(expires.getDate() + 7); // Token expires in 7 days
            if (token) {
                // Lưu token vào cookie với thời gian sống (expires) và đường dẫn (path)
				cookie.save("token", token, { expires, path: "/" });

                try {
                    // Yêu cầu thông tin người dùng từ API
                    let userdata = await axios.get("http://127.0.0.1:8000/auth/user/current-user/", {
                        headers: {
                            'Authorization': `Token ${token}`
                        }
                    });

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
                queryParams.delete("token");
                // window.history.replaceState(null, null, window.location.pathname);
				window.history.replaceState(null, '', `${window.location.pathname}?${queryParams.toString()}`);
            } 
            // Điều hướng tới trang chủ
            navigate("/");
        };

        fetchData();
    }, [navigate, dispatch]);
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