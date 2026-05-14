import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";

function Sidebar() {
    const location = useLocation();

    const navItems = [
        { path: "/dashboard", label: "Dashboard", icon: "⊞" },
        { path: "/notas",     label: "Notas",      icon: "📋" },
        { path: "/analises",  label: "Análises",   icon: "📈" },
        { path: "/calendario",label: "Calendário", icon: "📅" },
    ];

    return (
        <aside className="sidebar">
            {/* Brand */}
            <div className="sidebar-brand">
                <div className="sidebar-brand-icon">
                    <svg viewBox="0 0 24 24">
                        <path d="M12 2L2 7l10 5 10-5-10-5z" />
                        <path d="M2 17l10 5 10-5" />
                        <path d="M2 12l10 5 10-5" />
                    </svg>
                </div>
                <div className="sidebar-brand-text">
                    <div className="sidebar-brand-name">SUAP Analytics</div>
                    <div className="sidebar-brand-sub">Painel do Aluno</div>
                </div>
            </div>

            {/* Nav */}
            <nav className="sidebar-nav">
                <ul>
                    {navItems.map(item => (
                        <li key={item.path}>
                            <Link
                                to={item.path}
                                className={location.pathname === item.path ? "active" : ""}
                            >
                                <span className="nav-icon">{item.icon}</span>
                                {item.label}
                            </Link>
                        </li>
                    ))}
                </ul>
            </nav>

            {/* Footer / Logout */}
            <div className="sidebar-footer">
                <button onClick={() => {
                    localStorage.removeItem("token");
                    window.location.href = "/";
                }}>
                    <span className="nav-icon">↩</span>
                    Sair
                </button>
            </div>
        </aside>
    );
}

export default Sidebar;