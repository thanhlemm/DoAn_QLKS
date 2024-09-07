import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { MyUserContext } from '../utils/MyContext';

const RequireReceptionist = ({ children }) => {
    const user = useContext(MyUserContext);

    if (!user || user.role.name !== "Lễ tân") {
        return <Navigate to="/login" replace />;
    }

    return children;
};

export default RequireReceptionist;
