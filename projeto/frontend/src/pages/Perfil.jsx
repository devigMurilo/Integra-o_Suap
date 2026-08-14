import { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";

export default function Perfil() {
    const [dadosAluno, setDadosAluno] = useState(null);
    const [loading, setLoading] = useState(true);

    const now = new Date();
    const anoAtual = now.getFullYear();
    const periodoAtual = now.getMonth() < 6 ? 1 : 2;

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) {
            setLoading(false);
            return;
        }

        fetch("http://localhost:8000/api/dados-aluno/", {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            }
        })
            .then(res => res.ok ? res.json() : null)
            .then(data => {
                if (data) setDadosAluno(data);
                setLoading(false);
            })
            .catch(err => {
                console.error('Erro:', err);
                setLoading(false);
            });
    }, []);

    const getInitials = (name) => {
        if (!name) return "?";
        return name.split(" ").map(n => n[0]).filter(Boolean).slice(0, 2).join("").toUpperCase();
    };

    const initials = getInitials(dadosAluno?.nome);

    // Situação define a cor do badge, mesma regra do Boletim
    const getStatusBadge = (situacao) => {
        if (!situacao) return "status-atencao";
        const s = situacao.toLowerCase();
        if (s.includes("matriculado") || s.includes("ativo")) return "status-aprovado";
        if (s.includes("cancelado") || s.includes("trancado")) return "status-risco";
        return "status-atencao";
    };

    const dadosAcademicos = [
        { label: "Matrícula", value: dadosAluno?.matricula },
        { label: "Curso", value: dadosAluno?.curso },
        { label: "Campus", value: dadosAluno?.campus },
        { label: "Período atual", value: dadosAluno?.periodo_atual ?? `${anoAtual}.${periodoAtual}` },
        { label: "I.R.A", value: dadosAluno?.ira }
    ];

    const dadosContato = [
        { label: "E-mail acadêmico", value: dadosAluno?.email_academico },
        { label: "E-mail pessoal", value: dadosAluno?.email_pessoal }
    ];

    const renderInfoRows = (itens) => (
        <div className="info-list">
            {itens.map(item => (
                <div className="info-row" key={item.label}>
                    <span className="info-label">{item.label}</span>
                    {loading
                        ? <div className="skeleton" style={{ width: 140, height: 14 }} />
                        : <span className="info-value">{item.value || "—"}</span>
                    }
                </div>
            ))}
        </div>
    );

    return (
        <div className="app-layout">
            <Sidebar />

            <div className="main-content">
                {/* Top Bar */}
                <header className="topbar">
                    <h1 className="topbar-title">Perfil</h1>
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
                                        <span className="profile-dot" />
                                        Campus: <strong>{dadosAluno?.campus ?? "—"}</strong>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Info Cards */}
                    <div className="bottom-row">
                        <div className="period-card">
                            <div className="period-card-header">
                                <div>
                                    <div className="period-card-title">Dados Acadêmicos</div>
                                    <div className="period-card-sub">Informações do seu vínculo com o IFRN</div>
                                </div>
                                <span className={`status-badge ${getStatusBadge(dadosAluno?.situacao)}`}>
                                    {dadosAluno?.situacao ?? "—"}
                                </span>
                            </div>
                            {renderInfoRows(dadosAcademicos)}
                        </div>

                        <div className="cr-card">
                            <div className="cr-card-title">Contato</div>
                            <div className="cr-card-sub">E-mails cadastrados no SUAP</div>
                            {renderInfoRows(dadosContato)}
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}
