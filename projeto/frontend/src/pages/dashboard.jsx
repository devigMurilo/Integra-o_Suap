import { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";

export default function Dashboard() {
    const [dadosAluno, setDadosAluno] = useState(null);
    const [loading, setLoading] = useState(true);

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
                    if (!response.ok) throw new Error('Falha ao buscar dados do aluno');
                    return response.json();
                })
                .then(data => {
                    setDadosAluno(data);
                    setLoading(false);
                })
                .catch(error => {
                    console.error('Erro:', error);
                    setLoading(false);
                });
        } else {
            setLoading(false);
        }
    }, []);

    const getInitials = (name) => {
        if (!name) return "?";
        return name.split(" ").map(n => n[0]).filter(Boolean).slice(0, 2).join("").toUpperCase();
    };

    const initials = getInitials(dadosAluno?.nome);

    // Dados de exemplo para a tabela (quando tiver boletim, substituir)
    const disciplinasExemplo = [
        { nome: "Programação Web",       u1: 85, u2: 90, faltas: "2%", status: "aprovado" },
        { nome: "Banco de Dados",        u1: 75, u2: 70, faltas: "5%", status: "atencao" },
        { nome: "Redes de Computadores", u1: 55, u2: 60, faltas: "8%", status: "risco" },
        { nome: "Engenharia de Software", u1: 88, u2: 92, faltas: "1%", status: "aprovado" },
    ];

    return (
        <div className="app-layout">
            <Sidebar />

            <div className="main-content">
                {/* Top Bar */}
                <header className="topbar">
                    <h1 className="topbar-title">Dashboard</h1>
                    <div className="topbar-user">
                        {dadosAluno && (
                            <div className="topbar-user-info">
                                <div className="topbar-user-name">{dadosAluno.nome}</div>
                                <div className="topbar-user-mat">{dadosAluno.matricula}</div>
                            </div>
                        )}
                        <div className="topbar-avatar">
                            {dadosAluno?.foto
                                ? <img src={dadosAluno.foto} alt={dadosAluno.nome} />
                                : initials
                            }
                        </div>
                    </div>
                </header>

                {/* Page Body */}
                <div className="page-body">

                    {/* Profile Card */}
                    <div className="profile-card">
                        <div className="profile-card-banner" />
                        <div className="profile-card-body">
                            <div className="profile-avatar-wrapper">
                                <div className="profile-avatar">
                                    {dadosAluno?.foto
                                        ? <img src={dadosAluno.foto} alt={dadosAluno.nome} />
                                        : initials
                                    }
                                </div>
                            </div>
                            {loading ? (
                                <>
                                    <div className="skeleton" style={{ width: 200, height: 22, marginBottom: 6 }} />
                                    <div className="skeleton" style={{ width: 320, height: 14 }} />
                                </>
                            ) : (
                                <>
                                    <div className="profile-name">{dadosAluno?.nome ?? "—"}</div>
                                    <div className="profile-meta">
                                        Matrícula: <strong>{dadosAluno?.matricula ?? "—"}</strong>
                                        <span className="profile-dot" />
                                        Curso: <strong>{dadosAluno?.curso ?? "—"}</strong>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Stats Cards */}
                    <div className="stats-grid">
                        <div className="stat-card">
                            <div className="stat-card-left">
                                <div className="stat-label">CR Atual</div>
                                <div className="stat-value">8.5</div>
                                <div className="stat-sub">↑ 0.2 vs período anterior</div>
                            </div>
                            <div className="stat-icon">🎓</div>
                        </div>

                        <div className="stat-card">
                            <div className="stat-card-left">
                                <div className="stat-label">Créditos</div>
                                <div className="stat-value">120/180</div>
                                <div className="stat-sub">66% concluído</div>
                            </div>
                            <div className="stat-icon">📖</div>
                        </div>

                        <div className="stat-card">
                            <div className="stat-card-left">
                                <div className="stat-label">Taxa de Aprovação</div>
                                <div className="stat-value">95%</div>
                            </div>
                            <div className="stat-icon">✅</div>
                        </div>

                        <div className="stat-card">
                            <div className="stat-card-left">
                                <div className="stat-label">Disciplinas</div>
                                <div className="stat-value">6</div>
                                <div className="stat-sub">Cursando agora</div>
                            </div>
                            <div className="stat-icon">📚</div>
                        </div>
                    </div>

                    {/* Bottom row: Period table + CR chart side by side */}
                    <div className="bottom-row">
                        {/* Period Table */}
                        <div className="period-card">
                            <div className="period-card-header">
                                <div>
                                    <div className="period-card-title">Visão Geral do Período</div>
                                    <div className="period-card-sub">2025.1 — Período atual</div>
                                </div>
                                <span className="period-badge">Em andamento</span>
                            </div>
                            <table className="period-table">
                                <thead>
                                    <tr>
                                        <th>Disciplina</th>
                                        <th>U1</th>
                                        <th>U2</th>
                                        <th>Faltas</th>
                                        <th>Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {disciplinasExemplo.map((d, i) => (
                                        <tr key={i}>
                                            <td>{d.nome}</td>
                                            <td>{d.u1}</td>
                                            <td>{d.u2}</td>
                                            <td>{d.faltas}</td>
                                            <td>
                                                <span className={`status-badge status-${d.status}`}>
                                                    {d.status === "aprovado" ? "Aprovado" :
                                                     d.status === "atencao" ? "Atenção" : "Risco"}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* CR Evolution */}
                        <div className="cr-card">
                            <div className="cr-card-title">Evolução do CR</div>
                            <div className="cr-card-sub">Últimos 5 períodos</div>
                            <div className="cr-big-value">8.5</div>
                            <div className="cr-chart">
                                <svg viewBox="0 0 200 80" preserveAspectRatio="none">
                                    {/* Grid lines */}
                                    <line x1="0" y1="0" x2="200" y2="0" stroke="#f0f0f0" strokeWidth="0.5"/>
                                    <line x1="0" y1="20" x2="200" y2="20" stroke="#f0f0f0" strokeWidth="0.5"/>
                                    <line x1="0" y1="40" x2="200" y2="40" stroke="#f0f0f0" strokeWidth="0.5"/>
                                    <line x1="0" y1="60" x2="200" y2="60" stroke="#f0f0f0" strokeWidth="0.5"/>
                                    <line x1="0" y1="80" x2="200" y2="80" stroke="#f0f0f0" strokeWidth="0.5"/>
                                    {/* Area fill */}
                                    <path
                                        d="M0,60 L50,45 L100,35 L150,20 L200,15 L200,80 L0,80 Z"
                                        fill="url(#crGradient)" opacity="0.3"
                                    />
                                    {/* Line */}
                                    <polyline
                                        points="0,60 50,45 100,35 150,20 200,15"
                                        fill="none" stroke="#00C9A7" strokeWidth="2"
                                        strokeLinecap="round" strokeLinejoin="round"
                                    />
                                    {/* Dots */}
                                    <circle cx="0"   cy="60" r="3" fill="#00C9A7"/>
                                    <circle cx="50"  cy="45" r="3" fill="#00C9A7"/>
                                    <circle cx="100" cy="35" r="3" fill="#00C9A7"/>
                                    <circle cx="150" cy="20" r="3" fill="#00C9A7"/>
                                    <circle cx="200" cy="15" r="3" fill="#00C9A7"/>
                                    <defs>
                                        <linearGradient id="crGradient" x1="0" x2="0" y1="0" y2="1">
                                            <stop offset="0%" stopColor="#00C9A7" stopOpacity="0.4"/>
                                            <stop offset="100%" stopColor="#00C9A7" stopOpacity="0"/>
                                        </linearGradient>
                                    </defs>
                                </svg>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}