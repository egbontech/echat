"use client";
import Link from "next/link";
import React, { useMemo } from "react";
import useUserAuth from "../../../custom-hooks/useUserAuth";
import Cookies from "universal-cookie";
import { useRouter } from "next/navigation";

const groupChats = [
  {
    image: "assets/images/php.png",
    name: "PHP",
    slug: "php",
  },
  {
    image: "assets/images/javascript.png",
    name: "Js",
    slug: "js",
  },
  {
    image: "assets/images/laravel.png",
    name: "Laravel",
    slug: "laravel",
  },
  {
    image: "assets/images/react.png",
    name: "React",
    slug: "react",
  },
  {
    image: "assets/images/react-native.png",
    name: "React Native",
    slug: "react-native",
  },
];

const ChatsPage = () => {
  const { Loader } = useUserAuth();
  const cookies = useMemo(() => new Cookies(), []);
  const router = useRouter();

  const Logout = () => {
    cookies.remove("token", { path: "/" });
    router.push("/");
  };

  if(Loader) return <h1>Loading...</h1>

  return (
    <main className="chat-wrapper">
      <div className="container">
        <div className="header-logout">
          <h2 style={{ padding: "0 15px" }}>Group Chats</h2>
          <button onClick={Logout}>Logout</button>
        </div>
        <div className="chats">
          {groupChats.map((room, index) => {
            return (
              <Link className="chat" href={`chats/${room?.slug}`} key={index}>
                <div className="image">
                  <img src={room?.image} alt="" />
                </div>
                <div className="name">
                  <p>{room?.name}</p>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </main>
  );
};

export default ChatsPage;
