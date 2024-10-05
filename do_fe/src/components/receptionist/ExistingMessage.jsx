import React, { useState, useEffect, useContext } from 'react';
import { api, authAPI } from '../utils/ApiFunctions';
import { MyUserContext } from '../utils/MyContext';
import ChatBubble from '../chat/ChatBubble';
import ChatWebSocket from "../chat/ChatWebSocket";


const ExistingMessage = ({ branchId }) => {
    const [chatRooms, setChatRooms] = useState([]);
    const user = useContext(MyUserContext);
    const [currentChatUser, setCurrentChatUser] = useState(null);
    const [chatBoxOpen, setChatBoxOpen] = useState(false);

    

    useEffect(() => {
        const fetchChatRooms = async () => {
        try {
            const response = await authAPI().get(`/addons/chat-rooms/?branch=${user.branch}`); 
            console.log(response)
            setChatRooms(response.data);
        } catch (error) {
            console.error('Error fetching chat rooms:', error);
        }
        };

        fetchChatRooms();
    }, [branchId]);
    const viewChatRoom = (roomId) => {
        console.log(`Viewing chat room: ${roomId}`);
    };

    const openChatBox = async (u) => {
        if (!chatBoxOpen) {
            console.log(u)
            setCurrentChatUser(u);
            setChatBoxOpen(true);
        } else {
            setChatBoxOpen(false);
            setCurrentChatUser(null);
        }
      };
    
      const closeChatBox = () => {
        setChatBoxOpen(false);
        setCurrentChatUser(null);
      };
    
      const { messages, sendMessage } = ChatWebSocket(currentChatUser, user, user.branch );

    return (
        <div className="mt-5">
        <h2 className="text-lg font-bold mb-4" style={{fontSize:"30px"}}>Chat Rooms</h2>
        {chatRooms.length > 0 ? (
            <ul className="flex flex-wrap gap-4 justify-between">
            {chatRooms.map((room) => (
                <li key={room.id} className="bg-orange-300 rounded-xl p-4 flex justify-between items-center w-[33%]">
                <div className="flex justify-between items-center">
                    <span>
                    {room.sender.username} 
                    </span>
                    
                </div>
                <button
                    onClick={() => openChatBox(room.sender)}
                    className=" bg-orange-600 text-white rounded-md px-4 py-2"
                    >
                    View
                    </button>
                </li>
            ))}
            </ul>
        ) : (
            <p>No chat rooms available</p>
        )}

        <ChatBubble 
          currentChatUser={currentChatUser}
          messages={messages}
          sendMessage={sendMessage}
          closeChatBox={closeChatBox}
      />
        </div>
        
    );
    };

    export default ExistingMessage;
