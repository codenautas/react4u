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
import { BiColorSwitch, EstadoDocBase, ModoVisualizacion, GeneradorEtiquetasIntervenidas } from "./documentador";

enum MV {
    DEPLOY_INICIAL = 101, 
    ACTUALIZACION, 
    CAMBIO_CONFIG
};

const ModosVisualizacion:{[k in MV]:ModoVisualizacion} = {
    [MV.DEPLOY_INICIAL]:{
        nombre:'deploy inicial', 
        descripcion:`se instala una aplicación por primera vez`
    },
    [MV.ACTUALIZACION]:{
        nombre:'actualización de versión', 
        descripcion:`de una aplicación ya instalada con este documento (o una versión anterior de este)`
    },
    [MV.CAMBIO_CONFIG]:{
        nombre:'cambio de configuración', 
        descripcion:`de la instancia, el puerto, la dirección URL, la ubicación o nombre de la base de datos, etc...`
    }
};

type EstadoDoc = EstadoDocBase<MV> & {
    modos:{[k in MV ]:boolean},
    privateRepo:boolean,
    conServidorDb:boolean,
    mostrarTodo:boolean
}

var reducers={
    SET_PRIVATE: (payload: {privateRepo:boolean}) => 
        function(estado: EstadoDoc){
            return {
                ...estado,
                privateRepo: payload.privateRepo
            }
        },
    SET_CONSERVIDORDB: (payload: {conServidorDb:boolean}) => 
        function(estado: EstadoDoc){
            return {
                ...estado,
                conServidorDb: payload.conServidorDb
            }
        },
    SET_MOSTRARTODO: (payload: {mostrarTodo:boolean}) => 
        function(estado: EstadoDoc){
            return {
                ...estado,
                mostrarTodo: payload.mostrarTodo
            }
        },
    SET_MODE: (payload: {modo:MV, value:boolean}) => 
        function(estado: EstadoDoc){
            /*
            return {
                ...estado,
                modos: {
                    ...estado.modos,
                    [payload.modo]:payload.value
                }
            };
            */
            var modosNuevos={
                ...estado.modos,
                [payload.modo]:payload.value
            }
            if(payload.value){
                if(payload.modo==MV.DEPLOY_INICIAL){
                    modosNuevos[MV.CAMBIO_CONFIG]=false;
                    modosNuevos[MV.ACTUALIZACION]=false;
                }else{
                    modosNuevos[MV.DEPLOY_INICIAL]=false;
                }
            }
            return {
                ...estado,
                modos: {...modosNuevos}
            }
        },
}

const docReducer = createReducer(reducers, {
    mostrarTodo:true,
    modos:likeAr(ModosVisualizacion).map(modo=>false).plain(),
    privateRepo:true,
    conServidorDb:true
});
const store = createStore(docReducer/*, loadState()*/); 
const dispatchers = createDispatchers(reducers);

const { 
    Aclaracion,Seccion,Para,Titulo,
    Comandos,Contenido,Codigo,
    handleChange,
    LineaDeOpcion,
    LineaDeSlide,
    Equivale
} = GeneradorEtiquetasIntervenidas(ModosVisualizacion);

function ModoVisualizacionDocumento(){
    const { privateRepo, conServidorDb, modos, mostrarTodo } = useSelector((estado:EstadoDoc)=>estado);
    const dispatch = useDispatch();
    return <Seccion>
        <Titulo>
            Modo de visualización de este documento
        </Titulo>
        <LineaDeOpcion
            modo={{
                nombre:'revisión del documento', 
                descripcion:`todas las secciones son visibles`,
            }}
            checked={mostrarTodo} 
            onChange={function(target:HTMLInputElement){
                dispatch(dispatchers.SET_MOSTRARTODO({mostrarTodo:target.checked}))
            }}
            colorAlMostrarTodo='primary'
        />
        <Titulo>
            Tareas a realizar
        </Titulo>
        {likeAr(ModosVisualizacion).map((modo,k)=>
            <LineaDeOpcion 
                modo={modo} key={k} checked={modos[k]} 
                onChange={function(target:HTMLInputElement){
                    dispatch(dispatchers.SET_MODE({modo:k, value:target.checked}))
                }}
            />
        ).array()}
        <LineaDeSlide
            modo={{
                nombre:'Repositorio',
                false:'público',
                true:'privado'
            }}
            checked={privateRepo} 
            onChange={function(element:HTMLInputElement){
                dispatch(dispatchers.SET_PRIVATE({privateRepo:element.checked}))
            }} 
        />
        <LineaDeSlide
            modo={{
                nombre:'Base de datos',
                false:'local',
                true:'en otro servidor'
            }}
            checked={conServidorDb} 
            onChange={function(element:HTMLInputElement){
                dispatch(dispatchers.SET_CONSERVIDORDB({conServidorDb:element.checked}))
            }} 
        />
    </Seccion>
}

export function UsuariosAdministradores(){
    return <Seccion para={MV.DEPLOY_INICIAL}>
        <Titulo>Instalación de un servidor para Codenautas</Titulo>
    </Seccion>
}

function Pie(){
    return <div className="pie"></div>
}

export function OperacionesServidor(){
    return <div className="doc-operaciones">
        <Provider store={store}>
            <h1>Usuarios administradores</h1>
            <ModoVisualizacionDocumento/>
            <UsuariosAdministradores/>
        </Provider>
        <Pie/>
    </div>
}