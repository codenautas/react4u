import * as React from "react";
import * as ReactDOM from "react-dom";
import { useState } from "react";

import { Application, WScreen } from "./components/marcos";
import { PruebaRelevamientoPrecios } from "./components/ejemplo-precios";
import { Operaciones         } from "./components/ejemplo-operaciones";
import { OperacionesServidor } from "./components/ejemplo-operaciones-servidor";
import { ProbarFormularioEncuesta } from "./components/ejemplo-encuesta"
import { HolaMundo } from "./components/ejemplo-concepto"
import { RenderDirectJsonApp } from "./components/json-viewer"
import { EjemploTodo } from "./components/ejemplo-todo";
import { CssBaseline } from "@material-ui/core";

function ExampleApplication(){
    return <Application>
        <WScreen page='main' iconSvgPath="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" iconName="EmojiObjects">
            <HolaMundo mensaje="La demo" uno="React4U" dos={1.0} tres={new Date()}/>
        </WScreen>
        <WScreen page='operaciones' iconName="Assignment" menuLabel="instalar app">
            <Operaciones/>
        </WScreen>
        <WScreen page='operaciones_servidor' iconName="Assignment" menuLabel="instalar servidor">
            <OperacionesServidor/>
        </WScreen>
        <WScreen page='precios' iconName="LocalAtm">
            <PruebaRelevamientoPrecios/>
        </WScreen>
        <WScreen page='encuesta' iconName="AssignmentTurnedIn">
            <ProbarFormularioEncuesta/>
        </WScreen>
        <WScreen page='todo' menuLabel='TO DO'>
            <EjemploTodo/>
        </WScreen>
        <WScreen page='json' menuLabel='json viewer' iconName="Code">
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
