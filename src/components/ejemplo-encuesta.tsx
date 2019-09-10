import * as React from "react";
import {useState} from "react";
import { TextField, Switch, FormControlLabel } from "@material-ui/core"

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
    salto?:string
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
}]

function RowOpciones(props:{opcion:Opciones, elegida:boolean, onSelect:()=>void}){
    return (
        <tr className='opciones' es-elegida={props.elegida?"si":"no"} onClick={props.onSelect}>
            <td>{props.opcion.opcion}</td>
            <td className='texto-opcion'>{props.opcion.texto}</td>
            <td>{props.opcion.salto}</td>
        </tr>
    )
}

function RowPregunta(props:{pregunta:Pregunta, modoIngresador:boolean}){
    const [numRespuesta, setNumRespuesta] = useState<number|null>(null);
    const [textRespuesta, setTextRespuesta] = useState<string|null>(null);
    const pregunta = props.pregunta;
    const changeNumRespuesta = (event:React.ChangeEvent<HTMLInputElement>)=>setNumRespuesta(Number(event.currentTarget.value));
    const changeTextRespuesta = (event:React.ChangeEvent<HTMLInputElement>)=>setTextRespuesta(event.currentTarget.value);
    return (
        <tr tipo-pregunta={pregunta.tipoPregunta}>
            <td className="pregunta-id"><div>{pregunta.id}</div>
                {'opciones' in pregunta?
                    (props.modoIngresador?<input className="opcion-data-entry" value={numRespuesta||''}
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
                        <RowOpciones key={opcion.opcion} opcion={opcion} elegida={opcion.opcion==numRespuesta}
                            onSelect={()=>setNumRespuesta(opcion.opcion)}
                        />
                    )}</tbody></table>
                :<TextField
                    id="standard-number"
                    value={numRespuesta}
                    onChange={changeTextRespuesta}
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

export function ProbarFormularioEncuesta(props:{}){
    const [modoIngresador, setModoIngresador] = useState<boolean>(true)
    return (
        <table className="ejemplo-encuesta">
            <caption>Formulario Encuesta
                <FormControlLabel
                    control={
                        <Switch
                            checked={modoIngresador}
                            onChange={(event:React.ChangeEvent<HTMLInputElement>)=>setModoIngresador(event.currentTarget.checked)}
                            value="checkedB"
                            color="primary"
                        />
                    }
                    label="modo Ingresador"
                />
            </caption>
            <tbody>
                {estructura.map(pregunta=>
                    <RowPregunta key={pregunta.id} pregunta={pregunta} modoIngresador={modoIngresador}/>
                )}
            </tbody>
        </table>
    );
}