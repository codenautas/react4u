import * as React from "react";
import {useState} from "react";
import { createStore } from "redux"
import { Provider, useSelector, useDispatch } from "react-redux"
import { TextField, Switch, FormControlLabel } from "@material-ui/core"
import * as likeAr from "like-ar";
import { deepFreeze } from "best-globals"

/////// ESTRUCTURA

type TipoDato='string'|'number';

type Opciones = {
    opcion: number,
    texto: string,
    aclaracion?: string,
    salto?: string
};

type Pregunta = {
    id:string,
    texto:string,
    aclaracion?:string,
    tipoPregunta?:string,
    salto?:string,
    posicion?:number
}&({
    opciones: Opciones[]
}|{
    tipoDato:TipoDato
});

var estructura:Pregunta[]=[{
    id:'T1',
    texto:'La semana pasada ¿Trabajó al menos una hora?',
    tipoPregunta:'E-S',
    opciones: [{
        opcion: 1, 
        texto: 'Sí',
        salto: 'T7'
    },{
        opcion: 2, 
        texto: 'No'
    }]
},{
    id:'T2',
    texto:'En esa semana, ¿hizo alguna changa, fabricó en su casa algo para vender, ayudó a un familiar o amigo en su negocio?',
    opciones: [{
        opcion: 1, 
        texto: 'Sí',
        salto: 'T7'
    },{
        opcion: 2, 
        texto: 'No'
    }]
},{
    id:'T3',
    texto:'¿La semana pasada...',
    tipoPregunta:'G-S',
    aclaracion: 'Primero lea todas las opciones y luego marque la respuesta',
    opciones: [{
        opcion: 1, 
        texto: 'no deseaba, no quería trabajar?',
        salto: 'T13'
    },{
        opcion: 2, 
        texto: 'no podía trabajar por razones personales?',
        aclaracion: '(estudio, cuidado del hogar, etc)', 
        salto: 'T9'
    },{
        opcion: 3, 
        texto: 'no tuvo pedidos/clientes?',
        salto: 'T9'
    },{
        opcion: 4, 
        texto: 'no tenía trabajo y quería trabajar?',
        salto: 'T9'
    },{
        opcion: 5, 
        texto: 'tenía un trabajo/negocio al que no concurrió?',
    }]
},{
    id:'T28',
    texto:'¿Cuántos empleos/ocupaciones tiene?',
    aclaracion:'En el caso de tener más de un empleo, verifique que no haya trabajado en ninguno durante la semana pasada',
    tipoPregunta:'E-A',
    tipoDato:'number'
},{
    id:'T37',
    texto:'¿A qué se dedica o qué produce el negocio, empresa o institución en la que trabaja?',
    aclaracion:'Registre el producto principal que produce o los servicios que presta el establecimiento en el que trabaja. Para los trabajadores por cuenta propia, el establecimiento es la misma actividad que realizan', 
    tipoPregunta:'E-A',
    tipoDato:'string'
}];

estructura.forEach(function(pregunta,i){
    pregunta.posicion=i;
})

const indexPregunta = likeAr.createIndex(estructura,'id');

/////// DATOS

var respuestas = likeAr(likeAr.createIndex(estructura,'id')).map(_=>null);

////////// CONTROLADOR: React

type EstadoEncuestas={
    respuestas:{[varName:string]:any},
    preguntaActual:string, // la siguiene a la última respondida
    modoIngresador:boolean,
    modoDebug:boolean,
}

const estadoInicial=/*deepFreeze*/({
    respuestas, 
    preguntaActual:estructura[0].id,
    modoIngresador:true,
    modoDebug:true
});

const acciones = {
    modoIngresador:(params:{valor:boolean})=>(
        (estadoAnterior:EstadoEncuestas)=>({...estadoAnterior, modoIngresador:params.valor})
    ),
    modoDebug:(params:{valor:boolean})=>(
        (estadoAnterior:EstadoEncuestas)=>({...estadoAnterior, modoDebug:params.valor})
    ),
    proximaPregunta:(params:{pregunta:string})=>(
        (estadoAnterior:EstadoEncuestas)=>({...estadoAnterior, proximaPregunta:params.pregunta})
    ),
    registrarRespuesta:(params:{pregunta:string, respuesta:any})=>(
        (estadoAnterior:EstadoEncuestas)=>(
            {...estadoAnterior, respuestas:{...estadoAnterior.respuestas, [params.pregunta]:params.respuesta}}
        )
    ),
}

type DevuelveLoMismoQueRecibe<T> = {
    [K in keyof T]: T[K] extends (param:infer U) => any ? (param:U) => U & {type:K} : never
}

type LoQueRecibe<T> = {
    [K in keyof T]: T[K] extends (param:infer U) => any ? U & {type:K} : never
}

