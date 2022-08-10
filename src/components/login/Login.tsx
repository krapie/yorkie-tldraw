import React, { useState } from "react"
import { useNavigate } from "react-router-dom";
import "./Login.css";

export default function Login() {
    const navigate = useNavigate()
    const [userName, setUserName] = useState<string>()
    
    const onChange = (event: any) => {
        setUserName(event.target.value)
    }

    const handleSubmit = (event: React.SyntheticEvent<HTMLFormElement>) => {
        event.preventDefault()

        sessionStorage.setItem("userName", userName === undefined ? "Anony" : userName)
        navigate("/editor")
    };

    // JSX code for login form
    const renderForm = (
        <div className="form">
            <form onSubmit={handleSubmit}>
                <div className="input-container">
                    <label>Nickname</label>
                    <input type="text" name="uname" required onChange={onChange}/>
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