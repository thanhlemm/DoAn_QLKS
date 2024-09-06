import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { MyUserContext } from '../utils/MyContext';

const RequireAdmin = ({ children }) => {
    const user = useContext(MyUserContext);

    if (!user || user.role.name !== "Admin") {
        // Nếu người dùng không có quyền admin, chuyển hướng về trang không có quyền
        return <Navigate to="/no-access" replace />;
    }

    return children;
};

export default RequireAdmin;
