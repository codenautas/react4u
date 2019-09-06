import * as React from "react";
import {useState, useRef, useEffect, useImperativeHandle, createRef, forwardRef} from "react";
import {changing} from "best-globals";
import * as likeAr from "like-ar";
import {Menu, MenuItem, ListItemText, Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle} from "@material-ui/core";


const FLECHATIPOPRECIO="→";
const FLECHAATRIBUTOS="➡";

type Focusable = {
    focus:()=>void
    blur:()=>void
}

type DataAtributo = {
    atributo:string,
    valorAnterior:string|null,
    valor:string|null
}

type DataPrecio = {
    producto:string, 
    especificacion:string, 
    tipoPrecioAnterior:string|null, 
    tipoPrecio:string|null, 
    precio:number|null,
    precioAnterior:number|null,
    atributos:DataAtributo[],
    cambio:string|null
}

type TiposPrecioDef = {
    tipoPrecio: string,
    descripcion: string,
    positivo: boolean,
    copiable?: true, 
    predeterminado?: true, 
}

var tiposPrecioDef:TiposPrecioDef[]=[
    {tipoPrecio:'P', descripcion:'Precio normal'   , positivo:true , predeterminado:true},
    {tipoPrecio:'O', descripcion:'Oferta'          , positivo:true },
    {tipoPrecio:'B', descripcion:'Bonificado'      , positivo:true },
    {tipoPrecio:'S', descripcion:'Sin existencia'  , positivo:false},
    {tipoPrecio:'N', descripcion:'No vende'        , positivo:false, copiable:true},
    {tipoPrecio:'E', descripcion:'Falta estacional', positivo:false, copiable:true},
];

var tipoPrecio=likeAr.createIndex(tiposPrecioDef, 'tipoPrecio');

var tipoPrecioPredeterminado = tiposPrecioDef.find(tp=>tp.predeterminado)!;

var dataPreciosInicialCorto:DataPrecio[] = [
    {
        producto:'Lata de tomate',
        especificacion:'Lata de tomate perita enteros pelado de 120 a 140g neto',
        tipoPrecioAnterior:'P',
        precioAnterior:120,
        tipoPrecio:'O',
        precio:130,
        atributos:[
            {atributo:'Marca', valorAnterior:'La campagnola', valor:null},
            {atributo:'Gramaje', valorAnterior:'300', valor:null}
        ],
        cambio: null
    },
    {
        producto:'Lata de arvejas',
        especificacion:'Lata de arvejas peladas de 120 a 140g neto',
        tipoPrecioAnterior:'P',
        precioAnterior:140,
        tipoPrecio:null,
        precio:null,
        atributos:[
            {atributo:'Marca', valorAnterior:'La campagnola', valor:null},
            {atributo:'Gramaje', valorAnterior:'300', valor:null}
        ],
        cambio: null
    },
    {
        producto:'Yerba',
        especificacion:'Paquete de yerba con palo en envase de papel de 500g',
        tipoPrecioAnterior:'S',
        precioAnterior:null,
        tipoPrecio:'S',
        precio:null,
        atributos:[
            {atributo:'Marca', valorAnterior:'Unión', valor:'Unión'},
            {atributo:'Variante', valorAnterior:'Suave sin palo', valor:'Suave sin palo'},
            {atributo:'Gramaje', valorAnterior:'500', valor:'500'}
        ],
        cambio: null
    },
    {
        producto:'Leche entera en sachet',
        especificacion:'Leche entera en sachet de 1 litro sin adhitivos ni vitaminas',
        tipoPrecioAnterior:'P',
        precioAnterior:56,
        tipoPrecio:'P',
        precio:57.75,
        atributos:[
            {atributo:'Marca', valorAnterior:'Sancor', valor:'Sancor'},
        ],
        cambio: null
    },
    {
        producto:'Dulce de leche',
        especificacion:'Dulce de leche en envase de 300g a 550g. Excluir mezclas especiales y marcas premium',
        tipoPrecioAnterior:'P',
        precioAnterior:98.40,
        tipoPrecio:'P',
        precio:57.75,
        atributos:[
            {atributo:'Marca'   , valorAnterior:'Sancor', valor:null},
            {atributo:'Variante', valorAnterior:'Repostero', valor:null},
            {atributo:'Gramaje' , valorAnterior:'500g', valor:null},
            {atributo:'Envase'  , valorAnterior:'Plástico', valor:null},
        ],
        cambio: null
    },
];

