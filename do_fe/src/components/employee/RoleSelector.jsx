import React from "react";

const RoleSelector = ({ handleRoleChange, selectedRole, roles }) => {
  return (
    <select
      className="form-select"
      name="role"
      value={selectedRole}
      onChange={handleRoleChange}
    >
      <option value="">Select a role...</option>
      {roles.map((role) => (
        <option key={role.id} value={role.id}>
          {role.name}
        </option>
      ))}
    </select>
  );
};

export default RoleSelector;
