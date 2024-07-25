"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { FaGoogle } from "react-icons/fa";
import axios from "../../axios";
import * as crypto from "crypto";
import Cookies from "universal-cookie";

export default function LoginPage() {
  const router = useRouter();
  const cookies = useMemo(() => new Cookies(), []);
  const [buttonLoading, setButtonLoading] = useState(false);
  const [input, setInput] = useState({
    username: "",
    password: "",
    error_list: {
      username: "",
      password: "",
    },
  });

  useEffect(() => {
    try {
      const token = cookies.get("token");
      if (token) {
        router.push("/chats");
      }
    } catch (error) {
      console.log(error);
    }
  }, [cookies,router]);

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.persist();
    setInput({ ...input, [e.target.name]: e.target.value });
  };

  const encryptData = (data: any, secretKey: string): string => {
    const iv = crypto.randomBytes(16); // Generate a random initialization vector
    const cipher = crypto.createCipheriv(
      "aes-256-cbc",
      Buffer.from(secretKey),
      iv
    );
    let encryptedData = cipher.update(JSON.stringify(data), "utf-8", "hex");
    encryptedData += cipher.final("hex");
    return iv.toString("hex") + encryptedData; // Prepend IV to encrypted data
  };

  const sendData = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setButtonLoading(true);

    const data = {
      username: input.username,
      password: input.password,
    };

    try {
      await axios
        .post("/login", data)
        .then((res) => {
          if (res.data.status === "success") {           
            try {
              const userData = {
                username: res.data.user?.username,
                id: res.data.user?.id,
              };
              const secretKey = "a359d098338a01f66b8af20b18e6fhts";
              const token = encryptData(userData, secretKey);
              cookies.set("token", token, { path: "/", maxAge: 86400 });
              router.push("/chats");
            } catch (error) {
              console.log(error);
            }
          } else if (res.data.status === "failed") {
            alert("Invalid Credentials");
          }
        })
        .catch((err) => {
          console.log(err);
        });
    } catch (error) {
      console.log(error);
    }

    setButtonLoading(false);
  };

  return (
    <main>
      <form className="form-page" onSubmit={sendData}>
        <div className="form">
          <h2 style={{ textAlign: "center", color: "#ccc" }}>
            Login to <span style={{ color: "#a78976" }}>E-chat</span>
          </h2>
          <div className="input-container">
            <input
              type="text"
              placeholder="Username"
              name="username"
              value={input.username}
              onChange={handleInput}
            />
          </div>
          <div className="input-container">
            <input
              type="text"
              placeholder="Password"
              name="password"
              value={input.password}
              onChange={handleInput}
            />
          </div>
          <div className="no-account-yet-link">
            <p>
              Don't have an account?{" "}
              <span>
                <Link href="/register">Register here</Link>
              </span>
            </p>
          </div>
          <div className="login-btn-container">
            {buttonLoading ? (
              <button className="login-btn">Logging In...</button>
            ) : (
              <button className="login-btn">Login</button>
            )}
          </div>
          <div className="divider">
            <span>or</span>
          </div>
          <div className="login-btn-container">
            <button className="service-login-btn">
              <FaGoogle />{" "}
              <span style={{ marginLeft: "4px" }}>Continue with Google</span>
            </button>
          </div>
        </div>
      </form>
    </main>
  );
}
