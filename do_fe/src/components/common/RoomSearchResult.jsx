import React, { useState, useEffect, useContext } from "react"
import RoomCard from "../room/RoomCard"
import { Button, Row } from "react-bootstrap"
import RoomPaginator from "./RoomPaginator"
import { MyUserContext } from '../utils/MyContext';  


const RoomSearchResults = ({ results= [], onClearSearch }) => {
	const [currentPage, setCurrentPage] = useState(1)
	const resultsPerPage = 3
	const totalResults = results.length
	const totalPages = Math.ceil(totalResults / resultsPerPage)
	const user = useContext(MyUserContext);  // Assuming there's a user context
	const [selectionData, setSelectionData] = useState({});

	useEffect(() => {
		loadSelectionData();
	}, []);
	
	  const loadSelectionData = () => {
		// Load the user's cart from localStorage
		const storedData = JSON.parse(localStorage.getItem(`selection_data_${user.id}`) || '{}');
		setSelectionData(storedData);
	};

	const handleAddToSelection = (room) => {
		const expirationTime = Date.now() + 3 * 60 * 1000; // 3 minutes expiry time for the room selection
	
		try {
		  const currentData = JSON.parse(localStorage.getItem(`selection_data_${user.id}`) || '{}');
		  const newRoomData = {
			[room.id]: {
			  ...room,
			  expirationTime
			}
		  };
	
		  const updatedData = { ...currentData, ...newRoomData };
		  localStorage.setItem(`selection_data_${user.id}`, JSON.stringify(updatedData));
		  setSelectionData(updatedData);
	
		  alert('Room added to cart successfully');
		} catch (error) {
		  alert('Failed to add room to cart');
		  console.error(error);
		}
	};

	const isRoomInSelection = (roomId) => {
		const selection = JSON.parse(localStorage.getItem(`selection_data_${user.id}`) || '{}');
		return Object.keys(selection).includes(String(roomId));
	};

	const handlePageChange = (pageNumber) => {
		setCurrentPage(pageNumber)
	}

	const startIndex = (currentPage - 1) * resultsPerPage
	const endIndex = startIndex + resultsPerPage
	const paginatedResults = results.slice(startIndex, endIndex)

	return (
		<>
			{totalResults > 0 ? (
				<>
					<h5 className="text-center mt-5">Search Results</h5>
					<Row>
						{paginatedResults.map((room) => (
							<div key={room.id} className="col-md-4 mb-4" style={{textAlign:"-webkit-center"}}>
								<RoomCard key={room.id} room={room} />
								<Button
									variant="primary"
									className="mt-2"
									onClick={() => handleAddToSelection(room)}
									disabled={isRoomInSelection(room.id)}
									>
									Add to Cart
								</Button>
							</div>
						))}
					</Row>
					<Row>
						{totalResults > resultsPerPage && (
							<RoomPaginator
								currentPage={currentPage}
								totalPages={totalPages}
								onPageChange={handlePageChange}
							/>
						)}
						<Button variant="secondary" onClick={onClearSearch}>
							Clear Search
						</Button>
					</Row>
				</>
			) : (
				<p></p>
			)}
		</>
	)
}

export default RoomSearchResults