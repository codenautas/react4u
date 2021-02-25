import * as React from "react";
import {useState, useEffect, useRef} from "react";
import { createStore } from "redux"
import { Provider, useSelector, useDispatch } from "react-redux"
import { Button as ButtonFromMaterialUi, TextField as TextFieldFromMaterialUi, Switch, FormControlLabel } from "@material-ui/core"
import * as likeAr from "like-ar";
import { serie } from "best-globals"

/////// ESTRUCTURA

const ButtonFromBootstrap = (props:{children:any})=><button className="btn btn-outline-primary btn-lg">{props.children}</button>

const TextFieldFromBootstrap = (props:{
    disabled?:boolean,
    className?:string,
    autoFocus?:boolean,
    fullWidth:boolean
    inputProps?:any,
    value:any,
    type:any,
    label?:string,
    error?:boolean,
    helperText?:string,
    multiline?:boolean,
    onChange:(event:any)=>void,
    onFocus?:(event:any)=>void,
    onBlur?:(event:any)=>void,
})=><input
    disabled={props.disabled}
    className={props.className}
    autoFocus={props.autoFocus}
    value={props.value} 
    type={props.type}
    onChange={props.onChange}
    onFocus={props.onFocus}
    onBlur={props.onBlur}
    placeholder={props.label}
/>;


const MODO_WIDGET:'MATERIAL'|'BOOTSTRAP' = 'BOOTSTRAP'

var Button = MODO_WIDGET == 'MATERIAL' ? ButtonFromMaterialUi : ButtonFromBootstrap;
var TextField = MODO_WIDGET == 'MATERIAL' ? TextFieldFromMaterialUi : TextFieldFromBootstrap;

const MODO_RESPUESTAS:'ARR'|'OBJ' = 'OBJ';

type TipoDato='string'|'number'|'opcion';

type OpcionId = number;

type Opciones = {
    opcion: OpcionId,
    texto: string,
    aclaracion?: string,
    salto?: string|null
};

type PreguntaId = string;

type PreguntaBasica = {
    id:PreguntaId,
    texto:string,
    aclaracion?:string,
    tipoPregunta?:string,
    salto?:string,
    posicion?:number,
    tipoDato:TipoDato
}

type PreguntaConOpciones = PreguntaBasica & { tipoDato:'opcion', opciones: Opciones[] }
type PreguntaAbiertaNumerica = PreguntaBasica & { tipoDato:'number', maxValor?:number, minValor?:number }
type PreguntaAbiertaTexto = PreguntaBasica & { tipoDato:'string', regexp?:RegExp }
type Pregunta = PreguntaConOpciones | PreguntaAbiertaNumerica | PreguntaAbiertaTexto;

/*
type Pregunta = {
    id:PreguntaId,
    texto:string,
    aclaracion?:string,
    tipoPregunta?:string,
    salto?:string,
    posicion?:number
}&({ opciones: Opciones[] }|{ tipoDato:TipoDato })
*/

