import * as React from "react";
import {useState} from "react";
import * as likeAr from "like-ar";

type DataPrecio = {
    producto:string, 
    especificacion:string, 
    tipoPrecioAnterior:string|null, 
    tipoPrecio:string|null, 
    precio:number|null,
    precioAnterior:number|null,
}

var dataPreciosInicial:DataPrecio[] = [
    {
        producto:'Lata de tomate',
        especificacion:'Lata de tomate perita enteros pelado de 120 a 140g neto',
        tipoPrecioAnterior:'P',
        precioAnterior:120,
        tipoPrecio:null,
        precio:null,
    },
    {
        producto:'Lata de arvejas',
        especificacion:'Lata de arvejas peladas de 120 a 140g neto',
        tipoPrecioAnterior:'P',
        precioAnterior:140,
        tipoPrecio:null,
        precio:null,
    },
    {
        producto:'Yerba',
        especificacion:'Paquete de yerba con palo en envase de papel de 500g',
        tipoPrecioAnterior:'S',
        precioAnterior:null,
        tipoPrecio:null,
        precio:null,
    },
]

function PreciosRow(props:{dataPrecio:DataPrecio}){
    return (
        <tr>
            <td>
                <div className="producto">{props.dataPrecio.producto}</div>
                <div className="especificacion">{props.dataPrecio.especificacion}</div>
            </td>
            <td className="tipoPrecioAnterior">{props.dataPrecio.tipoPrecioAnterior}</td>
            <td data-type="number" className="precioAnterior">{props.dataPrecio.precioAnterior}</td>
            <td className="tipoPrecio">{props.dataPrecio.tipoPrecio}</td>
            <td data-type="number" className="precio">{props.dataPrecio.precio}</td>
        </tr>
    );
}

export function PruebaRelevamientoPrecios(){
    const [dataPrecios, setDataPrecios] = useState(dataPreciosInicial);
    return (
        <table className="formulario-precios">
            <caption>Formulario X</caption>
            <thead>
                <tr>
                    <th rowSpan={2}>producto/especificación</th>
                    <th colSpan={2}>anterior</th>
                    <th colSpan={2}>actual</th>
                </tr>
                <tr>
                    <th>TP</th>
                    <th>precio</th>
                    <th>TP</th>
                    <th>precio</th>
                </tr>
            </thead>
            <tbody>
                {dataPrecios.map((dataPrecio,index) =>
                    <PreciosRow key={index} dataPrecio={dataPrecio}></PreciosRow>
                )}
            </tbody>
        </table>
    );
}