var dataPreciosInicial=[...dataPreciosInicialCorto,
    {
        producto:'Mandarina',
        especificacion:'Mandarina común',
        tipoPrecioAnterior:'E',
        precioAnterior:null,
        tipoPrecio:null,
        precio:null,
        atributos:[],
        cambio: null
    },
    {
        producto:'Carbón de leña',
        especificacion:'Carbón de leña en bolsa de plástico o papel de 3 a 5kg',
        tipoPrecioAnterior:'N',
        precioAnterior:null,
        tipoPrecio:null,
        precio:null,
        atributos:[
            {atributo:'Marca'   , valorAnterior:'s/m'   , valor:null},
            {atributo:'Kilos'   , valorAnterior:'3'     , valor:null},
            {atributo:'Envase'  , valorAnterior:'Papel' , valor:null},
        ],
        cambio: null
    },
];

while(dataPreciosInicial.length<100){
    dataPreciosInicial.push(changing(dataPreciosInicialCorto[Math.floor(Math.random()*dataPreciosInicialCorto.length)],{}));
}

type OnUpdate<T> = (data:T)=>void

function TypedInput<T>(props:{
    value:T, 
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
        <input ref={inputRef} value={valueString} onChange={(event)=>{
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
}

const EditableTd = forwardRef(function<T extends any>(props:{
    disabled?:boolean,
    value:T, 
    className?:string, colSpan?:number, rowSpan?:number, 
    onUpdate:OnUpdate<T>, 
    onWantToMoveForward?:(()=>boolean)|null
},
    ref:React.Ref<Focusable>
){
    const [editando, setEditando] = useState(false);
    useImperativeHandle(ref, () => ({
        focus: () => {
            setEditando(true && !props.disabled)
        },
        blur: () => {
            setEditando(false)
        }
    }));    
    return (
        <td colSpan={props.colSpan} rowSpan={props.rowSpan} className={props.className} onClick={
            ()=>setEditando(true && !props.disabled)
        }>
            {editando?
                <TypedInput value={props.value} onUpdate={value =>{
                    props.onUpdate(value);
                }} onFocusOut={()=>{
                    setEditando(false);
                }} onWantToMoveForward={props.onWantToMoveForward}/>
            :<div>{props.value}</div>}
        </td>
    )
});

const AtributosRow = forwardRef(function(props:{
    dataAtributo:DataAtributo, 
    cambio:string|null,
    primerAtributo:boolean, 
    cantidadAtributos:number, 
    ultimoAtributo:boolean,
    onUpdate:OnUpdate<DataAtributo>, 
    habilitarCopiado:boolean, 
    deshabilitarAtributo:boolean,
    onCopiarAtributos:()=>void,
    onMarcarCambio:()=>void,
    onWantToMoveForward?:()=>boolean},
    ref:React.Ref<Focusable>
){
    const atributo = props.dataAtributo;
    return (
        <tr>
            <td>{atributo.atributo}</td>
            <td colSpan={2} className="atributo-anterior" >{atributo.valorAnterior}</td>
            {props.primerAtributo?
                <td rowSpan={props.cantidadAtributos} className="flechaAtributos" onClick={ () => {
                    if(props.habilitarCopiado){
                        props.onCopiarAtributos()
                    }
                }}>{props.habilitarCopiado?FLECHAATRIBUTOS:props.cambio}</td>
                :null}
            <EditableTd disabled={props.deshabilitarAtributo} colSpan={2} className="atributo-actual" value={atributo.valor} onUpdate={value=>{
                atributo.valor=value;
                props.onMarcarCambio();
                props.onUpdate(atributo);
            }} onWantToMoveForward={props.onWantToMoveForward}
            ref={ref} />
        </tr>
    )
});

function PreciosRow(props:{
    dataPrecio:DataPrecio, 
    onUpdate:OnUpdate<DataPrecio>
}){
    const precioRef = useRef<HTMLInputElement>(null);
    const atributosRef = useRef(props.dataPrecio.atributos.map(() => createRef<HTMLInputElement>()));
    const [menuTipoPrecio, setMenuTipoPrecio] = useState<HTMLElement|null>(null);
    const [menuConfirmarBorradoPrecio, setMenuConfirmarBorradoPrecio] = useState<boolean>(false);
    const [tipoDePrecioNegativoAConfirmar, setTipoDePrecioNegativoAConfirmar] = useState<string|null>(null);
    const [deshabilitarPrecio, setDeshabilitarPrecio] = useState<boolean>(props.dataPrecio.tipoPrecio?!(tipoPrecio[props.dataPrecio.tipoPrecio].positivo):false);
    var habilitarCopiado = props.dataPrecio.cambio==null && (!props.dataPrecio.tipoPrecio || tipoPrecio[props.dataPrecio.tipoPrecio].positivo);
    return (
        <tbody>
            <tr>
                <td className="col-prod-esp" rowSpan={props.dataPrecio.atributos.length + 1}>
                    <div className="producto">{props.dataPrecio.producto}</div>
                    <div className="especificacion">{props.dataPrecio.especificacion}</div>
                </td>
                <td className="observaiones"><button>Obs.</button></td>
                <td className="tipoPrecioAnterior">{props.dataPrecio.tipoPrecioAnterior}</td>
                <td className="precioAnterior">{props.dataPrecio.precioAnterior}</td>
                { props.dataPrecio.tipoPrecio==null 
                    && props.dataPrecio.tipoPrecioAnterior!=null 
                    && tipoPrecio[props.dataPrecio.tipoPrecioAnterior].copiable
                ?
                    <td className="flechaTP" onClick={ () => {
                        props.dataPrecio.tipoPrecio = props.dataPrecio.tipoPrecioAnterior;
                        props.onUpdate(props.dataPrecio);
                    }}>{FLECHATIPOPRECIO}</td>
                :
                    <td className="flechaTP"></td>
                }
                <td className="tipoPrecio"
                    onClick={event=>setMenuTipoPrecio(event.currentTarget)}
                >{props.dataPrecio.tipoPrecio}
                </td>
                <Menu id="simple-menu"
                    open={Boolean(menuTipoPrecio)}
                    anchorEl={menuTipoPrecio}
                    onClose={()=>setMenuTipoPrecio(null)}
                >
                    {tiposPrecioDef.map(tpDef=>
                        <MenuItem key={tpDef.tipoPrecio} onClick={()=>{
                            setMenuTipoPrecio(null);
                            var necesitaConfirmacion = !tipoPrecio[tpDef.tipoPrecio].positivo && props.dataPrecio.precio != null || props.dataPrecio.cambio != null;
                            if(necesitaConfirmacion){
                                setTipoDePrecioNegativoAConfirmar(tpDef.tipoPrecio);
                                setMenuConfirmarBorradoPrecio(true)
                            }else{
                                setDeshabilitarPrecio(!tipoPrecio[tpDef.tipoPrecio].positivo);
                                props.dataPrecio.tipoPrecio = tpDef.tipoPrecio;
                                if(precioRef.current && !props.dataPrecio.precio && tipoPrecio[tpDef.tipoPrecio].positivo){
                                    precioRef.current.focus();
                                }
                            }
                            /**
                             * // TODO: REVISAR por qué hacía delay
                             */
                            //props.onUpdate(props.dataPrecio);
                        }}>
                            <ListItemText>{tpDef.tipoPrecio}&nbsp;</ListItemText>
                            <ListItemText>&nbsp;{tpDef.descripcion}</ListItemText>
                        </MenuItem>
                    )}
                </Menu>
                <Dialog
                    open={menuConfirmarBorradoPrecio}
                    onClose={()=>setMenuConfirmarBorradoPrecio(false)}
                    aria-labelledby="alert-dialog-title"
                    aria-describedby="alert-dialog-description"
                >
                    <DialogTitle id="alert-dialog-title">{"Confirma tipo de precio negativo?"}</DialogTitle>
                    <DialogContent>
                        <DialogContentText id="alert-dialog-description">
                            Se borrará el precio y los atributos
                        </DialogContentText>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={()=>{
                            setMenuConfirmarBorradoPrecio(false)
                        }} color="primary">
                            Cancelar
                        </Button>
                        <Button onClick={()=>{
                            props.dataPrecio.tipoPrecio = tipoDePrecioNegativoAConfirmar;
                            props.dataPrecio.precio=null;
                            props.dataPrecio.cambio=null;
                            props.dataPrecio.atributos.forEach((atrib)=>atrib.valor=null);
                            props.onUpdate(props.dataPrecio);
                            setDeshabilitarPrecio(true);
                            setMenuConfirmarBorradoPrecio(false)
                        }} color="primary">
                            Borrar
                        </Button>
                    </DialogActions>
                </Dialog>
                <EditableTd disabled={deshabilitarPrecio} className="precio" value={props.dataPrecio.precio} onUpdate={value=>{
                    props.dataPrecio.precio=value;
                    if(!props.dataPrecio.tipoPrecio && props.dataPrecio.precio){
                        props.dataPrecio.tipoPrecio=tipoPrecioPredeterminado.tipoPrecio;
                    }
                    props.onUpdate(props.dataPrecio);
                    if(precioRef.current!=null){
                        precioRef.current.blur()
                    }
                }} ref={precioRef}/>
            </tr>
            {props.dataPrecio.atributos.map((atributo,index)=>
                <AtributosRow key={index}
                    dataAtributo={atributo}
                    primerAtributo={index==0}
                    cambio={props.dataPrecio.cambio}
                    habilitarCopiado={habilitarCopiado}
                    deshabilitarAtributo={deshabilitarPrecio}
                    cantidadAtributos={props.dataPrecio.atributos.length}
                    ultimoAtributo={index == props.dataPrecio.atributos.length-1}
                    onUpdate={(modifAtributo)=>{
                        props.dataPrecio.atributos.splice(index,1,modifAtributo);
                        props.onUpdate(props.dataPrecio);
                        
                    }}
                    onCopiarAtributos={()=>{
                        if(habilitarCopiado){
                            props.dataPrecio.atributos.forEach((atrib)=>
                                atrib.valor = atrib.valorAnterior
                            )
                            props.dataPrecio.cambio='=';
                            if(!props.dataPrecio.precio && precioRef.current){
                                precioRef.current.focus();
                            }
                            props.dataPrecio.tipoPrecio=tipoPrecioPredeterminado.tipoPrecio;
                            props.onUpdate(props.dataPrecio);
                        }
                    }}
                    onMarcarCambio={()=>{
                        let atributosIguales = props.dataPrecio.atributos.filter((atrib)=>
                            atrib.valorAnterior == atrib.valor
                        );
                        props.dataPrecio.cambio=(atributosIguales.length == props.dataPrecio.atributos.length)?'=':'C';
                        props.onUpdate(props.dataPrecio);
                    }}
                    onWantToMoveForward={()=>{
                        if(index<props.dataPrecio.atributos.length-1){
                            var nextItemRef=atributosRef.current[index+1];
                            if(nextItemRef.current!=null){
                                nextItemRef.current.focus()
                                return true;
                            }
                        }else{
                            if(!props.dataPrecio.precio){
                                if(precioRef.current){
                                    precioRef.current.focus();
                                    return true;
                                }
                            }
                        }
                        return false;
                    }}
                    ref={atributosRef.current[index]}
                />
            )}
        </tbody>
    );
}

export function PruebaRelevamientoPrecios(){
    const [dataPrecios, setDataPrecios] = useState(dataPreciosInicial);
    const ref = useRef<HTMLTableElement>(null);
    useEffect(()=>{
        if(ref.current){
            var thInThead=ref.current.querySelectorAll('thead th');
            var minReducer = (min:number, th:HTMLElement)=>Math.min(min, th.offsetTop);
            // @ts-ignore
            var minTop = Array.prototype.reduce.call(thInThead, minReducer, Number.MAX_VALUE)
            Array.prototype.map.call(thInThead,(th:HTMLElement)=>{
                th.style.top = th.offsetTop - minTop + 'px'
            })
        }
    })
    return (
        <table className="formulario-precios" ref={ref}>
            <caption>Formulario X</caption>
            <thead>
                <tr>
                    <th rowSpan={2}>producto<br/>especificación</th>
                    <th rowSpan={2}>obs.<br/>atributos</th>
                    <th colSpan={2}>anterior</th>
                    <th rowSpan={2} className="flechaTitulos"></th>
                    <th colSpan={2}>actual</th>
                </tr>
                <tr>
                    <th>TP</th>
                    <th>precio</th>
                    <th>TP</th>
                    <th>precio</th>
                </tr>
            </thead>
            {dataPrecios.map((dataPrecio,index) =>
                <PreciosRow key={index} dataPrecio={dataPrecio} onUpdate={
                    (updatedPrecio)=>setDataPrecios([...dataPrecios.slice(0,index), updatedPrecio, ...dataPrecios.slice(index+1)])
                }></PreciosRow>
            )}
        </table>
    );
}