import { useState, useEffect } from "react";
import "./login.css";

export default function Login() {
    const [matricula, setMatricula] = useState("");
    const [password, setPassword] = useState("");
    const [rememberMe, setRememberMe] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const handleLogin = async (e) => {
        e.preventDefault();
        setError("");
        setSuccess("");
        setLoading(true);

        try {
            const response = await fetch("http://localhost:8000/api/login/", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    username: matricula,
                    password: password,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                setError(data.message || "Erro ao fazer login. Verifique suas credenciais.");
                return;
            }

            // Salvar token
            localStorage.setItem("token", data.token);

            // Salvar matrícula se "lembrar de mim" estiver ativo
            if (rememberMe) {
                localStorage.setItem("savedMatricula", matricula);
            } else {
                localStorage.removeItem("savedMatricula");
            }

            setSuccess("Login realizado com sucesso! Redirecionando...");

            // Redirecionar após 2 segundos
            setTimeout(() => {
                window.location.href = "/dashboard";
            }, 2000);

        } catch (err) {
            setError("Erro ao conectar ao servidor. Tente novamente.");
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    // Carregar matrícula salva ao montar componente
    useEffect(() => {
        const savedMatricula = localStorage.getItem("savedMatricula");
        if (savedMatricula) {
            setMatricula(savedMatricula);
            setRememberMe(true);
        }
    }, []);

    return (
        <div className="login-container">
            <div className="login-card">
                {/* Header */}
                <div className="login-header">
                    <h1>Bem-vindo</h1>
                    <p>Faça login na sua conta</p>
                </div>

                {/* Mensagens */}
                {error && <div className="error-message">{error}</div>}
                {success && <div className="success-message">{success}</div>}

                {/* Form */}
                <form onSubmit={handleLogin}>
                    {/* Matrícula Input */}
                    <div className="form-group">
                        <label htmlFor="matricula">Matrícula</label>
                        <input
                            type="text"
                            id="matricula"
                            placeholder="Digite sua matrícula"
                            value={matricula}
                            onChange={(e) => setMatricula(e.target.value)}
                            required
                            disabled={loading}
                        />
                    </div>

                    {/* Password Input */}
                    <div className="form-group">
                        <label htmlFor="password">Senha</label>
                        <input
                            type="password"
                            id="password"
                            placeholder="Digite sua senha"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            disabled={loading}
                        />
                    </div>

                    {/* Remember Me */}
                    <div className="remember-me">
                        <input
                            type="checkbox"
                            id="rememberMe"
                            checked={rememberMe}
                            onChange={(e) => setRememberMe(e.target.checked)}
                            disabled={loading}
                        />
                        <label htmlFor="rememberMe">Lembrar de mim</label>
                    </div>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        className={`login-btn ${loading ? "loading" : ""}`}
                        disabled={loading || !matricula || !password}
                    >
                        {loading ? "Entrando..." : "Entrar"}
                    </button>
                </form>
            </div>
        </div>
    );
}  