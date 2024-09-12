import React, { useState, useEffect } from "react"
import { getRoomTypesByBranchId } from "../utils/ApiFunctions"

const RoomTypeSelector = ({ handleRoomInputChange, newRoom, branchId }) => {
    const [roomTypes, setRoomTypes] = useState([])
    const [showNewRoomTypeInput, setShowNewRoomTypeInput] = useState(false)
    const [newRoomType, setNewRoomType] = useState("")

    useEffect(() => {
        if (branchId) {
            getRoomTypesByBranchId(branchId)
                .then((types) => {
                    setRoomTypes(types)
                })
                .catch((error) => {
                    console.log(error)
                })
        }
    }, [branchId])

    const handleNewRoomTypeInputChange = (e) => {
        setNewRoomType(e.target.value)
    }

    const handleAddNewRoomType = () => {
        if (newRoomType !== "") {
            setRoomTypes([...roomTypes, { id: newRoomType, type: newRoomType }])
            setNewRoomType("")
            setShowNewRoomTypeInput(false)
        }
    }

    return (
        <>
            <select
                required
                className="form-select"
                name="roomType"
                onChange={handleRoomInputChange}
                value={newRoom.roomType}>
                <option value="">Select a room type</option>
                {roomTypes.length > 0 ? (
                    roomTypes.map((type, index) => (
                        <option key={index} value={type.id}>
                            {type.type}
                        </option>
                    ))
                ) : (
                    <option value="" disabled>No room types available</option>
                )}
                {/* <option value="Add New">Add New</option> */}
            </select>
            {showNewRoomTypeInput && (
                <div className="mt-2">
                    <div className="input-group">
                        <input
                            type="text"
                            className="form-control"
                            placeholder="Enter New Room Type"
                            value={newRoomType}
                            onChange={handleNewRoomTypeInputChange}
                        />
                        <button className="btn btn-hotel" type="button" onClick={handleAddNewRoomType}>
                            Add
                        </button>
                    </div>
                </div>
            )}
        </>
    )
}

export default RoomTypeSelector
