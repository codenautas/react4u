import * as React from "react";
import {useState, useRef, useEffect, useImperativeHandle, createRef, forwardRef} from "react";
import {isPlainObject} from "best-globals";
import * as likeAr from "like-ar";

function JsonDiplayer(props:{json:string}):JSX.Element;
function JsonDiplayer(props:{object:any}):JSX.Element;
function JsonDiplayer(props:{json?:string, object?:any}){
    try{
        var data=props.object||JSON.parse(props.json||'null');
        return <div className="json-displayer"><ObjectDisplayer data={data} depth={1} opts={{showDepth:2}}></ObjectDisplayer></div>;
    }catch(err){
        return <div style={{color:"red"}} >{err.message}</div>
    }
}

namespace ObjectDisplayer{
    export type Opts={
        showDepth: number
    }
}
function ObjectDisplayer(props:{data:any, depth:number, opts:ObjectDisplayer.Opts}){
    var {data, depth, opts}=props;
    const [keys, setKeys] = useState(data instanceof Array && isPlainObject(data[0])?Object.keys(data[0]):[]);
    const [visible, setVisible] = useState(depth<=opts.showDepth);
    if(data && typeof data === "object"){
        if(data.__proto__.toReact){
            return data.toReact();
        }else if(data instanceof Array){
            if(data.length && isPlainObject(data[0])){
                var keyCount = keys.length;
                // @ts-ignore
                var keyIndex:{[key:string]:number} = likeAr(keys).build((k:string, i:string)=>{return {[k]:Number(i)}}).plain();
                var result = (
                    <table>
                        <thead>
                            <tr>
                                <th className="margin" onClick={()=>setVisible(!visible)}>{visible?"⊟":"⊞"}</th>
                                { visible ? keys.map((k:string)=><th key={k}>{k}</th>) : <td className="table-count">{data.length} <small>(×{keys.length})</small></td> }
                            </tr>
                        </thead>
                        <tbody style={{display:visible?'':'none'}}>
                            {data.map((row,i)=>{
                                var content;
                                if(row && typeof row == "object"){
                                    content = keys.map((k)=>
                                        <td key={k}><ObjectDisplayer data={row[k]} depth={depth+1} opts={opts}></ObjectDisplayer></td>
                                    );
                                    // @ts-ignore debería darse cuenta que row es Object
                                    likeAr(row).forEach((_:any, k:string)=>{
                                        var i = keyIndex[k];
                                        if(i == null){
                                            keys.push(k);
                                            keyIndex[k]=keys.length;
                                        }
                                    });
                                }else{
                                    content = <td colSpan={keyCount}><ObjectDisplayer data={row} depth={depth+1} opts={opts}></ObjectDisplayer></td>;
                                }
                                return <tr key={i}>
                                    <td className="margin"></td>
                                    {content}
                                </tr>;
                            })}
                        </tbody>
                    </table>
                );
                if(keys.length != keyCount){
                    setTimeout(function(){
                        setKeys(keys.slice());
                    },10)
                }
                return result;
            }
            return <div>
                {data.map((v:any)=><ObjectDisplayer data={v} depth={depth+1} opts={opts}></ObjectDisplayer>)}
            </div>;
        }else if(data instanceof RegExp){
            return <span datatype={data.constructor.name}>/{data.source}/{data.flags}</span>;
        }else if(data instanceof Date){
            return <span datatype={data.constructor.name}>{data.toLocaleString()}</span>;
        }else{
            var object:{} = data;
            return (
                <table>
                    <caption>{data.constructor.name=='Object'?null:data.constructor.name||''}</caption>
                    <thead>
                        <tr>{likeAr(object).map((_,k:string)=><th key={k}>{k}</th>).array()}</tr>
                    </thead>
                    <tbody>
                        <tr>{likeAr(object).map((v,k:string)=><td key={k}><ObjectDisplayer data={v} depth={depth+1} opts={opts}></ObjectDisplayer></td>).array()}</tr>
                    </tbody>
                </table>
            )
        }
    }else if(typeof props.data === "string"){
        return <span datatype="string">{props.data}</span>
    }else{
        return <span datatype={typeof props.data}>{JSON.stringify(props.data)}</span>
    }
}

class FactoresPrimos{
    toReact(){
        return (
            <span>
                {likeAr(this).map((exp,div,_,i)=>
                    <span>{i?<span> × </span>:null}{div}{
                        // @ts-ignore
                        exp>1?<sup>{exp}</sup>:null
                    }</span>
                ).array()}
            </span>
        );
    }
}

function listaPrimos(){
    var lista:{numero:number, primo:boolean, factores_primos:FactoresPrimos}[]=[];
    var i=0;
    var sqrt=2;
    var sqrtSquare=4;
    while(++i<=1000){
        var ii=i;
        var j=1;
        var primo=i>1;
        // @ts-ignore
        var factores_primos:{[key:number]:number}=new FactoresPrimos();
        while(++j<sqrtSquare && j<i){
            while(ii%j==0){
                primo=false;
                ii=ii/j
                factores_primos[j]=(factores_primos[j]||0)+1
            }
        }
        if(primo){
            factores_primos[i]=1;
        }
        lista.push({
            numero:i,
            primo,
            // @ts-ignore
            factores_primos
        })
        if(i==sqrtSquare){
            sqrtSquare+=sqrt;
            sqrt++;
            sqrtSquare+=sqrt;
        }
    }
    return lista;
}

export function RenderDirectJsonApp(){
    var objetoInicial={este:'objeto', aquel:1, lista:[
        {nombre:'Aaron'   , edad:23},
        {nombre:'Abel'    , edad:31},
        {edad:34, nombre:'Aciago'  },
        null,
        "this row isn't a row",
        {nombre:'Adela'   , edad:38, title:'Dr.'},
        {nombre:'AEmilius', edad:50, title:'Mr.'},
        {nombre:'Afrodita', edad:19, nacimiento:new Date(2001,12,23,10,2,32), ok:true, filtro:/ok(!?)(\/\d+)*$/g},
        {nombre:'Agata'   , edad:55, title:[
            {title:'Lic.', year:1990},
            {title:'Mag.', year:1995},
            {title:'Dr.' , year:1999, especialidad:listaPrimos()},
        ]},
        ["one", "two", "three"],
    ]};
    // var [content, setContent] = useState(JSON.stringify(objetoInicial));
    var content = objetoInicial;
    return (
        <div>
            <div>Visualizador de Json</div>
            {/*
            <input type='text' value={content} onChange={
                (event)=>{ setContent(event.target.value); }
            }/>
            */}
            <JsonDiplayer object={content}></JsonDiplayer>
        </div>
    );
}
