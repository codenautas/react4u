import * as React from "react";
import {useState, useRef, useEffect, useImperativeHandle, createRef, forwardRef} from "react";
import {changing} from "best-globals";
import * as likeAr from "like-ar";

type DataAtributo = {
    atributo:string,
    valorAnterior:string,
    valor:string
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
        tipoPrecio:null,
        precio:null,
        atributos:[
            {atributo:'Marca', valorAnterior:'Unión', valor:null},
            {atributo:'Variante', valorAnterior:'Suave sin palo', valor:null},
            {atributo:'Gramaje', valorAnterior:'500', valor:null}
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

var dataPreciosInicial=[...dataPreciosInicialCorto];

while(dataPreciosInicial.length<100){
    dataPreciosInicial.push(changing(dataPreciosInicialCorto[Math.floor(Math.random()*dataPreciosInicialCorto.length)],{}));
}

type OnUpdate<T> = (data:T)=>void

function TypedInput<T>(props:{
    value:T, 
    onUpdate:OnUpdate<T>, 
    onFocusOut:()=>void, 
    onWantToMoveForward?:()=>void
}){
    var [value, setValue] = useState(props.value);
    const inputRef = useRef(null);
    useEffect(() => {
        inputRef.current.focus();
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
        }} onKeyPress={event=>{
            var tecla = event.charCode || event.which;
            if((tecla==13 || tecla==9) && !event.altKey && !event.ctrlKey && !event.metaKey && !event.shiftKey){
                if(props.onWantToMoveForward){
                    props.onWantToMoveForward();
                    event.preventDefault();
                }
            }
        }}/>
    )
}

const EditableTd = forwardRef(function<T extends any>(props:{
    value:T, 
    className?:string, colSpan?:number, rowSpan?:number, 
    onUpdate:OnUpdate<T>, 
    onWantToMoveForward?:()=>void
},
    ref:React.Ref<any>
){
    const [editando, setEditando] = useState(false);
    useImperativeHandle(ref, () => ({
        focus: () => {
            setEditando(true)
        },
        unfocus: () => {
            setEditando(false)
        }
    }));    
    return (
        <td colSpan={props.colSpan} rowSpan={props.rowSpan} className={props.className} onClick={
            ()=>setEditando(true)
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
    onUpdate:OnUpdate<DataAtributo>, 
    onCopiarAtributos:()=>void,
    onMarcarCambio:()=>void,
    onWantToMoveForward?:()=>void},
    ref:React.Ref<any>
){
    const atributo = props.dataAtributo;
    return (
        <tr>
            <td>{atributo.atributo}</td>
            <td colSpan={2} className="atributo-anterior" >{atributo.valorAnterior}</td>
            {props.primerAtributo?
                <td rowSpan={props.cantidadAtributos} className="flechaAtributos" onClick={ () => {
                    props.onCopiarAtributos()
                }}>{props.cambio==null?'→':props.cambio}</td>
                :null}
            <EditableTd colSpan={2} className="atributo-actual" value={atributo.valor} onUpdate={value=>{
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
    const precioRef = useRef(null);
    const atributosRef = useRef(props.dataPrecio.atributos.map(() => createRef()));
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
                { props.dataPrecio.tipoPrecio==null && props.dataPrecio.tipoPrecioAnterior!=null ?
                    <td className="flechaTP" onClick={ () => {
                        props.dataPrecio.tipoPrecio = props.dataPrecio.tipoPrecioAnterior;
                        props.onUpdate(props.dataPrecio);
                    }}>→</td>
                    :<td className="flechaTP"></td>
                }
                <td className="tipoPrecio">{props.dataPrecio.tipoPrecio}</td>
                <EditableTd className="precio" value={props.dataPrecio.precio} onUpdate={value=>{
                    props.dataPrecio.precio=value;
                    if(!props.dataPrecio.tipoPrecio && props.dataPrecio.precio){
                        props.dataPrecio.tipoPrecio='P';
                    }
                    props.onUpdate(props.dataPrecio);
                    /* TODO setEditandoPrecio(false) */
                    precioRef.current.unfocus()
                }} ref={precioRef}/>
            </tr>
            {props.dataPrecio.atributos.map((atributo,index)=>
                <AtributosRow key={index}
                    dataAtributo={atributo}
                    primerAtributo={index==0}
                    cambio={props.dataPrecio.cambio}
                    cantidadAtributos={props.dataPrecio.atributos.length}
                    onUpdate={(modifAtributo)=>{
                        props.dataPrecio.atributos.splice(index,1,modifAtributo);
                        props.onUpdate(props.dataPrecio);
                        
                    }}
                    onCopiarAtributos={()=>{
                        if(props.dataPrecio.cambio==null){
                            props.dataPrecio.atributos.forEach((atrib)=>
                                atrib.valor = atrib.valorAnterior
                            )
                            props.dataPrecio.cambio='=';
                            if(!props.dataPrecio.precio){
                                precioRef.current.focus();
                            }
                            props.onUpdate(props.dataPrecio);
                        }
                    }}
                    onMarcarCambio={()=>{
                        let atributosIguales = props.dataPrecio.atributos.filter((atrib)=>
                            atrib.valorAnterior == atrib.valor
                        );
                        props.dataPrecio.cambio=(atributosIguales.length == props.dataPrecio.atributos.length)?'=':'C';
                    }}
                    onWantToMoveForward={()=>{
                        if(index<props.dataPrecio.atributos.length){
                            atributosRef.current[index+1].current.focus()
                        }else{
                            atributosRef.current[index].current.unfocus()
                        }
                    }}
                    ref={atributosRef.current[index]}
                />
            )}
        </tbody>
    );
}

export function PruebaRelevamientoPrecios(){
    const [dataPrecios, setDataPrecios] = useState(dataPreciosInicial);
    return (
        <table className="formulario-precios">
            <caption>Formulario X</caption>
            <thead>
                <tr>
                    <th rowSpan={2}>producto<br/>especificación</th>
                    <th rowSpan={2}>obs.<br/>atributos</th>
                    <th colSpan={2}>anterior</th>
                    <td rowSpan={2} className="flechaTitulos"></td>
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