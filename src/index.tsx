import * as React from "react";
import * as ReactDOM from "react-dom";
import { useState } from "react";

import { Application, WScreen } from "./components/marcos";
import { PruebaRelevamientoPrecios } from "./components/ejemplo-precios";
import { ProbarFormularioEncuesta } from "./components/ejemplo-encuesta"
import { HolaMundo } from "./components/ejemplo-concepto"
import { RenderDirectJsonApp } from "./components/json-viewer"
import { CssBaseline } from "@material-ui/core";

function ExampleApplication(){
    return <Application>
        <WScreen page='main'>
            <HolaMundo mensaje="La demo" uno="React4U" dos={1.0} tres={new Date()}/>
        </WScreen>
        <WScreen page='precios'>
            <PruebaRelevamientoPrecios/>
        </WScreen>
        <WScreen page='encuesta'>
            <ProbarFormularioEncuesta/>
        </WScreen>
        <WScreen page='json' menuLabel='json viewer'>
            <RenderDirectJsonApp/>
        </WScreen>
    </Application>;
}

ReactDOM.render(
    <React.StrictMode>
        <CssBaseline />
        <ExampleApplication />
    </React.StrictMode>,
    document.getElementById("main_layout")
)
