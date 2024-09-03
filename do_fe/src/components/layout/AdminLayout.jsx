import React from 'react';
import { Outlet } from "react-router-dom";

import Sidebar from "../admin/Sidebar"
import Main from "../Container/Main"
import Header from "../admin/Header"
import Content from "../Container/Content"

const AdminLayout = ({children}) => {
  return (
      <div className="app-admin">
			<Sidebar />
			<Main>
				<Content>
          {children}
				</Content>
			</Main>
		</div>

        
  );
};

export default AdminLayout;
