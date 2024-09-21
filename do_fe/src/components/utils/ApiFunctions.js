import axios from "axios"
// import moment from "moment";
import cookie from "react-cookies";

// const BASE_URL="http://127.0.0.1:8000"
const BASE_URL="https://oceanhotel.pythonanywhere.com"
export const endpoints = {
    'login': '/o/token/',
	'current_user': '/auth/user/current-user/',
	'googleCallbackLogin': `${BASE_URL}/auth/google/callback/login`,
	'facebookCallbackLogin': `${BASE_URL}/auth/facebook/callback/login`,
	'send_email': '/hotel/sendemail/',
	'roomtypeById' : (id) => `/hotel/roomtypes/${id}/`,
	'getEmployees' : '/auth/user/',
	'deleteEmployee': (id) => `/auth/user/${id}/delete-account/`,
	'getRoles': '/auth/role/',
	'check_in': (id) => `/hotel/booking/${id}/check-in/`,
	'check_out': (id) => `/hotel/booking/${id}/check-out/`,
	'verify_coupon': '/hotel/coupon/get-coupon/',
	'booking_info': (id) => `/hotel/booking/${id}/`,
	'get_couponByID': (id) => `/hotel/coupon/${id}`,
	'get_invoices': "/hotel/invoices/"
};


export const api = axios.create({
	baseURL: BASE_URL
})

// Hàm tạo instance axios với Authorization header
export const authAPI = (accessToken) => {
    accessToken = cookie.load('token');
    return axios.create({
        baseURL: BASE_URL,
        headers: {
            'Authorization': `Bearer ${accessToken}`
        }
    });
};


