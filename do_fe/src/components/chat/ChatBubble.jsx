// import React, { useState, useContext } from 'react';
// import { api } from '../utils/ApiFunctions';
// import { MyUserContext } from '../utils/MyContext';



// const ChatBubble = ({branch}) => {
//     const user = useContext(MyUserContext);

//     const [isChatOpen, setIsChatOpen] = useState(false);
//     const [isChatMessageOpen, setIsChatMessageOpen] = useState(false);
//     const [userNameOrEmail, setUserNameOrEmail] = useState(user.username || "");
//     const [chatLog, setChatLog] = useState('');
//     const [chatSocket, setChatSocket] = useState(null);
//     const [messageInput, setMessageInput] = useState('');
//     const [senderId, setSenderId] = useState(null);



//     const toggleChat = () => {
//         if (isChatMessageOpen) {
//             setIsChatMessageOpen(false);
//         } else {
//             setIsChatOpen(!isChatOpen);
//         }
//     };

//     const toggleChatMessage = () => {
//         setIsChatOpen(false); // Make sure the chat is open
//         setIsChatMessageOpen(true);
//     };

//     const fetchReceptionistForBranch = async (branchId) => {
//         try {
//             const response = await api.get(`/hotel/branch/${branchId}/receptionists/`);
//             console.log(response)

//             const receptionists = response.data;

//             console.log("Receptionists:", receptionists);

//             if (receptionists.length > 0) {
//                 // Return the first available receptionist or choose randomly
//                 return receptionists[Math.floor(Math.random() * receptionists.length)];
//             } else {
//                 throw new Error("No receptionists found for this branch.");
//             }
//         } catch (error) {
//             console.error("Error fetching receptionists:", error);
//             throw error;
//         }
//     };
    
//     const handleSendMessage = async () => {
//         // alert("Chức năng này đang được triển khai")
//         try {
//             setIsChatOpen(false); 
//             setIsChatMessageOpen(true);
//             const receptionist = await fetchReceptionistForBranch(branch);
//             console.log(receptionist)
//             const response = await api.post("/addons/chat-rooms/create-room/", {
//                 sender: userNameOrEmail,  //khách hàng
//                 receiver: receptionist.username,  //lễ tân
//                 branch: branch,  // Gửi ID của chi nhánh
//                 customer: userNameOrEmail,
//             });
//             setSenderId(response.data.customer)
//             console.log(response)
//             if (response.status === 201){
//                 alert("Vui lòng đợi vài phút để tìm lễ tân...")
//                 const roomName = encodeURIComponent(response.data.branch);
//                 const websocketProtocol = window.location.protocol === "https:" ? "wss" : "ws";
//                 // const wsEndpoint = `${websocketProtocol}://oceanhotel.pythonanywhere.com/ws/${response.data.customer}/`;
//                 const wsEndpoint = `${websocketProtocol}://localhost:8000/ws/chat/${response.data.branch}/`;

//                 const socket = new WebSocket(wsEndpoint);
                
//                 setChatSocket(socket);
                
//                 socket.onopen = function (e) {
//                     console.log('WebSocket is connected.');
//                     // socket.send("Message send");
//                     setSenderId(response.data.sender_id); // Lưu sender ID
//                 };
                
//                 socket.onclose = function (e) {
//                     console.log('WebSocket is closed.');
//                 };
                
//                 socket.onerror = function (e) {
//                     console.error("WebSocket error:", e);
                    
//                     setTimeout(() => {
                      
//                       new WebSocket(wsEndpoint);
//                     }, 5000); 
//                 };
                
//                 socket.onmessage = function (e) {
//                     const data = JSON.parse(e.data);
//                     console.log('Message received:', data.message);
//                     setChatLog((prev) => prev + `\n${data.sender}: ${data.message}`);
//                 };
//             }

//             setIsChatMessageOpen(true);
//         } catch (error) {
//             console.error("Error in handleSendMessage:", error);
//             alert("Có thể bạn chưa đăng ký tài khoản!! Vui lòng đăng ký tài khoản")
//             if (error.response && error.response.data) {
//                 setChatLog('Error: ' + error.response.data.message);
//             } else {
//                 setChatLog('Failed to create chat room.');
//             }        
//         }
//     };

//     const sendMessage = () => {
//         if (chatSocket && chatSocket.readyState === WebSocket.OPEN) {
//             chatSocket.send(JSON.stringify({
//                 message: messageInput,
//                 sender: senderId,
//             }));
//             setMessageInput(''); 
//         } else {
//             console.error('WebSocket is not open');
//         }
//     };
    
