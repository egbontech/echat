"use client";
import Link from "next/link";
import { useState } from "react";
import { FaGoogle } from "react-icons/fa";
import axios from "./../../../axios";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const router = useRouter();
  const [buttonLoading, setButtonLoading] = useState(false);
  const [input, setInput] = useState({
    name: "",
    username: "",
    password: "",
    error_list: {
      name: "",
      username: "",
      password: "",
    },
  });

  const validate = () => {
    let isValid = true;
    const errors = {
      name: "",
      username: "",
      password: "",
    };

    if (!input.name) {
      errors.name = "Name is required";
      isValid = false;
    }

    if (!input.username) {
      errors.username = "Username is required";
      isValid = false;
    } else if (input.username.length < 3) {
      errors.username = "Username must be at least 3 characters long";
      isValid = false;
    } else if (!/^[a-zA-Z0-9_]+$/.test(input.username)) {
      errors.username =
        "Username can only contain letters, numbers, and underscores";
      isValid = false;
    }

    if (!input.password) {
      errors.password = "Password is required";
      isValid = false;
    } else if (input.password.length < 6) {
      errors.password = "Password must be at least 6 characters long";
      isValid = false;
    }

    setInput({ ...input, error_list: errors });
    return isValid;
  };

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.persist();
    setInput({ ...input, [e.target.name]: e.target.value });
  };

  const sendData = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setButtonLoading(true);

    if (validate()) {
      const data = {
        name: input.name,
        username: input.username,
        password: input.password,
      };

      try {
        await axios
          .post("/register",data)
          .then((res) => {
            if(res.data.status === "error"){
              alert("Username already exists!")
            }
            else if(res.data.status === "success"){
              alert("Registration Successful");
              setTimeout(() => {          
                router.push("/");
              }, 2000);
            }
          })
          .catch((err) => {
            console.log(err);
            alert("An error occured!");
          });
      } catch (error) {
        console.log(error);
        alert("An error occured!");
      }
    }

    setButtonLoading(false);
  };

  return (
    <main>
      <form className="form-page" onSubmit={sendData}>
        <div className="form">
          <h2 style={{ textAlign: "center", color: "#ccc" }}>
            Register to <span style={{ color: "#a78976" }}>E-chat</span>
          </h2>
          <div className="input-container">
            <input
              type="text"
              placeholder="Name"
              name="name"
              value={input.name}
              onChange={handleInput}
            />
            <p className="error-text">{input.error_list?.name}</p>
          </div>
          <div className="input-container">
            <input
              type="text"
              placeholder="Username"
              name="username"
              value={input.username}
              onChange={handleInput}
            />
            <p className="error-text">{input.error_list?.username}</p>
          </div>
          <div className="input-container">
            <input
              type="text"
              placeholder="Password"
              name="password"
              value={input.password}
              onChange={handleInput}
            />
            <p className="error-text">{input.error_list?.password}</p>
          </div>
          <div className="no-account-yet-link">
            <p>
              Already have an account?{" "}
              <span>
                <Link href="/">Login here</Link>
              </span>
            </p>
          </div>
          <div className="login-btn-container">
            {buttonLoading ? (
              <button className="login-btn">Registering...</button>
            ) : (
              <button className="login-btn">Register</button>
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
