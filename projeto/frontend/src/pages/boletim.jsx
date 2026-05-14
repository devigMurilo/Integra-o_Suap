import { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";



export default function Boletim() {

    return (
        <div style={{ display: "flex" }}>
            <Sidebar />
            
            <main style={{ padding: "20px" }}>
                <h1>Boletim</h1>
                {dadosBoletim && (
                    <div>
                        <p>Ano Letivo: {dadosBoletim.ano_letivo}</p>
                        <p>Período Letivo: {dadosBoletim.periodo_letivo}</p>
                        <p>Curso: {dadosBoletim.curso}</p>
                        <p>Situação: {dadosBoletim.situacao}</p>
                    </div>
                )}
            </main>
        </div>
    );
}   