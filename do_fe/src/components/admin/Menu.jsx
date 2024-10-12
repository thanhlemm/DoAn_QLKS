import React from 'react'
import "./Menu.css";
import { Link } from "react-router-dom"
import { FaBed, FaUsersCog, FaWalking, FaBullhorn, FaTag, FaChartLine } from "react-icons/fa";


const Menu = () => {
  return (
    <ul className='menu-list'> 
      <li className='menu--list-item'>
        <Link to={"/existing-rooms"}>
          <FaBed />
           Rooms
        </Link>
      </li>
      <li className='menu--list-item'>
        <Link to={"/existing-roomtypes"}>
          <FaBed />
           Roomtypes
        </Link>
      </li>
      {/* <li className='menu--list-item'>
        <Link to={"/existing-bookings"}>
          <FaBed />
           Bookings
        </Link>
      </li> */}
      <li className='menu--list-item'>
        <Link to={"/existing-employees"}>
          <FaUsersCog />
           Employees
        </Link>
      </li>
      <li className='menu--list-item'>
        <Link to={"/existing-customers"}>
          <FaUsersCog />
           Customers
        </Link>
      </li>
      <li className='menu--list-item'>
        <Link to={"/existing-coupons"}>
        <FaTag />
          Coupons
        </Link>
      </li>
    </ul>
  )
}

export default Menu
