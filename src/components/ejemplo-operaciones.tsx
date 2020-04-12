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

enum MV {
    REVISION, 
    DEPLOY_INICIAL, 
    ACTUALIZACION, 
    CAMBIO_CONFIG
};

type ModoVisualizacion={
    nombre:string
    descripcion:string
    mostrarTodo?:boolean
}
const ModosVisualizacion:{[k in MV]:ModoVisualizacion} = {
    [MV.REVISION]:{
        nombre:'revisión del documento', 
        descripcion:`todas las secciones están igual de iluminadas, 
            eligiendo otros modos se pueden destacar las secciones según la operación que se desea`,
        mostrarTodo:true
    },
    [MV.DEPLOY_INICIAL]:{
        nombre:'deploy inicial', 
        descripcion:`se instala una aplicación por primera vez`
    },
    [MV.ACTUALIZACION]:{
        nombre:'actualización de versión', 
        descripcion:`se actualiza la versión de una aplicación ya instalada`
    },
    [MV.CAMBIO_CONFIG]:{
        nombre:'cambio de configuración', 
        descripcion:`se cambia la configuración de la instancia, el puerto, la dirección URL, la ubicación o nombre de la base de datos, etc...`
    }
};

type EstadoDoc = {
    modos:{[k in MV ]:boolean},
    privateRepo:boolean,
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
    SET_MODE: (payload: {modo:MV, value:boolean}) => 
        function(estado: EstadoDoc){
            return {
                ...estado,
                modos: {
                    ...estado.modos,
                    [payload.modo]:payload.value
                }
            }
        },
}

const docReducer = createReducer(reducers, {
    modos:{}
});
const store = createStore(docReducer/*, loadState()*/); 
const dispatchers = createDispatchers(reducers);

function CrearDivConClase(attrs:{nombre:string}){
    return function (props:{children:React.ReactNode, para?:MV[]|MV}){
        const { mostrarTodo, modos } = useSelector((estado:EstadoDoc)=>estado);
        const para = props.para == undefined ? undefined : props.para instanceof Array ? props.para : [props.para];
        return mostrarTodo || para==undefined || para.find(modo=>modos[modo])?
            <div className={attrs.nombre}>
                {para && mostrarTodo?
                    <div className='solo-para'><span className='etiqueta-colgante'>
                        solo para {para.length==1?`el modo`:`los modos`} de visualización:
                        {para.map((mv:MV,i)=><span key={mv}>{i?',':''} {ModosVisualizacion[mv].nombre} </span>)}
                    </span></div>
                :null}
                {props.children}
            </div>
        :null;
    }
}

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

// "algo $algo che sudo che$algo+${pepe}asdf cargo".split(/((?:\$\w+|\b(?:_|$|sudo|nombre_instancia|nombre_instancia\w*))\b)/g)

function Coso(props:{coso:string}){
    // @ts-ignore el tipo de kye está bien porque props.show in styles
    var key:keyof typeof keywordStyles=props.coso in keywordStyles?props.coso:props.coso.startsWith('$')?'$':'_';
    return <span style={keywordStyles[key]}>{props.coso}</span>
}

