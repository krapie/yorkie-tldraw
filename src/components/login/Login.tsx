import { debug } from "console";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Login.css";

export default function Login() {
  const [userName, setUserName] = useState<string>();
  const [room, setRoom] = useState<string>();
  const navigate = useNavigate();

  const onChangeText = (event: any) => {
    setUserName(event.target.value);
  };

  const onChangeSelect = (event: any) => {
    setRoom(event.target.value);
  };

  const handleSubmit = (event: React.SyntheticEvent<HTMLFormElement>) => {
    event.preventDefault();

    sessionStorage.setItem(
      "userName",
      userName === undefined ? "Anonymous" : userName
    );
    sessionStorage.setItem("room", room === undefined ? "room1" : room);
    navigate("/editor-v0.6");
  };

  const renderForm = (
    <div className="form">
      <form onSubmit={handleSubmit}>
        <div className="input-container">
          <label>Nickname</label>
          <input type="text" name="uname" required onChange={onChangeText} />
          <label>Room</label>
          <select name="room" onChange={onChangeSelect}>
            <option value="room1">Room 1</option>
            <option value="room2">Room 2</option>
            <option value="room3">Room 3</option>
          </select>
        </div>
        <div className="button-container">
          <button type="submit">Join room</button>
        </div>
      </form>
    </div>
  );

  return (
    <div className="app">
      <div className="login-form">
        <div className="title">yorkie-tldraw Demo</div>
        {renderForm}
      </div>
    </div>
  );
}
