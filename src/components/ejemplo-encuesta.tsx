import * as React from "react";
import {useState} from "react";

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
    tipoPregunta?:string
    salto?:string
    opciones?: Opciones[]
}

var estructura:Pregunta[]=[{
    id:'T1',
    texto:'La semana pasada ¿Trabajó al menos una hora?',
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
    aclaracion:'En el caso de tener más de un empleo, verifique que no haya trabajado en ninguno durante la semana pasada'
}]

function RowOpciones(props:{opcion:Opciones}){
    return (
        <tr>
            <td>{props.opcion.opcion}</td>
            <td>{props.opcion.texto}</td>
            <td>{props.opcion.salto}</td>
        </tr>
    )
}

function RowPregunta(props:{pregunta:Pregunta}){
    const pregunta = props.pregunta;
    return (
        <tr>
            <td className="pregunta-id"><div>{pregunta.id}</div></td>
            <td className="pregunta-box">
                <div className="pregunta-texto">{pregunta.texto}</div>
                {pregunta.aclaracion?
                    <div className="pregunta-aclaracion">{pregunta.aclaracion}</div>
                :null}
                {pregunta.opciones?
                    <table><tbody>{pregunta.opciones.map(opcion=>
                        <RowOpciones key={opcion.opcion} opcion={opcion}/>
                    )}</tbody></table>
                :null}
            </td>
        </tr>
    )
}

export function ProbarFormularioEncuesta(props:{}){
    return (
        <table className="ejemplo-encuesta">
            <caption>Formulario Encuesta</caption>
            <tbody>
                {estructura.map(pregunta=>
                    <RowPregunta key={pregunta.id} pregunta={pregunta} />
                )}
            </tbody>
        </table>
    );
}