//   return (
//     <div id="chat" className='max-w-[300px] fixed right-2 bottom-2 p-4 bg-orange-600 border boder-gray-300 rounded-xl'>
//       <div id="chat_icon">
//             <button id="chat_open" className='w-[25px] flex items-center' onClick={toggleChat}>
//             <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="h-6 text-white text-right">
//             <path stroke-linecap="round" stroke-linejoin="round" d="M8.625 12a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H8.25m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H12m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 0 1-2.555-.337A5.972 5.972 0 0 1 5.41 20.97a5.969 5.969 0 0 1-.474-.065 4.48 4.48 0 0 0 .978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25Z" />
//             </svg>

//             </button>
//       </div>

//       <div id="chat_welcome" className={isChatOpen ? '' : 'hidden'}>
//         <input type="text" name="name" id="chat_name" 
//             class="w-full mb-4 py-2 px-6 rounded-xl bg-gray-100" 
//             placeholder='Your username or email...'
//             value={userNameOrEmail}
//             onChange={(e) => setUserNameOrEmail(e.target.value)}
//         />

//         <button id="chat_join" className='py-2 px-6 rounded-xl text-white bg-rose-600'  onClick={handleSendMessage}>Join chat</button>
//       </div>

//       <div id="chat_room" className={isChatMessageOpen ? '' : 'hidden'}>
//             <div id="chat_log" class="mb-4 p-4 bg-gray-100 rounded-xl h-[250px] overflow-scroll">
//                 <p>Welcome to our chat! Please type your message and wait for an receptionist to join...</p>
//                 <p>{chatLog}</p>
//             </div>
//             <input type="text" name="body" id="chat_message_input" 
//                 class="w-full mb-4 p-4 bg-gray-100 rounded-xl" 
//                 placeholder="Type your message"
//                 value={chatLog}
//                 onChange={(e) => setChatLog(e.target.value)}
//             />
//             <button id="chat_message_submit" className='py-2 px-6 rounded-xl text-white bg-rose-600' onClick={sendMessage}>Send</button>
//      </div>
    
    
//     </div>

    

//   )
// }

// export default ChatBubble
import React, { useState, useEffect } from "react";
// import avatar_default from '../assets/default_avatar.png';

const ChatBubble = ({ currentChatUser, messages, sendMessage,  closeChatBox }) => {
  const [input, setInput] = useState("");
  const [isOpen, setIsOpen] = useState(true);

  const handleSend = () => {
    sendMessage(input);
    setInput(""); // Clear the input after sending the message
  };

  useEffect(() => {
    const mediaQuery = window.matchMedia("(max-width: 600px)");
    const handleMediaQueryChange = (event) => {
      setIsOpen(!event.matches); // Close if screen is smaller than 600px
    };

    mediaQuery.addEventListener("change", handleMediaQueryChange);
    handleMediaQueryChange(mediaQuery); // Check current screen size

    return () => {
      mediaQuery.removeEventListener("change", handleMediaQueryChange);
    };
  }, []);

  if (!currentChatUser || !isOpen) return null;

  return (
    <div className="fixed bottom-0 right-0 w-3/12 bg-white shadow-lg rounded-t-lg z-10 mr-5  border-orange-200">
      <div className="flex justify-between items-center bg-sky-300  p-3 rounded-t-lg">
        <div className="flex">
          <img
            src={currentChatUser?.avatar ? currentChatUser?.avatar : ""}
            alt="Avatar"
            className="w-8 h-8 rounded-full mx-2"
          />
          <h2 className="text-lg font-bold">{currentChatUser.username}</h2>
        </div>
        <button onClick={closeChatBox} className="text-orange-700 text-xl hover:bg-red-50 px-2">
          X
        </button>
      </div>
      <div className="flex flex-col mt-4 h-64 overflow-y-scroll pl-2">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`mb-2 flex items-start ${msg.sender_id === currentChatUser.id ? "self-start" : "self-end"}`}
          >
            {msg.sender_id === currentChatUser.id ? (
              <>
                <img
                  src={msg.sender?.avatar ? msg.sender.avatar : ""}
                  alt="Avatar"
                  className="w-8 h-8 rounded-full mr-2"
                />
                <div className={`py-1 px-3 rounded-lg bg-green-100`}>
                  <p className="text-sm">{msg.message}</p>
                </div>
              </>
            ) : (
              <>
                <div className={`py-1 px-3 rounded-lg bg-gray-200`}>
                  <p className="text-sm">{msg.message}</p>
                </div>
                <img
                  src={msg.sender?.avatar ? msg.sender.avatar : ""}
                  alt="Avatar"
                  className="w-8 h-8 rounded-full ml-2"
                />
              </>
            )}
          </div>
        ))}
      </div>
      <div className="mt-2 flex pl-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="w-[80%] pl-2 border border-gray-300 rounded-lg mr-2"
          placeholder="Type a message"
        />
        <button
          onClick={handleSend}
          className="bg-blue-400 hover:bg-blue-800 text-white p-2 rounded-lg"
        >
          Gửi
        </button>
      </div>

      
    </div>

    
  );
};

export default ChatBubble;
