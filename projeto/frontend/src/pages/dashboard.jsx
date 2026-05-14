import { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell } from "recharts";

// Tooltip customizado
const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
        return (
            <div style={{
                background: "#2a2d3e",
                border: "1px solid #3c3f58",
                borderRadius: "8px",
                padding: "10px 15px",
                color: "#fff",
                boxShadow: "0 4px 6px rgba(0,0,0,0.3)"
            }}>
                <p style={{ margin: 0, fontSize: "0.9rem", fontWeight: "bold" }}>
                    {payload[0].payload.nomeCompleto}
                </p>
                <p style={{ margin: 0, marginTop: "4px", fontSize: "0.85rem", color: payload[0].payload.fillColor }}>
                    Média: {payload[0].value}
                </p>
            </div>
        );
    }
    return null;
};

// Label customizado
const renderCustomBarLabel = ({ x, y, width, height, value }) => {
    return (
        <text 
            x={x + width + 5} 
            y={y + height / 2 + 1} 
            fill="#8b91a5" 
            dominantBaseline="middle"
            fontSize={12}
            fontWeight={600}
        >
            {value}
        </text>
    );
};

export default function Dashboard() {
    const [dadosAluno, setDadosAluno] = useState(null);
    const [boletim, setBoletim] = useState([]);
    const [loading, setLoading] = useState(true);
    
    const now = new Date();
    const anoAtual = now.getFullYear();
    const periodoAtual = now.getMonth() < 6 ? 1 : 2;

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (token) {
            Promise.all([
                fetch("http://localhost:8000/api/dados-aluno/", {
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${token}`
                    }
                }).then(r => r.ok ? r.json() : null),
                fetch(`http://localhost:8000/api/meu-boletim/${anoAtual}/${periodoAtual}/`, {
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${token}`
                    }
                }).then(r => r.ok ? r.json() : null)
            ])
            .then(([dadosAlunoData, boletimData]) => {
                if (dadosAlunoData) setDadosAluno(dadosAlunoData);
                
                if (boletimData && boletimData.results) {
                    setBoletim(boletimData.results);
                } else if (Array.isArray(boletimData)) {
                    setBoletim(boletimData);
                }
                setLoading(false);
            })
            .catch(error => {
                console.error('Erro:', error);
                setLoading(false);
            });
        } else {
            setLoading(false);
        }
    }, [anoAtual, periodoAtual]);

    const getInitials = (name) => {
        if (!name) return "?";
        return name.split(" ").map(n => n[0]).filter(Boolean).slice(0, 2).join("").toUpperCase();
    };

    const initials = getInitials(dadosAluno?.nome);

    // Preparando dados para o gráfico
    const chartData = (boletim || []).map(item => {
        let score = item.media_disciplina ?? item.media_final_disciplina;
        if (score === null || score === undefined || score === "--") {
            const u1 = item.nota_etapa_1?.nota ? Number(item.nota_etapa_1.nota) : 0;
            const u2 = item.nota_etapa_2?.nota ? Number(item.nota_etapa_2.nota) : 0;
            score = Math.max(u1, u2);
        }
        
        let val = Number(score) || 0;
        const nomeCompleto = item.nome_disciplina || item.disciplina || "Disciplina";
        const name = nomeCompleto.length > 15 ? nomeCompleto.substring(0, 15) + "..." : nomeCompleto;
        
        let fillColor = "#FD397A"; // red
        if (val >= 60) fillColor = "#00C9A7"; // green
        else if (val >= 40) fillColor = "#FFB822"; // yellow

        return { nomeCompleto, name, media: val, fillColor };
    });

    const averageScore = chartData.length > 0 
        ? Math.round(chartData.reduce((acc, curr) => acc + curr.media, 0) / chartData.length)
        : 0;

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
                                <div className="stat-label">I.R.A</div>
                                <div className="stat-value">{dadosAluno?.ira ?? "—"}</div>
                            </div>
                            <div className="stat-icon">🎓</div>
                        </div>

                        <div className="stat-card">
                            <div className="stat-card-left">
                                <div className="stat-label">Período Atual</div>
                                <div className="stat-value">{dadosAluno?.periodo_atual ?? `${anoAtual}.${periodoAtual}`}</div>
                            </div>
                            <div className="stat-icon">📖</div>
                        </div>

                        <div className="stat-card">
                            <div className="stat-card-left">
                                <div className="stat-label">Situação</div>
                                <div className="stat-value" style={{fontSize: "1.2rem", textTransform: "capitalize"}}>
                                    {dadosAluno?.situacao?.toLowerCase() ?? "—"}
                                </div>
                            </div>
                            <div className="stat-icon">✅</div>
                        </div>

                        <div className="stat-card">
                            <div className="stat-card-left">
                                <div className="stat-label">Disciplinas</div>
                                <div className="stat-value">{boletim?.length || 0}</div>
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
                                    {boletim && boletim.length > 0 ? (
                                        boletim.map((item, idx) => {
                                            const nomeDisciplina = item.nome_disciplina || item.disciplina || "Disciplina";
                                            const u1 = item.nota_etapa_1?.nota ?? "--";
                                            const u2 = item.nota_etapa_2?.nota ?? "--";
                                            const faltas = item.numero_faltas ?? 0;
                                            const situacao = item.situacao || "Cursando";
                                            
                                            // Determine badge color
                                            let badgeClass = "status-risco";
                                            const s = situacao.toLowerCase();
                                            if (s.includes("aprovado")) badgeClass = "status-aprovado";
                                            else if (s.includes("cursando") || s.includes("matriculado")) badgeClass = "status-atencao";

                                            return (
                                                <tr key={idx}>
                                                    <td>{nomeDisciplina}</td>
                                                    <td>{u1}</td>
                                                    <td>{u2}</td>
                                                    <td>{faltas}</td>
                                                    <td>
                                                        <span className={`status-badge ${badgeClass}`}>
                                                            {situacao}
                                                        </span>
                                                    </td>
                                                </tr>
                                            );
                                        })
                                    ) : (
                                        <tr>
                                            <td colSpan="5" style={{textAlign: "center", padding: "20px"}}>
                                                Nenhum dado encontrado para o período atual.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Performance Chart */}
                        <div className="cr-card">
                            <div className="cr-card-title">Média por Disciplina</div>
                            <div className="cr-card-sub">Suas notas neste período</div>
                            <div className="cr-chart" style={{ height: 'auto', paddingTop: '20px' }}>
                                {chartData.length > 0 ? (
                                    <ResponsiveContainer width="100%" height={Math.max(200, chartData.length * 40)}>
                                        <BarChart
                                            data={chartData}
                                            layout="vertical"
                                            margin={{ top: 5, right: 30, left: 10, bottom: 5 }}
                                            barSize={12}
                                        >
                                            <XAxis type="number" domain={[0, 100]} hide />
                                            <YAxis 
                                                type="category" 
                                                dataKey="name" 
                                                axisLine={false} 
                                                tickLine={false} 
                                                tick={{ fill: '#8b91a5', fontSize: 12, fontWeight: 500 }}
                                                width={110}
                                            />
                                            <Tooltip cursor={{fill: 'rgba(255, 255, 255, 0.05)'}} content={<CustomTooltip />} />
                                            <Bar 
                                                dataKey="media" 
                                                radius={[0, 4, 4, 0]}
                                                animationDuration={1500}
                                                label={renderCustomBarLabel}
                                            >
                                                {chartData.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={entry.fillColor} />
                                                ))}
                                            </Bar>
                                        </BarChart>
                                    </ResponsiveContainer>
                                ) : (
                                    <div style={{color: '#8b91a5', textAlign: 'center', padding: '20px 0'}}>
                                        Nenhuma nota disponível
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}