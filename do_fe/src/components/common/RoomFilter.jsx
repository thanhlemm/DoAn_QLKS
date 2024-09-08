import React, { useState } from "react"

const RoomFilter = ({ data, setFilteredData, roomTypes }) => {
	const [filter, setFilter] = useState("")

	const handleSelectChange = (e) => {
		const selectedType = e.target.value
		setFilter(selectedType)

		// const filteredRooms = data.filter((room) =>
		// 	room.roomType.toLowerCase().includes(selectedType.toLowerCase())
		// )
	// 	const filteredRooms = data.filter((room) =>
    //     room.room_type?.type.toLowerCase().includes(selectedType.toLowerCase())
    // );
	// 	setFilteredData(filteredRooms)
		const filteredRooms = data.filter((room) => {
			const roomType = roomTypes.find(type => type.id === room.room_type);
			return roomType ? roomType.type.toLowerCase().includes(selectedType.toLowerCase()) : false;
		});
		setFilteredData(filteredRooms);
	}

	const clearFilter = () => {
		setFilter("")
		setFilteredData(data)
	}

	// const roomTypes = ["", ...new Set(data.map((room) => room.room_type?.type))]
	const roomTypeOptions = ["", ...new Set(roomTypes.map((type) => type.type))];


	return (
		<div className="input-group mb-3">
			<span className="input-group-text" id="room-type-filter">
				FIlter rooms by type
			</span>
			<select
				className="form-select"
				aria-label="romm type filter"
				value={filter}
				onChange={handleSelectChange}>
				<option value="">select a room type to filter....</option>
				{roomTypeOptions.map((type, index) => (
					<option key={index} value={String(type)}>
						{String(type)}
					</option>
				))}
			</select>
			<button className="btn btn-hotel" type="button" onClick={clearFilter}>
				Clear Filter
			</button>
		</div>
	)
}
export default RoomFilter