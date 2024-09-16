import React from 'react'
// import "./Menu.css";
import { Link } from "react-router-dom"
import { FaBed, FaUsersCog, FaWalking, FaBullhorn, FaTag, FaChartLine } from "react-icons/fa";


const Menu = () => {
  return (
    <ul className='space-y-3 w-full'> 
      <li className='bg-primary rounded-md py-2 w-full flex items-center justify-center gap-2'>
      <FaBed className='material-symbols-outlined'/>
        <Link to={"/existing-rooms"} style={{color: "white"}}>
           Rooms
        </Link>
      </li>
      
    </ul>
  )
}

export default Menu
