"use client";
import React, { useEffect, useRef, useState } from "react";
import MessageInput from "../../../../components/chats/MessageInput";
import useUserAuth from "../../../../custom-hooks/useUserAuth";
import axios from "../../../../axios";
import io from "socket.io-client";

interface Props {
  params: {
    chat: string;
  };
}

interface Message {
  id: number;
  content: string; 
  username: string;
  type?: "message" | "notification";
}

const ChatPage = ({ params }: Props) => {
  const { User, Loader } = useUserAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);

  const username = User?.username;
  const room = params?.chat;

  const newParam = params?.chat?.replace(/-/g, " ");

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const FetchMessages = async () => {
      await axios.get(`/chatroom/${params.chat}`).then((res) => {
        // Add type property to messages fetched from the database
        const fetchedMessages = res.data?.data.map((msg: Message) => ({
          ...msg,
          type: "message",
        }));
        setMessages(fetchedMessages);
        setLoading(false);
      });
    };
    FetchMessages();
  }, [params.chat]);

  useEffect(() => {
    const socket = io("http://localhost:5000");

    socket.on("connect", () => {
      console.log("connected to server");
      socket.emit("joinRoom", { room, username });
    });

    socket.on("newMessage", (message: Message) => {
      setMessages((prevMessages) => [...prevMessages, { ...message, type: "message" }]);
    });

    socket.on("userNotification", (notification: Message) => {
      setMessages((prevMessages) => [...prevMessages, { ...notification, type: "notification" }]);    
    });

    socket.on("disconnect", () => {
      console.log("disconnected from server");
    });

    return () => {
      socket.emit("leftRoom", { room, username });
      socket.disconnect();
    };
  }, [User, room, username]);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  if (Loader) return <h1>Loading...</h1>;
  if (loading) return <h1>Loading...</h1>;

  return (
    <main className="chatpage-wrapper">
      <div className="chat-container">
        <div className="chat-header">
          <h2>{newParam} Chat Room</h2>
        </div>

        <div className="chat-messages">
          {messages?.map((message: Message, index: number) => (
            <div
              className={`message ${
                message.type === "notification"
                  ? "notification"
                  : User?.username === message?.username
                  ? "sent"
                  : "received"
              }`}
              key={index}
            >
              {message.type === "notification" ? (
                <div className="notification"style={{color:'white'}}>{message.content}</div>
              ) : (
                <div className="message-info">
                  {!(User?.username === message?.username) && (
                    <span className="username">{message?.username}</span>
                  )}
                  <div className="message-content">{message?.content}</div>
                </div>
              )}
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        <MessageInput
          room={params.chat}
          userId={User?.id}
          username={User?.username}
        />
      </div>
    </main>
  );
};

export default ChatPage;
