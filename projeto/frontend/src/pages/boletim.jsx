import { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";

export default function Boletim() {
    const [dadosBoletim, setDadosBoletim] = useState(null);
    const [loading, setLoading] = useState(false);
    
    // Podemos juntar ano e período no mesmo state pro select
    const [periodoSelecionado, setPeriodoSelecionado] = useState("2024.1");

    const buscarBoletim = (ano, periodo) => {
        const token = localStorage.getItem("token");
        if (!token) return;
        
        setLoading(true);
        fetch(`http://localhost:8000/api/meu-boletim/${ano}/${periodo}/`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            }
        })
            .then(res => res.json())
            .then(data => {
                setDadosBoletim(data);
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setLoading(false);
            });
    };

    // Atualiza a busca toda vez que mudar o dropdown
    useEffect(() => {
        const [ano, periodo] = periodoSelecionado.split(".");
        buscarBoletim(ano, periodo);
    }, [periodoSelecionado]);

    // Opções de exemplo para o filtro
    const periodosDisponiveis = [
        "2026.1",
        "2025.1",
        "2024.1",
        "2023.1"
    ];

    // Função auxiliar para determinar status baseado na média ou situação
    const getStatusStyle = (situacao) => {
        if (!situacao) return { badge: "aprovado", label: "Aprovado" };
        const s = situacao.toLowerCase();
        if (s.includes("aprovado")) return { badge: "aprovado", label: "Aprovado" };
        if (s.includes("reprovado")) return { badge: "risco", label: "Reprovado" };
        if (s.includes("cursando") || s.includes("andamento")) return { badge: "atencao", label: "Cursando" };
        return { badge: "aprovado", label: situacao }; // default
    };

    return (
        <div className="app-layout">
            <Sidebar />
            
            <main className="main-content">
                <div className="page-body">
                    
                    {/* Cabeçalho da página Notas */}
                    <div className="notas-header">
                        <div>
                            <h1 className="notas-title">Notas Detalhadas</h1>
                            <p className="notas-subtitle">Acompanhe suas avaliações por unidade</p>
                        </div>
                        
                        {/* Dropdown de Filtro */}
                        <div className="period-filter">
                            <label>Período:</label>
                            <select 
                                value={periodoSelecionado} 
                                onChange={(e) => setPeriodoSelecionado(e.target.value)}
                            >
                                {periodosDisponiveis.map(p => (
                                    <option key={p} value={p}>{p}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {loading ? (
                        <div style={{ display: "flex", gap: "20px", flexWrap: "wrap" }}>
                            <div className="skeleton" style={{ width: 340, height: 280, borderRadius: 12 }}></div>
                            <div className="skeleton" style={{ width: 340, height: 280, borderRadius: 12 }}></div>
                            <div className="skeleton" style={{ width: 340, height: 280, borderRadius: 12 }}></div>
                        </div>
                    ) : (
                        <div className="notas-grid">
                            {dadosBoletim?.results?.length > 0 ? (
                                dadosBoletim.results.map((item, idx) => {
                                    // Pega os dados do SUAP — agora enriquecidos com dados dos diários
                                    // No BoletimSchema: disciplina é STRING, situacao é STRING
                                    const disciplina = item.nome_disciplina || item.disciplina || "Disciplina";
                                    const professor = item.professor || "";
                                    const mediaFinal = item.media_disciplina ?? item.media_final_disciplina ?? "--";
                                    const situacao = item.situacao || "Aprovado";
                                    
                                    // Notas das unidades
                                    const u1 = item.nota_etapa_1?.nota || "--";
                                    const u2 = item.nota_etapa_2?.nota || "--";
                                    const u3 = item.nota_etapa_3?.nota || "--";
                                    const u4 = item.nota_etapa_4?.nota || "--";
                                    
                                    // Faltas
                                    const faltas = item.numero_faltas || 0;
                                    const percFaltas = item.percentual_carga_horaria_frequentada !== undefined 
                                        ? (100 - item.percentual_carga_horaria_frequentada) 
                                        : (faltas * 2); // mockup 

                                    const { badge, label } = getStatusStyle(situacao);

                                    return (
                                        <div className="nota-card" key={idx}>
                                            <div className="nota-card-header">
                                                <div className="nota-card-title-group">
                                                    <h3 className="nota-subject">{disciplina}</h3>
                                                    <p className="nota-prof">{professor ? `Prof. ${professor}` : ""}</p>
                                                </div>
                                                <span className={`status-badge status-${badge}`}>{label}</span>
                                            </div>

                                            <div className="nota-units">
                                                <div className="nota-unit">
                                                    <span>U1</span>
                                                    <strong>{u1}</strong>
                                                </div>
                                                <div className="nota-unit">
                                                    <span>U2</span>
                                                    <strong>{u2}</strong>
                                                </div>
                                                <div className="nota-unit">
                                                    <span>U3</span>
                                                    <strong>{u3}</strong>
                                                </div>
                                                <div className="nota-unit">
                                                    <span>U4</span>
                                                    <strong>{u4}</strong>
                                                </div>
                                            </div>

                                            <div className="nota-faltas">
                                                <div className="nota-faltas-header">
                                                    <span>Faltas</span>
                                                    <span>{percFaltas}%</span>
                                                </div>
                                                <div className="nota-faltas-bar">
                                                    <div 
                                                        className={`nota-faltas-fill bg-${badge}`}
                                                        style={{ width: `${Math.min(percFaltas, 100)}%` }}
                                                    ></div>
                                                </div>
                                            </div>

                                            <div className="nota-footer">
                                                <span className="nota-media-label">Média final</span>
                                                <span className={`nota-media-value text-${badge}`}>{mediaFinal}</span>
                                            </div>
                                        </div>
                                    );
                                })
                            ) : (
                                <p style={{ color: "var(--text-secondary)" }}>Nenhum boletim encontrado para este período.</p>
                            )}
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}