// @ts-ignore
const despacho:DevuelveLoMismoQueRecibe<typeof acciones> = 
likeAr(acciones).map(function(_v,name:string){
    return (params:any)=>({type:name, params});
}).plain();

type Acciones = {type:keyof typeof acciones, params:any};

function reduxEncuestas(estadoAnterior:EstadoEncuestas = estadoInicial, accion:Acciones){
    if(accion.type in acciones){
        return acciones[accion.type](accion.params)(estadoAnterior);
    }
    return {...estadoAnterior};
}

const store = createStore(reduxEncuestas)

////////// VISTA

function RowOpciones(props:{opcion:Opciones, elegida:boolean, onSelect:()=>void}){
    return (
        <tr className='opciones' es-elegida={props.elegida?"si":"no"} onClick={props.onSelect}>
            <td>{props.opcion.opcion}</td>
            <td className='texto-opcion'>{props.opcion.texto}</td>
            <td>{props.opcion.salto}</td>
        </tr>
    )
}

function RowPregunta(props:{key:string, preguntaId:string}){
    const estadoPregunta = useSelector((estado:EstadoEncuestas) => 
        ({modoIngresador:estado.modoIngresador, respuesta:estado.respuestas[props.preguntaId] }
    ));
    const pregunta = indexPregunta[props.preguntaId];
    const changeNumRespuesta = (event:React.ChangeEvent<HTMLInputElement>)=>{
        const valor = Number(event.currentTarget.value);
        /// TODO: cambiar
    };
    const changeTextRespuesta = (event:React.ChangeEvent<HTMLInputElement>)=>{
        const valor = event.currentTarget.value;
        /// TODO: cambiar
    };
    return (
        <tr tipo-pregunta={pregunta.tipoPregunta}>
            <td className="pregunta-id"><div>{pregunta.id}</div>
                {'opciones' in pregunta?
                    (estadoPregunta.modoIngresador?<input className="opcion-data-entry" value={estadoPregunta.respuesta||''}
                        onChange={changeNumRespuesta}
                    />:null)
                :null}
            </td>
            <td className="pregunta-box">
                <div className="pregunta-texto">{pregunta.texto}</div>
                {pregunta.aclaracion?
                    <div className="pregunta-aclaracion">{pregunta.aclaracion}</div>
                :null}
                {'opciones' in pregunta?
                    <table><tbody>{pregunta.opciones.map(opcion=>
                        <RowOpciones key={opcion.opcion} opcion={opcion} elegida={opcion.opcion==estadoPregunta.respuesta}
                            onSelect={()=>{/*
                                setNumRespuesta(opcion.opcion);
                                props.onUpdate(Number(opcion.opcion));
                            */}}
                        />
                    )}</tbody></table>
                :<TextField
                    id="standard-number"
                    value={estadoPregunta.respuesta==null?(pregunta.tipoDato=="string"?'':0):estadoPregunta.respuesta}
                    onChange={pregunta.tipoDato=="string"?changeTextRespuesta:changeNumRespuesta}
                    type={pregunta.tipoDato=="string"?"text":"number"}
                    InputLabelProps={{
                        shrink: true,
                    }}
                    margin="normal"
                    fullWidth={pregunta.tipoDato=="string"}
                />
                }
            </td>
        </tr>
    )
}

function FormularioEncuesta(){
    const estado = useSelector((estado:EstadoEncuestas)=>estado);
    const dispatch = useDispatch();
    return (
        <table className="ejemplo-encuesta">
            <caption>Formulario Encuesta
                <FormControlLabel
                    control={
                        <Switch
                            checked={estado.modoIngresador}
                            onChange={event=>dispatch(despacho.modoIngresador({valor:!!event.currentTarget.checked}))}
                            value="checkedB"
                            color="primary"
                        />
                    }
                    label="modo Ingresador"
                />
                <FormControlLabel
                    control={
                        <Switch
                            checked={estado.modoDebug}
                            onChange={event=>dispatch(despacho.modoDebug({valor:!!event.currentTarget.checked}))}
                            value="checkedB"
                            color="secondary"
                        />
                    }
                    label="modo Debug"
                />
            </caption>
            <tbody>
                {estructura.map(pregunta=>
                    <RowPregunta key={pregunta.id} preguntaId={pregunta.id}/>
                )}
            </tbody>
            <tfoot>
                <tr>
                    <td colSpan={99}>
                        <pre>
                            {estado.modoDebug?JSON.stringify(estado,null,'  '):null}
                        </pre>
                    </td>
                </tr>
            </tfoot>
        </table>

    )
}

export function ProbarFormularioEncuesta(props:{}){
    return (
        <Provider store={store}>
            <FormularioEncuesta/>
        </Provider>
    );
}