import * as React from "react";
import {useState, useRef} from "react";
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
        ]
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
        ]
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
        ]
    },
];

var dataPreciosInicial=dataPreciosInicialCorto;

while(dataPreciosInicial.length<100){
    dataPreciosInicial.push(changing(dataPreciosInicialCorto[Math.floor(Math.random()*3)],{}));
}

type OnUpdate<T> = (data:T)=>void

function InputText(props:{value:string, onUpdate:OnUpdate<string>, onFocusOut:()=>void}){
    const esto = useRef(null);
    return (
        <input ref={esto} value={props.value} onBlur={(event)=>{
            props.onUpdate(event.target.value);
            props.onFocusOut();
        }} onMouseOut={()=>{
            if(document.activeElement!=esto.current){
                props.onFocusOut();
            }
        }}/>
    )
}

function EditableTd(props:{colSpan?:number, rowSpan?:number, className?:string, value:string, onUpdate:OnUpdate<string>}){
    const [editando, setEditando] = useState(false);
    return (
        <td colSpan={props.colSpan} rowSpan={props.rowSpan} className={props.className} onClick={
            ()=>setEditando(true)
        }>
            {editando?
                <InputText value={props.value} onUpdate={value =>{
                    props.onUpdate(value);
                }} onFocusOut={()=>{
                    setEditando(false);
                }}/>
            :props.value}
        </td>
    )
}

function AtributosRow(props:{dataAtributo:DataAtributo, primerAtributo:boolean, cantidadAtributos:number, onUpdate:(modifAtributo:DataAtributo)=>void}){
    const atributo = props.dataAtributo;
    return (
        <tr>
            <td>{atributo.atributo}</td>
            <td colSpan={2} className="atributo-anterior" >{atributo.valorAnterior}</td>
            {props.primerAtributo?<td rowSpan={props.cantidadAtributos} className="flechaAtributos">→</td>:null}
            <EditableTd colSpan={2} className="atributo-actual" value={atributo.valor} onUpdate={value=>{
                atributo.valor=value;
                props.onUpdate(atributo);
            }}/>
        </tr>
    )
}

function PreciosRow(props:{dataPrecio:DataPrecio, onUpdate:(dataPrecio:DataPrecio)=>void}){
    return (
        <tbody>
            <tr>
                <td rowSpan={props.dataPrecio.atributos.length + 1}>
                    <div className="producto">{props.dataPrecio.producto}</div>
                    <div className="especificacion">{props.dataPrecio.especificacion}</div>
                </td>
                <td className="observaiones"><button>Obs.</button></td>
                <td className="tipoPrecioAnterior">{props.dataPrecio.tipoPrecioAnterior}</td>
                <td data-type="number" className="precioAnterior">{props.dataPrecio.precioAnterior}</td>
                { props.dataPrecio.tipoPrecio==null && props.dataPrecio.tipoPrecioAnterior!=null ?
                    <td className="flechaTP" onClick={ () => {
                        props.dataPrecio.tipoPrecio = props.dataPrecio.tipoPrecioAnterior;
                        props.onUpdate(props.dataPrecio);
                    }}>→</td>
                    :<td className="flechaTP"></td>
                }
                <td className="tipoPrecio">{props.dataPrecio.tipoPrecio}</td>
                <td data-type="number" className="precio">{props.dataPrecio.precio}</td>
            </tr>
            {props.dataPrecio.atributos.map((atributo,index)=>
                <AtributosRow key={index}
                    dataAtributo={atributo}
                    primerAtributo={index==0}
                    cantidadAtributos={props.dataPrecio.atributos.length}
                    onUpdate={(modifAtributo)=>{
                        props.dataPrecio.atributos.splice(index,1,modifAtributo);
                        props.onUpdate(props.dataPrecio);
                    }}
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
                    (updatedPrecio)=>setDataPrecios(dataPrecios.slice(0,index).concat([updatedPrecio]).concat(dataPrecios.slice(index+1)))
                }></PreciosRow>
            )}
        </table>
    );
}