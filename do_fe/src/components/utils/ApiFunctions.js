import axios from "axios"
// import moment from "moment";
import cookie from "react-cookies";
export const endpoints = {
    'login': '/o/token/',

};
export const api = axios.create({
	baseURL: "http://127.0.0.1:8000"
})

// Cấu hình Axios instance
// const axiosInstance = axios.create({
//     baseURL: 'https://accounts.google.com/o/oauth2/v2/',
//     timeout: 10000,
//     headers: {
//         'Content-Type': 'application/json',
//         'Accept': 'application/json',
//     },
// });

export const googleLogin = async () => {
    try {
        const response = await api.get(`/auth/login/google/`);
        return response.data;
    } catch (error) {
        console.error('Error during Google login:', error);
        throw error;
    }
	// try {
    //     const response = await axiosInstance.get('auth', {
    //         params: {
    //             response_type: 'code',
    //             client_id: '1088786597010-8efsh4c7kh2lnkunso0o5qidbc6hcmi6.apps.googleusercontent.com',
    //             redirect_uri: 'http://127.0.0.1:8000/auth/google/callback/login',
    //             scope: 'openid https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/userinfo.profile',
    //             // state: 'random-state-string',
    //             access_type: 'offline',
    //             prompt: 'select_account',
    //         }
    //     });
    //     console.log(response.data);
    //     return response.data;
    // } catch (error) {
    //     console.error('Error during the request:', error);
    //     throw error;
    // }
};

export const googleLoginCallback = async (authCode) => {
    try {
        const response = await api.get(`/auth/google/callback/login/?code=${authCode}`);
        return response.data;
    } catch (error) {
        console.error('Error during Google login callback:', error);
        throw error;
    }
};

export const googleSignUp = async () => {
    try {
        const response = await api.get(`/auth/signup/google/`);
        return response.data;
    } catch (error) {
        console.error('Error during Google sign up:', error);
        throw error;
    }
};

export const googleSignUpCallback = async (authCode) => {
    try {
        const response = await api.get(`/auth/google/callback/signup/?code=${authCode}`);
        return response.data;
    } catch (error) {
        console.error('Error during Google sign up callback:', error);
        throw error;
    }
};

const BASE_URL="http://127.0.0.1:8000"
// Hàm tạo instance axios với Authorization header
export const authAPI = () => {
    const token = cookie.load('token');
    return axios.create({
        baseURL: BASE_URL,
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });
};


export const uploadToCloudinary = async (file) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", "roomtype"); // Thay "your_upload_preset" bằng giá trị thực tế từ Cloudinary

    try {
        const response = await axios.post("https://api.cloudinary.com/v1_1/thanhlem/image/upload", formData);
        return response.data.secure_url; // URL của ảnh đã được tải lên
    } catch (error) {
        console.error("Error uploading to Cloudinary: ", error);
        throw error;
    }
};

/* This function register a new user */
export async function registerUser(registration) {
	try {
		const response = await api.post("/auth/user/", registration)
		return response.data
	} catch (error) {
		if (error.reeponse && error.response.data) {
			throw new Error(error.response.data)
		} else {
			throw new Error(`User registration error : ${error.message}`)
		}
	}
}

/* This isthe function to delete a user */
export async function deleteUser(userId, token) {
	try {
		// Thực hiện yêu cầu xóa tài khoản với token xác thực
		const response = await api.delete(`/auth/user/${userId}/delete-account/`, {
			headers: {
				'Authorization': `Bearer ${token}` // Thêm token vào header
			}
		});
		return response.data
	} catch (error) {
		return error.message
	}
}

/* This is the function to get a single user */
export async function getUser(userId) {
	try {
		const response = await api.get(`/auth/user/${userId}/`, {
			// headers: getHeader()
		})
		console.log(response.data)
		return response.data
	} catch (error) {
		throw error
	}
}

export async function getAllBranches() {
	try {
		const result = await api.get("/hotel/branch/")
		return result.data
	} catch (error) {
		throw new Error("Error fetching branches")
	}
}

export async function getBranchDetails(id){
	try {
		const result = await api.get(`/hotel/branch/${id}/`)
		return result.data
	} catch (error) {
		throw new Error("Error fetching branch detail")
	}
  };
  
export async function getRoomTypesByBranchId (branchId){
	try {
		const result = await api.get(`/hotel/branch/${branchId}/roomtypes/`)
		return result.data
	} catch (error) {
		console.error('Error fetching roomtype of branch detail:', error.response ? error.response.data : error.message);
    	throw new Error("Error fetching roomtype of branch detail");
	}
};

export async function getRoomTypes (){
	try {
		const result = await api.get(`/hotel/roomtypes/`)
		return result.data
	} catch (error) {
		throw new Error("Error fetching roomtype")
	}
};

