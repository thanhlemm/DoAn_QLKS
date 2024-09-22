import React, { useState } from 'react';
import { api } from '../utils/ApiFunctions';


const ChatBubble = ({branch}) => {
    const [isChatOpen, setIsChatOpen] = useState(false);
    const [isChatMessageOpen, setIsChatMessageOpen] = useState(false);
    const [userNameOrEmail, setUserNameOrEmail] = useState('');
    const [chatLog, setChatLog] = useState('');
    const [chatSocket, setChatSocket] = useState(null);
    const [messageInput, setMessageInput] = useState('');
    const [senderId, setSenderId] = useState(null);



    const toggleChat = () => {
        if (isChatMessageOpen) {
            setIsChatMessageOpen(false);
        } else {
            setIsChatOpen(!isChatOpen);
        }
    };

    const toggleChatMessage = () => {
        setIsChatOpen(false); // Make sure the chat is open
        setIsChatMessageOpen(true);
    };

    const handleSendMessage = async () => {
        try {
            setIsChatOpen(false); // Make sure the chat is open
            setIsChatMessageOpen(true);
            const response = await api.post("/addons/chat-rooms/create-room/", {
                customer: userNameOrEmail,  // Gửi username hoặc email
                branch: branch  // Bạn có thể thay branch_id dựa vào chi nhánh hiện tại
            });
            setSenderId(response.data.customer)
            console.log(response)
            if (response.status === 201){
                alert("Vui lòng đợi vài phút để tìm lễ tân...")
                const websocketProtocol = window.location.protocol === "https:" ? "wss" : "ws";
                const wsEndpoint = `${websocketProtocol}://${window.location.host}/ws/${response.data.room_id}/`;
                const socket = new WebSocket(wsEndpoint);
                // const wsUrl = `wss://oceanhotel.pythonanywhere.com/ws/${response.data.room_id}/`;
                // console.log(wsUrl);  // In ra URL để kiểm tra
                
                // const socket = new WebSocket(wsUrl);
                setChatSocket(socket);
                
                socket.onopen = function (e) {
                    console.log('WebSocket is connected.');
                    setSenderId(response.data.sender_id); // Lưu sender ID
                };
                
                socket.onclose = function (e) {
                    console.log('WebSocket is closed.');
                };
                
                socket.onerror = function (e) {
                    console.error('WebSocket error:', e);
                };
                
                socket.onmessage = function (e) {
                    const data = JSON.parse(e.data);
                    console.log('Message received:', data.message);
                    setChatLog((prev) => prev + `\n${data.sender}: ${data.message}`);
                };
            }

            setIsChatMessageOpen(true);
            // setChatLog('Chat room created successfully. Start messaging...');
        } catch (error) {
            if (error.response && error.response.data) {
                setChatLog('Error: ' + error.response.data.message);
            } else {
                setChatLog('Failed to create chat room.');
            }        
        }
    };

    const sendMessage = () => {
        if (chatSocket && chatSocket.readyState === WebSocket.OPEN) {
            chatSocket.send(JSON.stringify({
                message: messageInput,
                sender: senderId,
            }));
            setMessageInput(''); // Reset input field
        } else {
            console.error('WebSocket is not open');
        }
    };
    
  return (
    <div id="chat" className='max-w-[300px] fixed right-2 bottom-2 p-4 bg-orange-600 border boder-gray-300 rounded-xl'>
      <div id="chat_icon">
            <button id="chat_open" className='w-[25px] flex items-center' onClick={toggleChat}>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="h-6 text-white text-right">
            <path stroke-linecap="round" stroke-linejoin="round" d="M8.625 12a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H8.25m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H12m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 0 1-2.555-.337A5.972 5.972 0 0 1 5.41 20.97a5.969 5.969 0 0 1-.474-.065 4.48 4.48 0 0 0 .978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25Z" />
            </svg>

            </button>
      </div>

      <div id="chat_welcome" className={isChatOpen ? '' : 'hidden'}>
        <input type="text" name="name" id="chat_name" 
            class="w-full mb-4 py-2 px-6 rounded-xl bg-gray-100" 
            placeholder='Your username or email...'
            value={userNameOrEmail}
            onChange={(e) => setUserNameOrEmail(e.target.value)}
        />

        <button id="chat_join" className='py-2 px-6 rounded-xl text-white bg-rose-600'  onClick={handleSendMessage}>Join chat</button>
      </div>

      <div id="chat_room" className={isChatMessageOpen ? '' : 'hidden'}>
            <div id="chat_log" class="mb-4 p-4 bg-gray-100 rounded-xl h-[250px] overflow-scroll">
                <p>Welcome to our chat! Please type your message and wait for an receptionist to join...</p>
                <p>{chatLog}</p>
            </div>
            <input type="text" name="body" id="chat_message_input" 
                class="w-full mb-4 p-4 bg-gray-100 rounded-xl" 
                placeholder="Type your message"
                value={chatLog}
                onChange={(e) => setChatLog(e.target.value)}
            />
            <button id="chat_message_submit" className='py-2 px-6 rounded-xl text-white bg-rose-600' onClick={sendMessage}>Send</button>
     </div>
    
    
    </div>

    

  )
}

export default ChatBubble
