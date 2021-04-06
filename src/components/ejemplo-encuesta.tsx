import * as React from "react";
import {useState, useEffect, useRef} from "react";
import { createStore } from "redux"
import { Provider, useSelector, useDispatch } from "react-redux"
import { Button as ButtonFromMaterialUi, TextField as TextFieldFromMaterialUi, Switch, FormControlLabel, Popover } from "@material-ui/core"
import * as likeAr from "like-ar";
import { serie } from "best-globals"
import { Operaciones } from "./ejemplo-operaciones";

/////// ESTRUCTURA

type ForPk = 'F1'|'F2'|'F3';

var respuestasByPassFor:{
    [forPk in ForPk]: {[idPregunta:string]:any}
}={
    F1:{}, 
    F2:{}, 
    F3:{}
};

var cacheInputs:{[idPregunta:string]:{
    pregunta:HTMLInputElement,
    opciones:{opcion:string, tr:HTMLTableRowElement}[]
}}={}

function refreshRespuestas(formId:ForPk){
    for(var pregunta in respuestasByPassFor[formId]){
        var respuesta = respuestasByPassFor[formId][pregunta];
        var inputs = cacheInputs[pregunta];
        if(!inputs){
            inputs = {} as unknown as typeof inputs;
            cacheInputs[pregunta] = inputs;
        }
        if(!inputs.pregunta || !inputs.opciones){
            inputs.pregunta = document.querySelector(`[input-pregunta="${pregunta}"]`) as HTMLInputElement;
            var arrayTr:HTMLTableRowElement[] = Array.prototype.slice.call(document.querySelectorAll(`[trs-pregunta="${pregunta}"]`) ,0);
            inputs.opciones = arrayTr.map(tr => ({tr, opcion:tr.getAttribute('valor-opcion')!}))
        }
        if( inputs.pregunta && inputs.pregunta.value != respuesta ){
            inputs.pregunta.value = respuesta;
        }
        for(var tropcion of inputs.opciones){
            var sino = tropcion.opcion == respuesta ? 'si' : 'no';
            if( tropcion.tr.getAttribute('es-elegida') != sino ){
                tropcion.tr.setAttribute('es-elegida', sino );
            }
        }
    }
}

function dispatchByPass(payload:{params:{pregunta:string, respuesta:any, formId:ForPk}, type:string}){
    var {pregunta, respuesta, formId} = payload.params;
    console.log(arguments);
    respuestasByPassFor[formId][pregunta] = respuesta;
    refreshRespuestas(formId);
}

const ButtonFromBootstrap = ({children, ...others}:{children:any})=>
    <button {...others} className="btn btn-outline-primary btn-lg">
        {children}
    </button>

const TextFieldFromBootstrap = ({
    disabled,
    className,
    autoFocus,
    fullWidth,
    inputProps,
    value,
    type,
    label,
    error,
    helperText,
    multiline,
    onChange,
    onFocus,
    onBlur,
    ...other
}:{
    disabled?:boolean,
    className?:string,
    autoFocus?:boolean,
    fullWidth?:boolean
    inputProps?:any,
    value?:any,
    type?:any,
    label?:string,
    error?:boolean,
    helperText?:string,
    multiline?:boolean,
    "input-pregunta"?:string,
    onChange:(event:any)=>void,
    onFocus?:(event:any)=>void,
    onBlur?:(event:any)=>void
})=><input
    input-pregunta={other["input-pregunta"]}
    disabled={disabled}
    className={className}
    autoFocus={autoFocus}
    type={type}
    onChange={onChange}
    onFocus={onFocus}
    onBlur={onBlur}
    placeholder={label}
/>;


var MODO_WIDGET:'MATERIAL'|'BOOTSTRAP' = 'BOOTSTRAP'

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

if(true){
for(var i =1; i<=200; i++){
    estructura = [
        ...estructura, 
        ...estructuraMini.map(transformado('D'+i, 'muchos parte '+i))
    ]
}
}