export const checkRoomAvailability = async (branch_id, room_type_id, checkin, checkout) => {
	try {
	  const response = await api.post(`/hotel/rooms/check-availability/`, {
		branch_id,
		room_type_id,
		checkin,
		checkout,
	  });
	  return response.data;
	} catch (error) {
	  console.error('Error checking room availability:', error);
	  throw error;
	}
  };

  export const addRoomToSelection = async (data) => {
    try {
        // Gửi dữ liệu đến API
        const response = await api.post('/hotel/rooms/add-to-selection/', data, {
            headers: {
                'Content-Type': 'application/json',
            },
        });
        // Trả về dữ liệu phản hồi từ API
        return response.data;
    } catch (error) {
        // Xử lý lỗi nếu có
        throw new Error('Error adding room to selection: ' + error.message);
    }
};










export const getHeader = () => {
	const token = localStorage.getItem("token")
	return {
		Authorization: `Bearer ${token}`,
		"Content-Type": "application/json"
	}
}

/* This function adds a new room room to the database */
export async function addRoom(photo, roomType, roomPrice) {
	const formData = new FormData()
	formData.append("photo", photo)
	formData.append("roomType", roomType)
	formData.append("roomPrice", roomPrice)

	const response = await api.post("/rooms/add/new-room", formData,{
		// headers: getHeader()
	})
	if (response.status === 201) {
		return true
	} else {
		return false
	}
}

export async function getAllRooms() {
	try {
		const result = await api.get("/hotel/rooms/")
		return result.data
	} catch (error) {
		throw new Error("Error fetching rooms")
	}
}

/* This function deletes a room by the Id */
export async function deleteRoom(roomId) {
	try {
		const result = await api.delete(`/rooms/delete/room/${roomId}`, {
			// headers: getHeader()
		})
		return result.data
	} catch (error) {
		throw new Error(`Error deleting room ${error.message}`)
	}
}

/* This function update a room */
export async function updateRoom(roomId, roomData) {
	const formData = new FormData()
	formData.append("roomType", roomData.roomType)
	formData.append("roomPrice", roomData.roomPrice)
	formData.append("photo", roomData.photo)
	const response = await api.put(`/rooms/update/${roomId}`, formData,{
		// headers: getHeader()
	})
	return response
}

/* This function gets a room by Id*/
export async function getRoomById(roomId) {
	try {
		const result = await api.get(`/rooms/room/${roomId}`)
		return result.data
	} catch (error) {
		throw new Error(`Error fetching room ${error.message}`)
	}
}

/* This function saves a new booking to the database */
export async function bookRoom(roomId, booking) {
	try {
		const response = await api.post(`/bookings/room/${roomId}/booking`, booking)
		return response.data
	} catch (error) {
		if (error.response && error.response.data) {
			throw new Error(error.response.data)
		} else {
			throw new Error(`Error booking room : ${error.message}`)
		}
	}
}

/* This function gets alll bokings from the database */
export async function getAllBookings() {
	try {
		const result = await api.get("/bookings/all-bookings", {
			// headers: getHeader()
		})
		return result.data
	} catch (error) {
		throw new Error(`Error fetching bookings : ${error.message}`)
	}
}

/* This function get booking by the cnfirmation code */
export async function getBookingByConfirmationCode(confirmationCode) {
	try {
		const result = await api.get(`/bookings/confirmation/${confirmationCode}`)
		return result.data
	} catch (error) {
		if (error.response && error.response.data) {
			throw new Error(error.response.data)
		} else {
			throw new Error(`Error find booking : ${error.message}`)
		}
	}
}

/* This is the function to cancel user booking */
export async function cancelBooking(bookingId) {
	try {
		const result = await api.delete(`/bookings/booking/${bookingId}/delete`)
		return result.data
	} catch (error) {
		throw new Error(`Error cancelling booking :${error.message}`)
	}
}

/* This function gets all availavle rooms from the database with a given date and a room type */
export async function getAvailableRooms(checkInDate, checkOutDate, roomType) {
	const result = await api.get(
		`rooms/available-rooms?checkInDate=${checkInDate}
		&checkOutDate=${checkOutDate}&roomType=${roomType}`
	)
	return result
}



/* This function login a registered user */
export async function loginUser(login) {
	try {
		const response = await api.post("/auth/login", login)
		if (response.status >= 200 && response.status < 300) {
			return response.data
		} else {
			return null
		}
	} catch (error) {
		console.error(error)
		return null
	}
}

/*  This is function to get the user profile */
export async function getUserProfile(userId, token) {
	try {
		const response = await api.get(`users/profile/${userId}`, {
			headers: getHeader()
		})
		return response.data
	} catch (error) {
		throw error
	}
}



/* This is the function to get user bookings by the user id */
export async function getBookingsByUserId(userId, token) {
	try {
		const response = await api.get(`/bookings/user/${userId}/bookings`, {
			headers: getHeader()
		})
		return response.data
	} catch (error) {
		console.error("Error fetching bookings:", error.message)
		throw new Error("Failed to fetch bookings")
	}
}