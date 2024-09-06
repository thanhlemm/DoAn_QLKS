import React, { useState, useEffect } from "react";

const EmployeeFilter = ({ data, setFilteredData }) => {
  const [filter, setFilter] = useState("");

  const handleSelectChange = (e) => {
    const selectedRole = e.target.value;
    setFilter(selectedRole);

    // Filter employees by role name
    const filteredEmployees = data.filter((employee) =>
      employee.role?.name === selectedRole
    );
    setFilteredData(filteredEmployees);
  };

  const clearFilter = () => {
    setFilter("");
    setFilteredData(data);
  };

  // Extract unique roles from employee data
  const roles = [
    ...new Set(
      data.map((employee) => employee.role?.name)
    ),
  ];

  return (
    <div className="input-group mb-3">
      <span className="input-group-text" id="employee-role-filter">
        Filter employees by role
      </span>
      <select
        className="form-select"
        aria-label="employee role filter"
        value={filter}
        onChange={handleSelectChange}
      >
        <option value="">Select a role to filter...</option>
        {roles.map((role, index) => (
          <option key={index} value={role}>
            {role}
          </option>
        ))}
      </select>
      <button className="btn btn-hotel" type="button" onClick={clearFilter}>
        Clear Filter
      </button>
    </div>
  );
};

export default EmployeeFilter;
