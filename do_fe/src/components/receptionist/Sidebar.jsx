import React, { useState } from 'react'
import { Link } from "react-router-dom"
import {IoIosArrowBack, IoIosArrowForward} from "react-icons/io"
// import "./Sidebar.css"
import Menu from "./Menu"
const Sidebar = () => {
    const [isOpen, setIsOpen] = useState(false);

    const toogle = () => setIsOpen(!isOpen)

  return (
    <div className="sidebar-container">
        <div className="sidebar-toggle" onClick={toogle}>
            {isOpen ? <IoIosArrowBack/> : <IoIosArrowForward />}
        </div>
        <div className={isOpen ? "sidebar open":"sidebar"}>
            <div className=' bg-neutral-50 h-full flex flex-col items-center'>
              <Link to={"/receptionist"} >
                <div className="text-3xl font-title font-bold mb-6">Ocean Receptionist</div>
              </Link>
              <Menu />
            </div>
        </div>
      
    </div>
  )
}

export default Sidebar
