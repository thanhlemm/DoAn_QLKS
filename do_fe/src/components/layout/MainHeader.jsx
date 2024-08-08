import React from "react"
import RoomSearch from "../common/RoomSearch"


const MainHeader = () => {
	return (
		<header className="header-banner">
			<div className="overlay"></div>
			<div className="animated-texts overlay-content">
				<h1>
					Welcome to <span className="hotel-color"> Ocean Hotel</span>
				</h1>
				<h4>Experience the Best Hospitality in Town</h4>
				
			</div>
			<RoomSearch />
		</header>
	)
}

export default MainHeader