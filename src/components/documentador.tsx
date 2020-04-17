import * as likeAr from "like-ar";
import * as React from "react";

import { createReducer, createDispatchers, ActionsFrom } from "redux-typed-reducer";
import {
    Button, Checkbox, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, 
    Grid,
    MenuItem,
    Select, Switch
} from '@material-ui/core';
import { createStore } from "redux";
import { Provider, useDispatch, useSelector } from "react-redux"; 
import { withStyles } from '@material-ui/core/styles';

export interface ModoVisualizacion{
    nombre:string
    descripcion:string
    mostrarTodo?:boolean
    opcionPositiva?:string
    opcionNegativa?:string
}

export type EstadoDocBase<MV extends number>={
    mostrarTodo:boolean
    modos:{[k in MV]:boolean}
}
export const BiColorSwitch = withStyles({
    switchBase: {
        color: '#3f51b5',
        //'&$checked': {
        //    color: 'violet',
        //},
        //'&$checked + $track': {
        //    backgroundColor: 'yellow',
        //},
    },
    // checked: {},
    // track: {},
})(Switch);

const keywordStyles={
    _:{
        color:'#88F'
    },
    $:{
        color:'#88F'
    },
    sudo:{
        color:'red'
    },
    nombre_instancia:{
        color:'violet',
        fontStyle: 'italic'
    },
    "nombre_instancia\\w*":{
        color:'violet',
        fontStyle: 'italic'
    }
};

// @ts-ignore Object.keys tiene que saber el tipo
const keywords:(keyof typeof keywordStyles)[]=Object.keys(keywordStyles);
const keywordsRegExp = new RegExp(`((?:\\$\\w+|\\b(?:${keywords.join('|')}))\\b)`,'g')

