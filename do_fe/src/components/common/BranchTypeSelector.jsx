import React, { useState, useEffect } from "react";
import { getAllBranches } from "../utils/ApiFunctions"; // Đảm bảo bạn có hàm này trong ApiFunctions.js

const BranchTypeSelector = ({ handleBranchInputChange, newBranch = {} }) => {
    const [branches, setBranches] = useState([]);

    useEffect(() => {
        getAllBranches().then((data) => {
            setBranches(data);
        }).catch((error) => {
            console.error('Error fetching branches:', error);
        });
    }, []);

    return (
        <>
            {branches.length > 0 && (
                <div>
                    <select
                        required
                        className="form-select"
                        name="branch"
                        onChange={handleBranchInputChange}
                        value={newBranch.branch || ""}>
                        <option value="">Select a branch</option>
                        {branches.map((branch) => (
                            <option key={branch.id} value={branch.id}>
                                {branch.name}
                            </option>
                        ))}
                    </select>
                </div>
            )}
        </>
    );
};

export default BranchTypeSelector;
