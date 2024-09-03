import React, { useState } from 'react'

import {IoIosArrowBack, IoIosArrowForward} from "react-icons/io"
import "./Sidebar.css"
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
            <div className="sidebar--logo">Ocean Admin</div>
            <Menu />
        </div>
      
    </div>
  )
}

export default Sidebar
