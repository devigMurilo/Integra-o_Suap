import { useState } from "react";

export default function Login() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");

    const login = async () => {
        const response = await fetch("http://localhost:8000/api/login/", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ username, password }),
        });

        const data = await response.json();

        console.log(data);

        localStorage.setItem("token", data.token);


    };
    return (
        <div>
            <h1>Login</h1>
            <input
                placeholder="matricula"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
            />
            <input 
            type="password"
            placeholder="senha"
            onChange={(e) => setPassword(e.target.value)}
            />
            <button onClick={login}>Login</button>
        </div>
    );
            }