import * as React from "react";
import * as ReactDOM from "react-dom";

import { SaludoInicial } from "./components/marcos";
import { PruebaRelevamientoPrecios } from "./components/ejemplo-precios";
import { ProbarFormularioEncuesta } from "./components/ejemplo-encuesta"


ReactDOM.render(
    <React.StrictMode>
        <SaludoInicial mensaje="React is 4 U!" appName="react4u"/>
        <ProbarFormularioEncuesta/>,
    </React.StrictMode>,
    document.getElementById("main_layout")
)