estructura.forEach(function(pregunta,i){
    pregunta.posicion=i;
    for(let formId in respuestasByPassFor){
        respuestasByPassFor[formId as ForPk][pregunta.id] = i % 2 + 1;
    }
})

const indexPregunta = likeAr.createIndex(estructura,'id');
const indexPreguntaOpcion = likeAr(indexPregunta).map(p=>'opciones' in p?likeAr.createIndex(p.opciones, 'opcion'):null).plain();

/////// DATOS

var respuestas = likeAr(likeAr.createIndex(estructura,'id')).map(_=>null);
var respuestasArr = estructura.map(preg=>[preg.id, null] as [string,null]);

////////// CONTROLADOR: React

type EstadoEncuestas={
    respuestas:{[forPk in ForPk]: {[varName:string]:any}}
    //respuestas:{[varName:string]:any},
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
    registrarRespuesta:(params:{pregunta:string, respuesta:any, formId:ForPk})=>(
        (estadoAnterior:EstadoEncuestas)=>(
            MODO_RESPUESTAS=='ARR'?{ //TODO: adaptar a estructura de formularios
                ...estadoAnterior, 
                respuestasArr: estadoAnterior.respuestasArr.map(r => r[0]==params.pregunta? [r[0], params.respuesta] : r)
            }
            :{
                ...estadoAnterior,
                respuestas:{
                    ...estadoAnterior.respuestas,
                    [params.formId]:{
                        ...estadoAnterior.respuestas[params.formId],
                        [params.pregunta]:params.respuesta
                    }
                }
            }
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

const RowOpciones = React.memo((props:{opcion:OpcionId, pregunta:PreguntaId, formId:ForPk})=>{
    const {opcion} = useSelector(
        (estado:EstadoEncuestas)=>{
            var laPregunta=indexPregunta[props.pregunta];
            if(laPregunta.tipoDato=='opcion'){
                return {
                    opcion:indexPreguntaOpcion[props.pregunta]![props.opcion]!,
                }
            }else{
                throw new Error('error interno desplegando opciones de una pregunta que no tiene opciones')
            }
        }
    )
    return (
        <tr className='opciones' tr-opcion={`${props.pregunta}-${props.opcion}`} trs-pregunta={props.pregunta} valor-opcion={props.opcion} onClick={
            ()=>{
                dispatchByPass(despacho.registrarRespuesta({pregunta:props.pregunta, respuesta:props.opcion, formId:props.formId}))
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

function RowPregunta(props:{key:string, preguntaId:string, formId:ForPk}){
    var [openConfirm, setOpenConfirm] = useState(null);
    const estadoPregunta = useSelector((estado:EstadoEncuestas) => 
        ({modoIngresador:estado.modoIngresador}
    ));
    const pregunta = indexPregunta[props.preguntaId];
    const changeNumRespuesta = (event:React.ChangeEvent<HTMLInputElement>)=>{
        const valor = Number(event.currentTarget.value);
        dispatchByPass(despacho.registrarRespuesta({pregunta:props.preguntaId, respuesta:valor, formId:props.formId}))
    };
    const changeTextRespuesta = (event:React.ChangeEvent<HTMLInputElement>)=>{
        const valor = event.currentTarget.value;
        dispatchByPass(despacho.registrarRespuesta({pregunta:props.preguntaId, respuesta:valor, formId:props.formId}))
    };
    return (
        <tr tipo-pregunta={pregunta.tipoPregunta} pregunta-id={pregunta.id}>
            <td className="pregunta-id"><div>{pregunta.id}</div>
                {pregunta.tipoDato=='opcion'?
                    (estadoPregunta.modoIngresador?<input input-pregunta={props.preguntaId} className="opcion-data-entry" 
                        onChange={changeNumRespuesta}
                    />:null)
                :null}
                <br/>
                <button
                    onClick={(event)=>setOpenConfirm(event.currentTarget)}
                >[X]</button>
            </td>
            <td className="pregunta-box">
                <div className="pregunta-texto">{pregunta.texto}</div>
                {pregunta.aclaracion?
                    <div className="pregunta-aclaracion">{pregunta.aclaracion}</div>
                :null}
                {'opciones' in pregunta?
                    <table><tbody>{pregunta.opciones.map(opcion=>
                        <RowOpciones key={opcion.opcion} opcion={opcion.opcion} pregunta={pregunta.id} formId={props.formId}/>
                    )}</tbody></table>
                :<TextField
                    input-pregunta={props.preguntaId}
                    inputProps={{"input-pregunta": props.preguntaId}}
                    onChange={pregunta.tipoDato=="string"?changeTextRespuesta:changeNumRespuesta}
                    type={pregunta.tipoDato=="string"?"text":"number"}
                    InputLabelProps={{
                        shrink: true,
                    }}
                    margin="normal"
                    fullWidth={pregunta.tipoDato=="string"}
                />
                }
                <Popover
                    id={"popover-confirmar"}
                    open={!!openConfirm}
                    anchorEl={openConfirm}
                    style={{display:openConfirm?'unset':'none'}}
                    onClose={()=>{setOpenConfirm(null)}}
                    anchorOrigin={{
                        vertical: 'bottom',
                        horizontal: 'center',
                    }}
                    transformOrigin={{
                        vertical: 'top',
                        horizontal: 'left',
                    }}
                >   
                    <p>La pregunta tiene registrada una respuesta que no fue detectada como errónea</p>
                    <div className="confirma-botones">
                        <Button color="secondary" variant="outlined" onClick={()=>{
                            dispatchByPass(despacho.registrarRespuesta({pregunta:props.preguntaId, respuesta:null, formId:props.formId}));
                            setOpenConfirm(null);
                        }}>borrar respuesta</Button>
                        <Button color="primary" variant="outlined" onClick={()=>setOpenConfirm(null)}>volver sin borrar</Button>
                    </div>
                </Popover>
            </td>
        </tr>
)
}

function FormularioEncuesta(props:{formId:ForPk}){
    const estado = useSelector((estado:EstadoEncuestas)=>estado);
    const [verTodo, setVerTodo] = useState(false);
    useEffect(()=>{
        var timer:NodeJS.Timeout|null = setInterval(()=>{
            setVerTodo(true);
            //refreshRespuestas(props.formId);
        },250)
        return ()=>{
            if(timer){
                clearInterval(timer);
            }
        }
    })
    const dispatch = useDispatch();
    return (<>
        <h1>Formulario {props.formId}</h1>
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
                {verTodo?null:<div style={{height:"500px", textAlign:'center', verticalAlign:'middle', width:'100%', position:"fixed", backgroundColor: 'rgba(100,100,100,0.3)', fontSize:'200%'}} >cargando...</div>}
                {estructura.map((pregunta, i)=>
                    verTodo || i < 10?<RowPregunta key={pregunta.id} preguntaId={pregunta.id} formId={props.formId}/>:null
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
    const [formActual, setFormActual] = useState<ForPk>("F1");
    useEffect(()=>{
        refreshRespuestas(formActual);
    },[formActual])
    return (
        <Provider store={store}>
            <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/4.0.0/css/bootstrap.min.css" integrity="sha384-Gn5384xqQ1aoWXA+058RXPxPg6fy4IWvTNh0E263XmFcJlSAwiGgFAW/dAiS6JXm" crossOrigin="anonymous"></link>            
            {likeAr(respuestasByPassFor).map((_elem, formId:ForPk)=>
                <Button color="secondary" variant="outlined" onClick={()=>{
                    setFormActual(formId);
                }}>{formId}</Button>
            ).array()}
            <FormularioEncuesta formId={formActual}/>
        </Provider>
    );
}