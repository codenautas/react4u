import * as React from "react";
import {useState} from "react";

export function SaludoInicial(props:{mensaje:string, appName:string}){
    return (
        <div>
            <span style={{fontSize:'120%'}}>{props.mensaje}</span>
            <span style={{fontSize:'80%'}}> ({props.appName})</span>
        </div>
    );
}