export function GeneradorEtiquetasIntervenidas<MV extends number,EstadoDoc extends EstadoDocBase<MV>>(ModosVisualizacion:{[k in MV]:ModoVisualizacion}){
    function CrearDivConClase(attrs:{nombre:string}){
        return function (props:{children:React.ReactNode, para?:MV[]|MV}){
            const { mostrarTodo, modos } = useSelector((estado:EstadoDoc)=>estado);
            const para = props.para == undefined ? undefined : props.para instanceof Array ? props.para : [props.para];
            const paraEste = para==undefined || para.find(modo=>modos[modo]);
            return mostrarTodo || paraEste?
                <div className={attrs.nombre} doc-oscurecer={paraEste?"no":"si"}>
                    {para && mostrarTodo?
                        <div className='solo-para'><span className='etiqueta-colgante'>
                            solo para:
                            {para.map((mv:MV,i)=><span key={mv} para-este={modos[mv]?"si":"no"}>{i?',':''} {ModosVisualizacion[mv].nombre}</span>)}
                        </span></div>
                    :null}
                    {props.children}
                </div>
            :null;
        }
    }
    function Coso(props:{coso:string}){
        // @ts-ignore el tipo de kye está bien porque props.show in styles
        var key:keyof typeof keywordStyles=props.coso in keywordStyles?props.coso:props.coso.startsWith('$')?'$':'_';
        return <span style={keywordStyles[key]}>{props.coso}</span>
    }
    const Aclaracion = CrearDivConClase({nombre:'aclaracion'});
    const Seccion    = CrearDivConClase({nombre:'seccion'});
    const Para       = CrearDivConClase({nombre:'para'});
    const Titulo     = CrearDivConClase({nombre:'titulo'});
    function Comandos(props:{children:React.ReactNode, className?:string}){
        var margen:RegExp|null=null;
        var lang:string|null=null;
        var classLine='linea'; 
        return <div className={props.className||'comandos'}>
            {(props.children instanceof Array?props.children:[props.children]).map((node,inode)=>{
                if(typeof node == "string"){
                    if(margen==null){
                        node.replace(/[\u00ad↵]([ ]*)(\S|$)/,function(_,espacios){
                            margen = new RegExp('^ {0,'+espacios.length+'}');
                            return '';
                        })
                    }
                    var lineas=node.split(/(\u00ad|↵|\r?\n)/).map(
                        (s,i)=>i%2?'\r\n':(i && margen?s.replace(margen,''):s)
                    );
                    return ([] as (string|JSX.Element)[]).concat(
                        ...lineas.slice(inode || !/^\s*$/.test(lineas[0])?0:2).map(function(line,iLine){
                            var parts = line.split(keywordsRegExp);
                            var domParts = parts.map((part, i)=>i%2?<Coso key={'coso-'+iLine+'-'+inode+'-'+i} x-key={'coso-'+iLine+'-'+inode+'-'+i} coso={part}/>:part);
                            if(iLine){
                                classLine=typeof domParts[0] == "string" && /^\s*#/.test(domParts[0])?'linea-comentario':'linea';
                            }
                            return <span key={'coso-'+iLine+'-'+inode} x-key={'coso-'+iLine+'-'+inode} className={classLine}>{domParts}</span>;
                        })
                    );
                }else{
                    return node;
                }
            })}
        </div>
    }
    function Contenido(props:{children:React.ReactNode}){
        return Comandos({...props, className:'contenido'});
    }
    function Codigo(props:{children:React.ReactNode}){
        return Comandos({...props, className:'codigo'});
    }
    const handleChange = <T extends any>(stateSetter:React.Dispatch<React.SetStateAction<T>>) => 
        (event: React.ChangeEvent<{ checked?:unknown, value: unknown }>) => {
            stateSetter(('checked' in event.target?event.target.checked:event.target.value) as T);
        }
    function LineaDeOpcion(props:{
        modo:ModoVisualizacion, 
        checked:boolean,
        onChange:(element:HTMLInputElement)=>void,
        colorAlMostrarTodo?:'primary'
    }){
        const { mostrarTodo } = useSelector((estado:EstadoDoc)=>estado);
        const {modo, checked} = props;
        return (
            <label className="linea-opcion">
                <div className="linea-opcion-principal">
                    <Checkbox
                        color={mostrarTodo?props.colorAlMostrarTodo||"secondary":"primary"}
                        checked={checked}
                        onChange={function(event:React.ChangeEvent<HTMLInputElement>){
                            props.onChange(event.target);
                        }}
                        inputProps={{ 'aria-label': 'primary checkbox' }}
                    />
                    {modo.nombre}
                </div>
                <div className="linea-opcion-secundaria">
                    {modo.descripcion}
                </div>
            </label>
        );
    }
    function LineaDeSlide(props:{
        modo:{nombre:string, false:string, true:string}, 
        checked:boolean,
        onChange:(element:HTMLInputElement)=>void
    }){
        return <div>
            <Grid className='linea-opcion-principal' component="label" container alignItems="center" spacing={1}>
                <Grid item>{props.modo.nombre}: </Grid>
                <Grid item> {props.modo.false} </Grid>
                <Grid item>
                    <BiColorSwitch 
                        checked={props.checked} 
                        onChange={function(event:React.ChangeEvent<HTMLInputElement>){
                            props.onChange(event.target);
                        }} 
                    />
                </Grid>
                <Grid item> {props.modo.true} </Grid>
            </Grid>
        </div>

    }
    function Equivale(props:{children:React.ReactNode}){
        const { mostrarTodo } = useSelector((estado:EstadoDoc)=>estado);
        var [oscurecer, setOscurecer] = React.useState(true);
        return <div className="equivale" doc-oscurecer={oscurecer?'si':'no'}>
            <div className="equivale-titulo"
                onClick={()=>setOscurecer(!oscurecer)}
            >🛈 para verificar</div>
            {!oscurecer || mostrarTodo?
                <div className="equivale-cuerpo">
                    {props.children}
                </div>
            :null}
        </div>
    }
    return {
        /*CrearDivConClase,*/Aclaracion,Seccion,Para,Titulo,
        Comandos,Contenido,Codigo,
        handleChange,
        LineaDeOpcion,
        LineaDeSlide,
        Equivale
    }
}
