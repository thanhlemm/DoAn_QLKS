import React from "react";
import { useLocation } from "react-router-dom";
import NavBar from "./NavBar";
import Footer from "./Footer";

const Layout = ({ children }) => {
    const location = useLocation();
    const showHeaderFooter = !['/login', '/register'].includes(location.pathname);

    return (
        <>
            {showHeaderFooter && <NavBar />}
            <main>{children}</main>
            {showHeaderFooter && <Footer />}
        </>
    );
};

export default Layout;