const Aclaracion = CrearDivConClase({nombre:'aclaracion'});
const Seccion    = CrearDivConClase({nombre:'seccion'});
const Titulo     = CrearDivConClase({nombre:'titulo'});
function Comandos(props:{children:React.ReactNode, className?:string}){
    var margen:RegExp|null=null;
    var lang:string|null=null;
    console.log(props.children)
    return <div className={props.className||'comandos'}>
        {(props.children instanceof Array?props.children:[props.children]).map((node,inode)=>{
            console.log(node)
            if(typeof node == "string"){
                if(margen==null){
                    node.replace(/\u00ad([ ]*)(\S|$)/,function(_,espacios){
                        margen = new RegExp('^ {0,'+espacios.length+'}');
                        return '';
                    })
                }
                var lineas=node.split(/(\u00ad|\r?\n)/).map(
                    (s,i)=>i%2?'\r\n':(i && margen?s.replace(margen,''):s)
                );
                return ([] as (string|JSX.Element)[]).concat(
                    ...lineas.slice(inode || !/^\s*$/.test(lineas[0])?0:2).map(function(part){
                        var parts = part.split(keywordsRegExp);
                        console.log(parts);
                        var domParts = parts.map((part, i)=>i%2?<Coso key={"coso-"+part+i} coso={part}/>:part);
                        console.log(domParts)
                        return domParts;
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

function ModoVisualizacionDocumento(){
    const { mostrarTodo, modos, privateRepo } = useSelector((estado:EstadoDoc)=>estado);
    const dispatch = useDispatch();
    const id="local-id-ModoVisualizacion-";
    return <Seccion>
        <Titulo>
            Modo de visualización de este documento
        </Titulo>
        {likeAr(ModosVisualizacion).map((modo,k)=>
            <div key={k}>
                <Checkbox
                    id={id+k}
                    checked={modos[k]}
                    onChange={function(event:React.ChangeEvent<HTMLInputElement>){
                        dispatch(dispatchers.SET_MODE({modo:k, value:event.target.checked}))
                    }}
                    inputProps={{ 'aria-label': 'primary checkbox' }}
                />
                <label htmlFor={id+k}>
                    <span className="principal"> {modo.nombre} </span>
                    <span className="aclaracion"> {modo.descripcion} </span>
                </label>
            </div>
        ).array()}
        <div>
            <span className="principal"> Repositorio </span>
            <Grid component="label" container alignItems="center" spacing={1}>
                <Grid item>público</Grid>
                <Grid item>
                    <Switch 
                        checked={privateRepo} 
                        onChange={function(event:React.ChangeEvent<HTMLInputElement>){
                            dispatch(dispatchers.SET_PRIVATE({privateRepo:event.target.checked}))
                        }} 
                    />
                </Grid>
                <Grid item>privado</Grid>
            </Grid>
        </div>
    </Seccion>
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

export function CreacionDelArchivoDeConfiguracion(){
    return <Seccion para={MV.DEPLOY_INICIAL}>
        <Titulo>Creación del archivo de configuración de la instancia</Titulo>
        <Comandos>
­            sudo ls -cal /opt/insts
­ 
­            sudo chown $USER -R /opt/bin/coderun
­
­            cd /opt/bin/coderun
­            git pull
­            # el cambio de permisos puede hacer figurar cambios, revertirlos con: git reset --hard HEAD
­
­            sudo chown $USER /opt/insts
­            . /opt/bin/coderun/script/prepare-inst.sh
        </Comandos>
        <Equivale>
            <Comandos>
­                sudo cat /opt/insts/nombre_instancia.yaml
            </Comandos>
­            <Contenido>
­                server:
­                  port: 3037
­                  base-url: /nombre_instancia_path
­                  session-store: memory
­                git:
­                  project: nombre_instancia
­                  group: codenautas
­                  host: https://github.com
­                db:
­                  database: nombre_instancia_db
­                  user: nombre_instancia_admin
­                  password: nombre_instancia_43342294333188asx
­                install:
­                  dump:
­                    db:
­                      owner: nombre_instancia_owner
            </Contenido>
        </Equivale>
        <Aclaracion>
            Aquí se creó un archivo llamado <Codigo>/opt/insts/nombre_instancia.yaml</Codigo>. 
            Todo lo que sigue se basa en leer el contenido de ese archivo de configuración.
        </Aclaracion>
    </Seccion>
}

export function LecturaDelArchivoDeConfiguracion(){
    return <Seccion>
        <Titulo>Lectura del archivo de configuración de la instancia</Titulo>
        <Aclaracion>
            El mantenimiento o el resto de la instalación se basan en leer la configuración del yaml. 
        </Aclaracion>


        <Comandos>
­            sudo ls -cal /opt/insts
­
­            export nombre_dir=nombre_instancia
­            source /opt/bin/bash-yaml/script/yaml.sh
­            create_variables /opt/insts/$nombre_dir.yaml
­            export NVM_DIR="/opt/.nvm"
­            cd $NVM_DIR
­            [ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh"
­            echo $server_base_url $server_port $db_database
        </Comandos>
        <Aclaracion>
        </Aclaracion>
    </Seccion>
}

function GitUserAndPass(){
    const { mostrarTodo, privateRepo } = useSelector((estado:EstadoDoc)=>estado);
    return privateRepo || mostrarTodo?<span title="el repositorio es privado, git pide usuario y clave cada vez." style={{color:"lightgreen"}}>
        #✋ <span style={{color:"red"}}>«user» «pass»</span>
    </span>:null;
}

export function CreacionDeLaInstancia(){
    return <Seccion para={MV.DEPLOY_INICIAL}>
        <Titulo>Creación primera vez</Titulo>
        <Comandos>
­            sudo chown $USER /opt/npm
­            mkdir /opt/npm/$nombre_dir/	
­            cd /opt/npm/$nombre_dir/
­            export url_source=$git_host/$git_group/$git_project.git
­            export nombre_user=$server_user
­
­                id -u $nombre_user
­            #✋ Verificar que no exista el usuario
­
­            sudo useradd $nombre_user
­            sudo adduser $nombre_user runner
­
­            #✋ si lo que se quiere es un clon volver al label CLON1
­            git clone $url_source /opt/npm/$nombre_dir
­            <GitUserAndPass/>
­            
­            sudo ln -s /opt/insts/$nombre_dir.yaml /opt/npm/$nombre_dir/local-config.yaml
­            npm install
­            #✋ si tiene .tabs externos agregarlos 
­            npm start -- --dump-db
­            sudo -u postgres psql {'<'} local-db-dump-create-db.sql
­            sudo -u postgres psql -v ON_ERROR_STOP=on --quiet --single-transaction --pset pager=off --file local-db-dump.sql $db_database
­                 # psql --host=$db_host --port=$db_port --username=$db_user --no-password -v ON_ERROR_STOP=on --quiet --single-transaction --pset pager=off --file local-db-dump.sql $db_database
­            #✋ !esperar y borrar .tabs externos

        </Comandos>
        <Aclaracion>
        </Aclaracion>
    </Seccion>
}

export function Mantenimiento(){
    return <Seccion para={MV.ACTUALIZACION}>
        <Titulo>Mantenimiento (cada vez que se actualiza la versión)</Titulo>
        <Comandos>
­            cd /opt/npm/$nombre_dir/
­            sudo chown -R $USER .
­
­            git pull
­            <GitUserAndPass/>
­            
­            #✋el install hay que hacerlo siempre para que haga el build, el rm es para las instalaciones estándar
­            #recomendado: rm -r dist
­            npm install
­
        </Comandos>
        <Aclaracion>
        </Aclaracion>
    </Seccion>
}

function Pie(){
    return <div className="pie"></div>
}

export function Operaciones(){
    const states = {
        numModo: React.useState(0),
        privateRepo: React.useState(true)
    }
    return <div className="doc-operaciones">
        <Provider store={store}>
            <h1>Operaciones bp</h1>
            <ModoVisualizacionDocumento/>
            <CreacionDelArchivoDeConfiguracion/>
            <LecturaDelArchivoDeConfiguracion/>
            <CreacionDeLaInstancia/>
            <Mantenimiento/>
            <Pie/>
        </Provider>
    </div>
}