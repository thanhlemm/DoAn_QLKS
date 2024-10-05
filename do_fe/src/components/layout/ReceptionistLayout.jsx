/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import { Link } from "react-router-dom"


const ReceptionistLayout = ({children}) => (
  <div css={containerStyle}>
    <div css={mainContainerStyle}>
      <nav css={navStyle}>
        <Link to={"/receptionist"}>
          <h2 css={navHeaderStyle}>Lễ tân</h2>
        </Link>
        <ul css={navListStyle}>
          <li>
            <Link  to="/existing-bookings">
            <button css={buttonStyle}>Check in/Check out</button>
            </Link>
          </li>
          <li>
          <Link  to="/existing-bills">
            <button css={buttonStyle}>Bill</button>
          </Link>
          </li>
          <li>
            <Link  to="/existing-messages">
              <button css={buttonStyle}>Message</button>
            </Link>
          </li>
        </ul>
      </nav>
      <div css={contentStyle}>
        {children}
      </div>
    </div>
  </div>
);

const containerStyle = css`
  display: flex;
  flex-direction: column;
  // width: 100vw;
  // height: 100vh;
  align-items: center;
  justify-content: center;
  background-color: #9ca3af;
  margin: 0;
`;

const mainContainerStyle = css`
  width: 100%;
  height: 100%;
  background-color: #fff;
  // box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1);
  display: flex;
`;

const navStyle = css`
  width: 250px;
  background-color: #fff;
  height: 1300px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  align-items: center;
  box-shadow: 0px 0px 10px 0px rgba(0, 0, 0, 0.1);
`;

const navHeaderStyle = css`
  font-size: 30px;
  line-height: 36px;
  font-weight: 700;
  margin-bottom: 24px;
  color: #333;
`;

const navListStyle = css`
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding-left: 0;
`;

const buttonStyle = css`
  background-color: #fa5b30;
  border-radius: 18px;
  padding: 8px 0;
  width: 100%;
  color: #fff;
  font-weight: 700;
  border: none;
  cursor: pointer;
`;

const contentStyle = css`
  flex: 1;
`;



export default ReceptionistLayout;