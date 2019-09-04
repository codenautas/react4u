import * as React from "react";
import * as ReactDOM from "react-dom";

import { SaludoInicial } from "./components/marcos";
import { PruebaRelevamientoPrecios } from "./components/ejemplo-precios";


ReactDOM.render(
    <React.StrictMode>
        <SaludoInicial mensaje="React is 4 U!" appName="react4u"></SaludoInicial>
        <PruebaRelevamientoPrecios></PruebaRelevamientoPrecios>
    </React.StrictMode>,
    document.getElementById("main_layout")
)