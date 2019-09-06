import * as React from "react";
import * as ReactDOM from "react-dom";

import { SaludoInicial } from "./components/marcos";
import { PruebaRelevamientoPrecios } from "./components/ejemplo-precios";
import { ProbarFormularioEncuesta } from "./components/ejemplo-encuesta"
import { HolaMundo } from "./components/ejemplo-concepto"


ReactDOM.render(
    <React.StrictMode>
        <HolaMundo mensaje="La demo" uno="React4U" dos={1.0} tres={new Date()}/>
        <PruebaRelevamientoPrecios/>
        <ProbarFormularioEncuesta/>
    </React.StrictMode>,
    document.getElementById("main_layout")
)
