import { useState } from "react";

export default function Login() {
    const [matricula, setMatricula] = useState("");
    const [password, setPassword] = useState("");

    const login = async () => {
        const response = await fetch("http://localhost:8000/api/login/", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ 
                username: matricula,
                password: password }),
        });

        const data = await response.json();

        console.log(data);

        localStorage.setItem("token", data.token);


    };

    return (
        <div>
            <h1>Login</h1>
            <input
                type="text"
                placeholder="matricula"
                value={matricula}
                onChange={(e) => setMatricula(e.target.value)}
            />
            <input 
            type="password"
            placeholder="senha"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            />
            <button onClick={login}>Login</button>
        </div>
    );

}