var estructuraMini:Pregunta[]=[{
    id:'T1',
    texto:'La semana pasada ¿Trabajó al menos una hora?',
    tipoPregunta:'E-S',
    tipoDato:'opcion',
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
    tipoDato:'opcion',
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
    tipoDato:'opcion',
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
    id:'T7',
    texto:'¿Recibe u obtiene algún pago por su trabajo, en dinero o en especie?',
    tipoDato:'opcion',
    opciones: [{
        opcion: 1, 
        texto: 'Sí',
        // salto: 'T30'
    },{
        opcion: 2, 
        texto: 'No'
    }]
},{
    id:'T9',
    texto:'Durante los últimos 30 días, ¿estuvo buscando trabajo de alguna manera?',
    tipoDato:'opcion',
    opciones: [{
        opcion: 1, 
        texto: 'Sí',
        // salto: 'T30'
    },{
        opcion: 2, 
        texto: 'No'
    }]
},{
    id:'T13',
    texto:'En los últimos 12 meses, ¿buscó trabajo?',
    tipoDato:'opcion',
    opciones: [{
        opcion: 1, 
        texto: 'Sí'
    },{
        opcion: 2, 
        texto: 'No'
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

function transformado(prefijoId:string, prefijoTexto:string){
    return (p:Pregunta)=>({
        ...p, id:prefijoId+p.id, texto:prefijoTexto+' '+p.texto,
        ...(p.tipoDato=='opcion'?{
            opciones:p.opciones.map((o:Opciones)=>({
                ...o, salto:o.salto?prefijoId+o.salto:null
            }))
        }:null)
    })
}

var estructura:Pregunta[]=[
    ...estructuraMini,
    ...estructuraMini.map(transformado('A', 'nuevamente')),
    ...estructuraMini.map(transformado('B', 'otra vez')),
    ...estructuraMini.map(transformado('C', 'por último')),
];

for(var i =1; i<=200; i++){
    estructura = [
        ...estructura, 
        ...estructuraMini.map(transformado('D'+i, 'muchos parte '+i))
    ]
}

estructura.forEach(function(pregunta,i){
    pregunta.posicion=i;
})

const indexPregunta = likeAr.createIndex(estructura,'id');
const indexPreguntaOpcion = likeAr(indexPregunta).map(p=>'opciones' in p?likeAr.createIndex(p.opciones, 'opcion'):null).plain();

/////// DATOS

var respuestas = likeAr(likeAr.createIndex(estructura,'id')).map(_=>null);
var respuestasArr = estructura.map(preg=>[preg.id, null] as [string,null]);

////////// CONTROLADOR: React

type EstadoEncuestas={
    respuestas:{[varName:string]:any},
    respuestasArr:[varname:string, value:any][],
    preguntaActual:string, // la siguiene a la última respondida
    modoIngresador:boolean,
    modoDebug:boolean,
}

const estadoInicial=/*deepFreeze*/({
    respuestas, 
    respuestasArr, 
    preguntaActual:estructura[0].id,
    modoIngresador:true,
    modoDebug:false
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
            MODO_RESPUESTAS=='ARR'?{
                ...estadoAnterior, 
                respuestasArr: estadoAnterior.respuestasArr.map(r => r[0]==params.pregunta? [r[0], params.respuesta] : r)
            }
            :{...estadoAnterior, respuestas:{...estadoAnterior.respuestas, [params.pregunta]:params.respuesta}}
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

const RowOpciones = React.memo((props:{opcion:OpcionId, pregunta:PreguntaId, valor:any})=>{
    const {opcion, elegida} = useSelector(
        (estado:EstadoEncuestas)=>{
            var laPregunta=indexPregunta[props.pregunta];
            if(laPregunta.tipoDato=='opcion'){
                return {
                    opcion:indexPreguntaOpcion[props.pregunta]![props.opcion]!,
                    elegida:props.opcion == props.valor
                }
            }else{
                throw new Error('error interno desplegando opciones de una pregunta que no tiene opciones')
            }
        }
    )
    const dispatch = useDispatch();
    return (
        <tr className='opciones' es-elegida={elegida?"si":"no"} onClick={
            ()=>{
                dispatch(despacho.registrarRespuesta({pregunta:props.pregunta, respuesta:props.opcion}))
                // if(opcion.salto){
                //     var anchor = document.querySelector(`[pregunta-id=${opcion.salto}]`);
                // }else{
                //     var anchor = document.querySelector(`[pregunta-id=${props.pregunta}]`);
                //     if(anchor){
                //         if(anchor.nextSibling instanceof Element){
                //             anchor=anchor.nextSibling;
                //         }
                //     }
                // }
                // setTimeout(()=>{
                //     if(anchor){
                //         var rect = anchor.getBoundingClientRect();
                //         window.scrollTo({ behavior: 'smooth', top:rect.top+window.scrollY-100});
                //     }
                // }, 100
                // )
            }
        }>
            <td><Button>{opcion.opcion}</Button></td>
            <td className='texto-opcion'><Button>{opcion.texto}</Button></td>
            <td><Button>{opcion.salto}</Button></td>
        </tr>
    )
});

type OnUpdate<T> = (data:T)=>void

type InputTypes = 'date'|'number'|'tel'|'text';

const TypedInput = React.memo(function<T>(props:{
    value:T,
    dataType: InputTypes
    onUpdate:OnUpdate<T>, 
    onFocusOut:()=>void, 
    onWantToMoveForward?:(()=>boolean)|null
}){
    var [value, setValue] = useState(props.value);
    const inputRef = useRef<HTMLInputElement>(null);
    useEffect(() => {
        if(inputRef.current != null){
            inputRef.current.focus();
        }
    }, []);
    // @ts-ignore acá hay un problema con el cambio de tipos
    var valueString:string = value==null?'':value;
    return (
        <input ref={inputRef} value={valueString} type={props.dataType} onChange={(event)=>{
            // @ts-ignore Tengo que averiguar cómo hacer esto genérico:
            setValue(event.target.value);
        }} onBlur={(event)=>{
            if(value!=props.value){
                // @ts-ignore Tengo que averiguar cómo hacer esto genérico:
                props.onUpdate(event.target.value);
            }
            props.onFocusOut();
        }} onMouseOut={()=>{
            if(document.activeElement!=inputRef.current){
                props.onFocusOut();
            }
        }} onKeyDown={event=>{
            var tecla = event.charCode || event.which;
            if((tecla==13 || tecla==9) && !event.altKey && !event.ctrlKey && !event.metaKey && !event.shiftKey){
                if(!(props.onWantToMoveForward && props.onWantToMoveForward())){
                    if(inputRef.current!=null){
                        inputRef.current.blur();
                    }
                }
                event.preventDefault();
            }
        }}/>
    )
});

function RowPregunta(props:{key:string, preguntaId:string}){
    const estadoPregunta = useSelector((estado:EstadoEncuestas) => 
        ({modoIngresador:estado.modoIngresador, respuesta:estado.respuestas[props.preguntaId] }
    ));
    const dispatch = useDispatch();
    const pregunta = indexPregunta[props.preguntaId];
    const changeNumRespuesta = (event:React.ChangeEvent<HTMLInputElement>)=>{
        const valor = Number(event.currentTarget.value);
        dispatch(despacho.registrarRespuesta({pregunta:props.preguntaId, respuesta:valor}))
    };
    const changeTextRespuesta = (event:React.ChangeEvent<HTMLInputElement>)=>{
        const valor = event.currentTarget.value;
        dispatch(despacho.registrarRespuesta({pregunta:props.preguntaId, respuesta:valor}))
    };
    return (
        <tr tipo-pregunta={pregunta.tipoPregunta} pregunta-id={pregunta.id}>
            <td className="pregunta-id"><div>{pregunta.id}</div>
                {pregunta.tipoDato=='opcion'?
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
                        <RowOpciones key={opcion.opcion} opcion={opcion.opcion} pregunta={pregunta.id} valor={estadoPregunta.respuesta} />
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

const RowPreguntaDePrueba = React.memo((props:{key:string, preguntaId:string})=>{
    const estadoPregunta = useSelector((estado:EstadoEncuestas) => 
        ({
            modoIngresador:estado.modoIngresador, 
            respuesta:MODO_RESPUESTAS=='ARR'? 
            estado.respuestasArr.find(r => r[0] == props.preguntaId)?.[1]
            : estado.respuestas[props.preguntaId] 
        }
    ));
    const dispatch = useDispatch();
    const pregunta = indexPregunta[props.preguntaId];
    const changeNumRespuesta = (valorStr:any)=>{
        const valor = Number(valorStr);
        dispatch(despacho.registrarRespuesta({pregunta:props.preguntaId, respuesta:valor}))
    };
    const changeTextRespuesta = (valor:any)=>{
        dispatch(despacho.registrarRespuesta({pregunta:props.preguntaId, respuesta:valor}))
    };
    return (
        <tr tipo-pregunta={pregunta.tipoPregunta} pregunta-id={pregunta.id}>
            <td className="pregunta-id"><div>{pregunta.id}</div>
                {pregunta.tipoDato=='opcion'?
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
                        <RowOpciones key={opcion.opcion} opcion={opcion.opcion} pregunta={pregunta.id} valor={estadoPregunta.respuesta} />
                    )}</tbody></table>
                :<TypedInput
                    value={estadoPregunta.respuesta==null?(pregunta.tipoDato=="string"?'':0):estadoPregunta.respuesta}
                    onUpdate={pregunta.tipoDato=="string"?changeTextRespuesta:changeNumRespuesta}
                    dataType={pregunta.tipoDato=="string"?"text":"number"}
                    onFocusOut={()=>{}}
                    onWantToMoveForward={null}
                />
                }
            </td>
        </tr>
    )
});

function FormularioEncuesta(){
    const estado = useSelector((estado:EstadoEncuestas)=>estado);
    const dispatch = useDispatch();
    return (<>
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
        <div style={{height:'200px'}}></div>
    </>)
}


//         

export function ProbarFormularioEncuesta(props:{}){
    return (
        <Provider store={store}>
            <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/4.0.0/css/bootstrap.min.css" integrity="sha384-Gn5384xqQ1aoWXA+058RXPxPg6fy4IWvTNh0E263XmFcJlSAwiGgFAW/dAiS6JXm" crossorigin="anonymous"></link>            
            <FormularioEncuesta/>
        </Provider>
    );
}