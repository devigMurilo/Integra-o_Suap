import { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";

const MESES = [
    "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
    "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
];

const DIAS_SEMANA = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

// Data ISO ("aaaa-mm-dd") sem passar pelo fuso do Date
const toISO = (ano, mes, dia) =>
    `${ano}-${String(mes + 1).padStart(2, "0")}-${String(dia).padStart(2, "0")}`;

const formatarDataLonga = (iso) => {
    if (!iso) return "";
    const [ano, mes, dia] = iso.split("-").map(Number);
    return `${dia} de ${MESES[mes - 1]} de ${ano}`;
};

export default function Calendario() {
    const hoje = new Date();
    const hojeISO = toISO(hoje.getFullYear(), hoje.getMonth(), hoje.getDate());

    // Ano e mês andam juntos (virada de dezembro), então ficam no mesmo state
    const [periodo, setPeriodo] = useState({ ano: hoje.getFullYear(), mes: hoje.getMonth() });
    const { ano, mes } = periodo; // mes: 0-11
    const [dadosAluno, setDadosAluno] = useState(null);
    const [calendario, setCalendario] = useState(null);
    const [loading, setLoading] = useState(true);
    const [diaSelecionado, setDiaSelecionado] = useState(hojeISO);

    // Dados do topo (nome/foto), igual às outras páginas
    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) return;

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
            })
            .catch(err => console.error('Erro:', err));
    }, []);

    // Recarrega toda vez que muda o mês exibido
    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) {
            setLoading(false);
            return;
        }

        setLoading(true);
        fetch(`http://localhost:8000/api/meu-calendario/${ano}/${mes + 1}/`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            }
        })
            .then(res => res.ok ? res.json() : null)
            .then(data => {
                setCalendario(data);
                setLoading(false);
            })
            .catch(err => {
                console.error('Erro:', err);
                setLoading(false);
            });
    }, [ano, mes]);

    // Updater funcional: cliques seguidos não perdem o mês anterior
    const irParaMes = (delta) => {
        setPeriodo(prev => {
            const novoMes = prev.mes + delta;
            if (novoMes < 0) return { ano: prev.ano - 1, mes: 11 };
            if (novoMes > 11) return { ano: prev.ano + 1, mes: 0 };
            return { ano: prev.ano, mes: novoMes };
        });
    };

    const voltarParaHoje = () => {
        setPeriodo({ ano: hoje.getFullYear(), mes: hoje.getMonth() });
        setDiaSelecionado(hojeISO);
    };

    const getInitials = (name) => {
        if (!name) return "?";
        return name.split(" ").map(n => n[0]).filter(Boolean).slice(0, 2).join("").toUpperCase();
    };

    const initials = getInitials(dadosAluno?.nome);

    // Todos os eventos indexados por data ISO
    const eventosPorDia = {};
    const registrar = (evento) => {
        if (!evento.data) return;
        if (!eventosPorDia[evento.data]) eventosPorDia[evento.data] = [];
        eventosPorDia[evento.data].push(evento);
    };

    (calendario?.aulas || []).forEach(aula => registrar({
        ...aula,
        titulo: aula.disciplina,
        detalhe: aula.conteudo
    }));

    (calendario?.avaliacoes || []).forEach(av => registrar({
        ...av,
        titulo: av.descricao || av.sigla,
        detalhe: av.disciplina
    }));

    (calendario?.academico || []).forEach(ev => registrar({
        ...ev,
        detalhe: ev.descricao
    }));

    // Monta a grade: dias vazios até o primeiro dia do mês + os dias reais
    const primeiroDiaSemana = new Date(ano, mes, 1).getDay();
    const diasNoMes = new Date(ano, mes + 1, 0).getDate();

    const celulas = [];
    for (let i = 0; i < primeiroDiaSemana; i++) {
        celulas.push(null);
    }
    for (let dia = 1; dia <= diasNoMes; dia++) {
        celulas.push(dia);
    }

    const eventosDoDia = eventosPorDia[diaSelecionado] || [];

    // Avaliações futuras não dependem do mês exibido
    const avaliacoesFuturas = (calendario?.avaliacoes || [])
        .filter(av => av.data && av.data >= hojeISO)
        .sort((a, b) => a.data.localeCompare(b.data))
        .slice(0, 5);

    const tipoLabel = {
        aula: "Aula",
        avaliacao: "Avaliação",
        academico: "Calendário"
    };

    return (
        <div className="app-layout">
            <Sidebar />

            <div className="main-content">
                {/* Top Bar */}
                <header className="topbar">
                    <h1 className="topbar-title">Calendário</h1>
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

                    <div className="bottom-row">
                        {/* Grade do mês */}
                        <div className="period-card">
                            <div className="period-card-header">
                                <div>
                                    <div className="period-card-title">{MESES[mes]} de {ano}</div>
                                    <div className="period-card-sub">
                                        Aulas, avaliações e datas do período letivo
                                    </div>
                                </div>
                                <div className="cal-nav">
                                    <button onClick={() => irParaMes(-1)} aria-label="Mês anterior">‹</button>
                                    <button onClick={voltarParaHoje}>Hoje</button>
                                    <button onClick={() => irParaMes(1)} aria-label="Próximo mês">›</button>
                                </div>
                            </div>

                            <div className="cal-grid-wrapper">
                                <div className="cal-weekdays">
                                    {DIAS_SEMANA.map(dia => (
                                        <div key={dia} className="cal-weekday">{dia}</div>
                                    ))}
                                </div>

                                {loading ? (
                                    <div className="skeleton" style={{ height: 300, borderRadius: 10 }} />
                                ) : (
                                    <div className="cal-grid">
                                        {celulas.map((dia, idx) => {
                                            if (dia === null) {
                                                return <div key={`vazio-${idx}`} className="cal-day cal-day-empty" />;
                                            }

                                            const iso = toISO(ano, mes, dia);
                                            const eventos = eventosPorDia[iso] || [];
                                            const classes = ["cal-day"];
                                            if (iso === hojeISO) classes.push("cal-day-hoje");
                                            if (iso === diaSelecionado) classes.push("cal-day-selecionado");

                                            const tipos = [...new Set(eventos.map(e => e.tipo))];

                                            return (
                                                <button
                                                    key={iso}
                                                    className={classes.join(" ")}
                                                    onClick={() => setDiaSelecionado(iso)}
                                                >
                                                    <span className="cal-day-num">{dia}</span>
                                                    <span className="cal-dots">
                                                        {tipos.map(tipo => (
                                                            <span key={tipo} className={`cal-dot cal-dot-${tipo}`} />
                                                        ))}
                                                    </span>
                                                </button>
                                            );
                                        })}
                                    </div>
                                )}

                                <div className="cal-legenda">
                                    <span><span className="cal-dot cal-dot-aula" /> Aula</span>
                                    <span><span className="cal-dot cal-dot-avaliacao" /> Avaliação</span>
                                    <span><span className="cal-dot cal-dot-academico" /> Calendário acadêmico</span>
                                </div>
                            </div>
                        </div>

                        {/* Painel lateral */}
                        <div className="cr-card">
                            <div className="cr-card-title">{formatarDataLonga(diaSelecionado)}</div>
                            <div className="cr-card-sub">
                                {eventosDoDia.length > 0
                                    ? `${eventosDoDia.length} evento(s) neste dia`
                                    : "Nenhum evento neste dia"}
                            </div>

                            <div className="cal-eventos">
                                {eventosDoDia.map((evento, idx) => (
                                    <div className={`cal-evento cal-evento-${evento.tipo}`} key={`${evento.id}-${idx}`}>
                                        <div className="cal-evento-topo">
                                            <span className="cal-evento-titulo">{evento.titulo || "—"}</span>
                                            <span className={`status-badge cal-tag-${evento.tipo}`}>
                                                {tipoLabel[evento.tipo]}
                                            </span>
                                        </div>
                                        {evento.detalhe && (
                                            <div className="cal-evento-detalhe">{evento.detalhe}</div>
                                        )}
                                        {evento.tipo === "aula" && (
                                            <div className="cal-evento-meta">
                                                {evento.qtd_aulas} aula(s) · {evento.faltas} falta(s)
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>

                            <div className="cal-proximas">
                                <div className="cr-card-title">Próximas avaliações</div>
                                {avaliacoesFuturas.length > 0 ? (
                                    <div className="info-list">
                                        {avaliacoesFuturas.map((av, idx) => (
                                            <div className="info-row" key={`${av.id}-${idx}`}>
                                                <span className="info-label">
                                                    {av.descricao || av.sigla}
                                                    {av.disciplina ? ` · ${av.disciplina}` : ""}
                                                </span>
                                                <span className="info-value">
                                                    {av.data.split("-").reverse().slice(0, 2).join("/")}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="cal-vazio">Nenhuma avaliação agendada.</p>
                                )}
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}
