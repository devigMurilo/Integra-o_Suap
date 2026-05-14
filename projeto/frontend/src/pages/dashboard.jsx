import { useState, useEffect } from "react";


export default function Dashboard() {
    const [dadosAluno, setDadosAluno] = useState(null);

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (token) {
            fetch("http://localhost:8000/api/dados-aluno/", {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                }
            })
                .then(response => {
                    if (!response.ok) {
                        throw new Error('Falha ao buscar dados do aluno');
                    }
                    return response.json();
                })
                .then(data => {
                    setDadosAluno(data);
                })
                .catch(error => {
                    console.error('Erro:', error);
                });
        }
    }, []);

    return (
        <div>
            <h1>Dashboard</h1>
            {dadosAluno && (
                <div>
                    <p>Nome: {dadosAluno.nome}</p>
                    <p>Matrícula: {dadosAluno.matricula}</p>
                    <p>Curso: {dadosAluno.curso}</p>
                </div>
            )}
        </div>
    );
}