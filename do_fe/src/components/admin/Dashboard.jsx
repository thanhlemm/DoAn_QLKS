/** @jsxImportSource @emotion/react */
import { css } from "@emotion/react";
import { useState, useEffect } from "react";
import { api, authAPI, getAllRooms } from "../utils/ApiFunctions";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import * as XLSX from "xlsx";
import { getDropdownMenuPlacement } from "react-bootstrap/esm/DropdownMenu";

const Dashboard = () => {
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [chartType, setChartType] = useState("total");
  const [rooms, setRooms] = useState([]);
  const [user, setUser] = useState([]);
  const [branches, setBranches] = useState([]);

  useEffect(() => {
    fetchRooms();
    fetchUser();
    fetchBranches();
  }, []);

  const fetchRooms = async () => {
    try {
      const result = await getAllRooms();
      setRooms(result);
    } catch (error) {
      console.log(error);
    }
  };

  const getRoomNumber = (roomId) => {
    // Ensure that rooms are loaded before accessing them
    if (!rooms || rooms.length === 0) {
      return "Loading...";
    }

    const room = rooms.find((r) => r.id === roomId);
    return room ? `${room.room_number}` : "Unknown";
  };

  const fetchUser = async () => {
    try {
      const result = await api.get(`/auth/user/`);
      setUser(result.data);
    } catch (error) {
      console.log(error);
    }
  };

  const getUserName = (userId) => {
    // Ensure that rooms are loaded before accessing them
    if (!user || user.length === 0) {
      return "Loading...";
    }

    const u = user.find((r) => r.id === userId);
    return u ? `${u.first_name}` : "Unknown";
  };

  const fetchBranches = async () => {
    try {
      const response = await api.get("/hotel/branch/");
      setBranches(response.data);
    } catch (error) {
      console.error("Error fetching branches:", error);
    }
  };

  const getBranchName = (id) => {
    const branch = branches.find((branch) => branch.id === id);
    return branch ? branch.name : "Unknown";
  };

  const formatPrice = (price) => {
    const number = Math.round(price);
    return number.toLocaleString("vi-VN") + " VND";
  };

  useEffect(() => {
    const fetchBills = async () => {
      try {
        const response = await authAPI().get("/hotel/booking/");
        console.log(response.data);
        setBills(response.data);
      } catch (err) {
        setError("Failed to fetch bills");
      } finally {
        setLoading(false);
      }
    };

    fetchBills();
  }, []);

  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(
      bills.map((bill) => ({
        "Tên Khách": bill.user ? getUserName(bill.user) : "N/A", // Adjusted to get user name
        Email: bill.email,
        "Số Điện Thoại": bill.phone,
        Phòng: Array.isArray(bill.room)
          ? bill.room.map((id) => getRoomNumber(id)).join(", ")
          : getRoomNumber(bill.room), // Display room numbers
        "Ngày Đặt": new Date(bill.date).toLocaleString(),
        "Ngày Nhận": new Date(bill.check_in_date).toLocaleDateString(),
        "Ngày Trả": new Date(bill.check_out_date).toLocaleDateString(),
        "Thành Tiền": formatPrice(bill.total),
        "Trạng Thái": bill.payment_status,
      }))
    );

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Hóa Đơn");

    XLSX.writeFile(workbook, "Danh_Sach_Hoa_Don.xlsx");
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  const totalChartData = bills.map((bill) => ({
    name: bill.user ? bill.user.name : "N/A",
    total_amount: Math.floor(Number(bill.total)),
  }));

  const dailyRevenueData = bills.reduce((acc, bill) => {
    const date = new Date(bill.date).toLocaleDateString();
    if (!acc[date]) {
      acc[date] = 0;
    }
    acc[date] += Math.floor(Number(bill.total));
    return acc;
  }, {});

  const dailyRevenueChartData = Object.keys(dailyRevenueData).map((date) => ({
    name: date,
    total_amount: dailyRevenueData[date],
  }));

  const monthlyRevenueData = bills.reduce((acc, bill) => {
    const month = new Date(bill.date).toLocaleString("default", {
      month: "long",
    });
    if (!acc[month]) {
      acc[month] = 0;
    }
    acc[month] += Math.floor(Number(bill.total));
    return acc;
  }, {});

  const monthlyRevenueChartData = Object.keys(monthlyRevenueData).map(
    (month) => ({
      name: month,
      total_amount: monthlyRevenueData[month],
    })
  );

  const branchRevenueData = bills.reduce((acc, bill) => {
    const branchName = bill.branch ? getBranchName(bill.branch) : "Unknown";
    if (!acc[branchName]) {
      acc[branchName] = 0;
    }
    acc[branchName] += Math.floor(Number(bill.total));
    return acc;
  }, {});

  const branchRevenueChartData = Object.keys(branchRevenueData).map(
    (branchName) => ({
      name: branchName,
      total_amount: branchRevenueData[branchName],
    })
  );

  const roomRevenueData = bills.reduce((acc, bill) => {
    const rooms = bill.room.map((room) => getRoomNumber(room));
    rooms.forEach((room) => {
      if (!acc[room]) {
        acc[room] = 0;
      }
      acc[room] += Math.floor(Number(bill.total));
    });
    return acc;
  }, {});

  const roomRevenueChartData = Object.keys(roomRevenueData).map((room) => ({
    name: room,
    total_amount: roomRevenueData[room],
  }));

  const customerData = bills.reduce((acc, bill) => {
    const customerName = bill.user ? getUserName(bill.user) : "N/A";
    if (!acc[customerName]) {
      acc[customerName] = 0;
    }
    acc[customerName] += Math.floor(Number(bill.total));
    return acc;
  }, {});

  const topCustomers = Object.entries(customerData)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([name, total_amount]) => ({ name, total_amount }));

  const getChartData = () => {
    switch (chartType) {
      case "total":
        return totalChartData;
      case "daily":
        return dailyRevenueChartData;
      case "monthly":
        return monthlyRevenueChartData;
      case "room":
        return roomRevenueChartData;
      case "topCustomers":
        return topCustomers;
      case "branch":
        return branchRevenueChartData;
      default:
        return totalChartData;
    }
  };

  return (
    <div css={containerStyle}>
      <h1 css={headerStyle}>DASHBOARD</h1>

      <div css={buttonGroupStyle}>
        <button onClick={() => setChartType("total")}>Tổng Hóa Đơn</button>
        <button onClick={() => setChartType("daily")}>
          Doanh Thu Theo Ngày
        </button>
        <button onClick={() => setChartType("monthly")}>
          Doanh Thu Theo Tháng
        </button>
        <button onClick={() => setChartType('branch')}>Doanh Thu Theo Chi Nhánh</button>
        <button onClick={() => setChartType("room")}>
          Doanh Thu Theo Phòng
        </button>
        <button onClick={() => setChartType("topCustomers")}>
          Top 5 Khách Hàng
        </button>
        <button onClick={exportToExcel}>Xuất Hóa Đơn</button>
      </div>

      <h2 css={chartHeaderStyle}>Biểu đồ thống kê</h2>
      <ResponsiveContainer width="100%" height={400}>
        <BarChart data={getChartData()}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="total_amount" fill="#ff6347" />
        </BarChart>
      </ResponsiveContainer>

      <div css={tableWrapperStyle}>
        <table css={tableStyle}>
          <thead>
            <tr>
              <th>ID Booking</th>
              <th>Tên Khách</th>
              <th>Email</th>
              <th>Số Điện Thoại</th>
              <th>Chi nhánh </th>
              <th>Phòng</th>
              <th>Ngày Đặt</th>
              <th>Ngày Nhận</th>
              <th>Ngày Trả</th>
              <th>Thành Tiền</th>
              <th>Trạng Thái</th>
            </tr>
          </thead>
          <tbody>
            {bills.map((bill) => (
              <tr key={bill.id}>
                <td>{bill.id}</td>
                <td>{bill.user ? getUserName(bill.user) : "N/A"}</td>
                <td>{bill.email}</td>
                <td>{bill.phone}</td>
                <td>{bill.branch ? getBranchName(bill.branch) : 'Unknown'} </td> 
                <td>
                  {Array.isArray(bill.room)
                    ? bill.room.map((id) => getRoomNumber(id)).join(", ")
                    : getRoomNumber(bill.room)}
                </td>
                <td>{new Date(bill.date).toLocaleString()}</td>
                <td>{new Date(bill.check_in_date).toLocaleDateString()}</td>
                <td>{new Date(bill.check_out_date).toLocaleDateString()}</td>
                <td>{formatPrice(bill.total)}</td>
                <td>{bill.payment_status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// Styles
const containerStyle = css`
  padding: 4rem;
  padding-top: 0px;
  background-color: #f9f9fb;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const headerStyle = css`
  margin-bottom: 2rem;
  font-size: 24px;
  color: #333;
  text-align: center;
`;

const chartHeaderStyle = css`
  margin: 2rem 0;
  font-size: 20px;
  color: #333;
  text-align: center;
`;

const buttonGroupStyle = css`
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;

  button {
    padding: 0.5rem 1rem;
    background-color: #ff6347;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;

    &:hover {
      background-color: #ff4500;
    }
  }
`;

const tableWrapperStyle = css`
  width: 100%;
  background-color: #fff;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  overflow: hidden;
`;

const tableStyle = css`
  width: 100%;
  border-collapse: collapse;

  th,
  td {
    padding: 1rem;
    text-align: left;
  }

  th {
    background-color: #f0f0f0;
    font-weight: 600;
    color: #555;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    border-bottom: 2px solid #ddd;
  }

  td {
    border-bottom: 1px solid #eee;
    font-size: 1rem;
    color: #333;
  }

  tr:hover {
    background-color: #f7f7f7;
  }

  tr:nth-child(even) {
    background-color: #fafafa;
  }
`;

export default Dashboard;
