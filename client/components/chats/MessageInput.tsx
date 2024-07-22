"use client";
import React, { useRef, useState } from "react";
import axios from "../../axios";

interface MessageInputProps {
  room: string;
  userId: string | undefined;
  username:string | undefined  
}

const MessageInput: React.FC<MessageInputProps> = ({ room, userId,username }) => {
  const [message, setMessage] = useState("");
  const textAreaRef = useRef<HTMLTextAreaElement>(null);
  const audio = new Audio("/assets/audio/comment.wav");
  audio.volume = 0.3;

  const updateMessage = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    if (newValue.trim().length >= 100) return;
    setMessage(e.target.value);
    adjustTextareaHeight(e.target);
  };

  const adjustTextareaHeight = (textArea: HTMLTextAreaElement) => {
    if (textArea.value === "") {
      textArea.style.height = "20px";
    } else {
      textArea.style.height = "auto";
      textArea.style.height = textArea.scrollHeight + "px";

      const maxHeight = 100; // Set the maximum height in pixels
      if (textArea.scrollHeight > maxHeight) {
        textArea.style.overflowY = "auto";
        textArea.style.height = maxHeight + "px";
      } else {
        textArea.style.overflowY = "hidden";
      }
    }
  };

  const sendMessage = async () => {
    const data = {
      senderId: userId,
      room: room,
      content: message,
      username:username
    };

    try {
      await axios
        .post("/new-message", data)
        .then((res) => {    
          audio.play();    
          setMessage("");
          if (textAreaRef.current) {
            textAreaRef.current.style.height = "20px";
          }
        })
        .catch((err) => {
          console.log(err);
        });      
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="chat-input">
      <textarea
        id="message-input"
        placeholder="Type a message..."
        ref={textAreaRef}
        onChange={updateMessage}
        onInput={(e) => adjustTextareaHeight(e.target as HTMLTextAreaElement)}
        value={message}
      />
      {message?.length > 0 && <button onClick={sendMessage}>Send</button>}
    </div>
  );
};

export default MessageInput;