export const googleLogin = async () => {
    try {
        const response = await api.get(`/auth/login/google/`);
        return response.data;
    } catch (error) {
        console.error('Error during Google login:', error);
        throw error;
    }
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
			headers: getHeader()
		})
		return response.data
	} catch (error) {
		throw error
	}
}
export const checkPasswordStatus = async () => {
	const token = cookie.load('token');
    try {
        const response = await api.get('/auth/user/password_status/', {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        return response.data;
    } catch (error) {
        console.error('Error fetching password status:', error);
        throw error;
    }
}; 

export const NewPassword = async (newPassword, confirmNewPassword, token) => {
    if (newPassword !== confirmNewPassword) {
        throw new Error('Passwords do not match.');
    }

    const response = await api.post(`/auth/user/set_password/`, { newPassword }, {
		headers: {
			'Content-Type': 'application/json',
			'Authorization': `Bearer ${cookie.load('token')}`, // Sử dụng token nếu cần
		},
	});

    return response.data;
};
export const changePassword = async (oldPassword, newPassword, token) => {
    const response = await api.post('/auth/user/change_password/', {
        oldPassword,
        newPassword
    }, {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });

    return response.data;
};



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

  /* This function get booking by the cnfirmation code */
export async function getBookingByConfirmationCode(confirmationCode) {
	try {
		const result = await api.get(`/hotel/booking/confirmation/`, {
			params: {
				confirmationCode: confirmationCode,
			},
		});
		return result.data
	} catch (error) {
		if (error.response && error.response.data) {
			throw new Error(error.response.data)
		} else {
			throw new Error(`Error find booking : ${error.message}`)
		}
	}
}

export const getHeader = () => {
	const token = localStorage.getItem("token")
	return {
		Authorization: `Bearer ${token}`,
		"Content-Type": "application/json"
	}
}

/* This function adds a new room room to the database */
export async function addRoom(branchId, roomTypeId, roomNumber, isAvailable) {
	const payload = {
	  branch: branchId,
	  room_type: roomTypeId,
	  room_number: roomNumber,
	  is_available: isAvailable
	};
  
	try {
	  const response = await api.post("/hotel/rooms/", payload);
	  return response.status === 201;
	} catch (error) {
	  console.error("Error adding room:", error);
	  return false;
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
		const result = await api.patch(`/hotel/rooms/${roomId}/delete-room/`, {
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
		const result = await api.get(`/hotel/rooms/${roomId}`)
		return result.data
	} catch (error) {
		throw new Error(`Error fetching room ${error.message}`)
	}
}

/* This function saves a new booking to the database */
export async function bookRoom(booking, couponCode) {
	try {
	  const data = { ...booking, code: couponCode };
  
	  const response = await api.post(`/hotel/booking/book/`, data);
  
	  return response.data;
	} catch (error) {
	  if (error.response && error.response.data) {
		throw new Error(error.response.data.error || 'Error booking room');
	  } else {
		throw new Error(`Error booking room: ${error.message}`);
	  }
	}
  }

/* This function gets alll bokings from the database */
export async function getAllBookings() {
	try {
		const result = await api.get("/hotel/booking/", {
			// headers: getHeader()
		})
		return result.data
	} catch (error) {
		throw new Error(`Error fetching bookings : ${error.message}`)
	}
}


/* This is the function to cancel user booking */
export async function cancelBooking(bookingId) {
	try {
		const result = await api.post(`/hotel/booking/${bookingId}/cancel-booking/`)
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


/* This is the function to get user bookings by the user id */
export async function getBookingsByUserId(userId) {
	try {
		const response = await api.get(`/hotel/booking/bookings_by_userid/`, {
			// headers: getHeader()
			params: { user_id: userId }
		})
		return response.data
	} catch (error) {
		console.error("Error fetching bookings:", error.message)
		throw new Error("Failed to fetch bookings")
	}
}

export const addEmployee = async (username, first_name, last_name, DOB, address, phone, email, sex, role, password, isActive, avatar) => {
	try {
	  // Create FormData object to handle both text and file data
	  const formData = new FormData();
	  formData.append("username", username);
	  formData.append("first_name", first_name);
	  formData.append("last_name", last_name);
	  formData.append("DOB", DOB);
	  formData.append("address", address);
	  formData.append("phone", phone);
	  formData.append("email", email);
	  formData.append("sex", sex);
	  formData.append("role", role);
	  formData.append("password", password);
	  formData.append("password2", password); // Confirm password
	  formData.append("is_active", isActive);
  
	  // Append avatar only if the file is provided
	  if (avatar) {
		formData.append("avatar", avatar);
	  }
	  const response = await api.post("/auth/user/add-employee/", formData, {
		headers: {
		  "Content-Type": "multipart/form-data", // Important for file upload
		},
	  });
  
	  return response.data;
	} catch (error) {
	  console.error("Error adding employee:", error);
	  throw error;
	}
  };

  export async function deleteEmployee(AccId) {
	const confirmed = window.confirm("Bạn có muốn xoá account này?")
	if(confirmed){
		try {
			const result = await api.patch(`/auth/user/${AccId}/delete-account/`, {
				// headers: getHeader()
			})
			return result.data
		} catch (error) {
			throw new Error(`Error deleting room type ${error.message}`)
		}
	}
}

export const updateEmployee = async (employeeId, employeeData) => {
	try {
	  // Create FormData object to handle both text and file data
	  const formData = new FormData();
        for (const key in employeeData) {
            if (employeeData.hasOwnProperty(key)) {
                formData.append(key, employeeData[key]);
            }
        }
  
	  // Send the request
	  const response = await api.patch(`/auth/user/${employeeId}/update-employee/`, formData, {
		headers: {
		  "Content-Type": "multipart/form-data", // Important for file upload
		},
	  });
  
	  return response;
	} catch (error) {
	  console.error("Error updating employee:", error);
	  throw error;
	}
  };

  export async function deleteRoomType(roomTypeId) {
	const confirmed = window.confirm("Bạn có muốn xoá loại phòng này?")
	if(confirmed){
		try {
			const result = await api.patch(`/hotel/roomtypes/${roomTypeId}/delete-roomtypes/`, {
				// headers: getHeader()
			})
			console.log(result)
			return result
		} catch (error) {
			throw new Error(`Error deleting room type ${error.message}`)
		}
	}
}

export async function getRoomTypeById(roomTypeId) {
	try {
		const result = await api.get(`/hotel/roomtypes/${roomTypeId}/`)
		console.log(result.data)
		return result.data
	} catch (error) {
		throw new Error(`Error fetching room ${error.message}`)
	}
}

export async function updateRoomType(roomTypeId, roomTypeData) {
    // Nếu có ảnh mới, tải lên Cloudinary và lấy URL
    let imageUrl = roomTypeData.image;
    if (roomTypeData.image && typeof roomTypeData.image === 'object') {
        const fullImageUrl = await uploadToCloudinary(roomTypeData.image);
        imageUrl = fullImageUrl; // Chỉ lấy phần cần thiết của URL
    }

    const formData = new FormData();
    formData.append("branch", roomTypeData.branch); 
    formData.append("type", roomTypeData.type);
    formData.append("price", roomTypeData.price);
    formData.append("number_of_beds", roomTypeData.number_of_beds);
    formData.append("room_capacity", roomTypeData.room_capacity);
    if (imageUrl) formData.append("image", imageUrl); 

    try {
        console.log(...formData.entries());
        const response = await api.patch(`/hotel/roomtypes/${roomTypeId}/`, formData, {
			headers: {
				'Content-Type': 'multipart/form-data'
			}
		});
        return response.data;
    } catch (error) {
        console.error('Error updating room type:', error);
        throw error;
    }
}

export async function addRoomType(branch, type, price, number_of_beds, room_capacity, imageUrl) {
    // Tạo FormData để gửi dữ liệu kiểu multipart/form-data
    const formData = new FormData();
    formData.append('branch', branch);
    formData.append('type', type);
    formData.append('price', price);
    formData.append('number_of_beds', number_of_beds);
    formData.append('room_capacity', room_capacity);
    formData.append('image', imageUrl);

    try {
        const response = await api.post("/hotel/roomtypes/", formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });

        if (response.status === 201) {
            return true;
        } else {
            return false;
        }
    } catch (error) {
        console.error("Error in API call: ", error.response ? error.response.data : error.message);
        return false;
    }
}

export const getFeedbacksByUser = async (token) => {
    try {
        const response = await api.get('/hotel/feedback/', {
            headers: {
                Authorization: `Bearer ${token}`, // Gửi token xác thực
				'Content-Type': 'application/json',
            },
        });
        return response.data;
    } catch (error) {
        console.error('Error fetching feedbacks:', error);
        throw error;
    }
};

export const createFeedback = async (feedbackData, token) => {
    try {
        const response = await api.post('/hotel/feedback/', feedbackData, {
            headers: {
                Authorization: `Bearer ${token}`, // Gửi token xác thực
                'Content-Type': 'application/json',
            },
        });
        return response.data;
    } catch (error) {
        console.error('Error creating feedback:', error);
        throw error;
    }
};

export async function deleteCoupon(couponId) {
	try {
		const result = await api.patch(`/hotel/coupon/${couponId}/delete-coupon/`, {
			// headers: getHeader()
		})
		return result.data
	} catch (error) {
		throw new Error(`Error deleting room ${error.message}`)
	}
}
  