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
    return privateRepo || mostrarTodo?<span title="el repositorio es privado, git pide usuario y clave cada vez." className='linea-comentario'>
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
        </Comandos>
        <Comandos>
­            sudo -u postgres psql {'<'} local-db-dump-create-db.sql
­            sudo -u postgres psql -v ON_ERROR_STOP=on --quiet --single-transaction --pset pager=off --file local-db-dump.sql $db_database
        </Comandos>
        <Comandos>
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

export function ActualizarNginx(){
    return <Seccion para={[MV.DEPLOY_INICIAL, MV.CAMBIO_CONFIG]}>
        <Titulo>Actualizar la configuración para nginx</Titulo>
        <Comandos>
↵            sudo chown $USER /opt/nginx.conf
↵            sudo touch /opt/nginx.conf/$nombre_dir.conf
↵            sudo chown $USER /opt/nginx.conf/$nombre_dir.conf
↵
↵            . /opt/bin/coderun/script/generate-nginx-inst.sh
        </Comandos>
        ✋ Mirar las diferencias (la primera vez dirá: No such file or directory). Esto generó el .conf como si se hubiera tipeado:
        <Equivale>
            <Comandos>
↵                sudo nano /opt/nginx.conf/$nombre_dir.conf
            </Comandos>
­            <Contenido>
↵                location /base_url {'{'}
↵                    proxy_pass http://localhost:3040/base_url;
↵                    proxy_http_version 1.1;
↵                    proxy_set_header Upgrade $http_upgrade;
↵                    proxy_set_header Connection 'upgrade';
↵                    proxy_set_header Host $host;
↵                    proxy_set_header  X-Real-IP $remote_addr;
↵                    proxy_set_header  X-Forwarded-Proto https;
↵                    proxy_set_header  X-Forwarded-For $remote_addr;
↵                    proxy_set_header  X-Forwarded-Host $remote_addr;
↵                    proxy_cache_bypass $http_upgrade;
↵                {'}'}
            </Contenido>
        </Equivale>
        <Comandos>
↵            sudo systemctl restart nginx
        </Comandos>
        # ✋ Ver que no se rompa el nginx. Navegando la ip del server a secas (sin el base_url ni puerto). 
        Para ver errores de Nginx usar comando <Codigo> sudo journalctl -u nginx </Codigo>
    </Seccion>
}

export function ActualizarServicio() {
    return <Seccion para={[MV.DEPLOY_INICIAL, MV.CAMBIO_CONFIG]}>
        <Titulo> Actualizar la configuración del servicio </Titulo>
        <Comandos> 
↵           sudo chown $USER /opt/services
↵           sudo touch /opt/services/$nombre_dir.service
↵           sudo chown $USER /opt/services/$nombre_dir.service
↵           # ✋ la primera vez podria no existir el archivo 
↵
↵           . /opt/bin/coderun/script/generate-service-inst.sh       
        </Comandos>
        ✋  Mirar las diferencias (la primera vez dirá: No such file or directory). Esto generó el .conf como si se hubiera tipeado:
        <Equivale>
            <Comandos> 
↵               sudo nano /opt/services/$nombre_dir.service       
            </Comandos>
            <Contenido> 
↵               [Unit]
↵               Description=nombre_instancia - node
↵ 
↵               [Service]
↵               ExecStart=/opt/bin/run-app.sh 
↵               Restart=always
↵               RestartSec=5
↵               WorkingDirectory=/opt/npm/nombre_instancia
↵               User=$server_user
↵ 
↵               Group=runner
↵               StandardOutput=syslog
↵               StandardError=syslog
↵               SyslogIdentifier=nombre_instancia
↵               [Install]
↵               WantedBy=multi-user.target
            </Contenido>
        </Equivale>
        <Para  para={MV.DEPLOY_INICIAL}>
            <Comandos>
                sudo systemctl enable /opt/services/$nombre_dir.service
            </Comandos>
        </Para>
     </Seccion>
}

export function RestaurarPermisosOwnersReiniciar() {
    return <Seccion>
        <Titulo> Restuarar permisos y owners y reniciar </Titulo>
        <Comandos>
↵           echo $server_user
        </Comandos>
        ✋ Va existir a partir de coderun 0.1.3 
        <Comandos> 
↵              export server_user=$nombre_dir 
        </Comandos>
        <Comandos>
↵           sudo chown root /opt/npm
↵           sudo chown -R root /opt/nginx.conf
↵           sudo chown -R root /opt/services
↵           sudo chown -R root /opt/bin
↵           sudo chmod +x /opt/bin/coderun/script/run-app.sh
↵           sudo chown -R $server_user /opt/npm/$nombre_dir
↵           sudo systemctl daemon-reload
↵           sudo systemctl stop $nombre_dir.service
↵           sudo systemctl restart $nombre_dir.service
        </Comandos>
    </Seccion>
}

export function MantenimientoGeneral() {
    return <Seccion>
        <h1> Mantenimiento general del servidor y/o debugging  </h1>
    </Seccion>
}

export function Diagnostico() {
    return <Seccion>
        <Titulo>  Diagnosticos </Titulo>
        Para ver si el node está corriendo (el servicio está bien levantado):
        <Comandos>
↵           wget -S -O - --proxy=off http://127.0.0.1:3034/ipc2
↵           wget --proxy=off http://127.0.0.1:3034/ipc2 
        </Comandos>
        Para ver qué errores está tirando un servicio
        <Comandos>
↵           sudo journalctl -u nginx
↵           sudo journalctl -u $nombre_dir
        </Comandos>
    </Seccion>
}

export function PSQL() {
    return <Seccion>
        <Titulo> psql </Titulo>
        <Comandos>
↵           <b>\l</b>     lista las bases de datos
        </Comandos>
    </Seccion>
}

export function Postgresql() {
    return <Seccion>
        <Titulo> Postgresql </Titulo>
        <Comandos>
↵           sudo service postgresql reload
↵           sudo systemctl restart postgresql
        </Comandos>
    </Seccion>
}

export function Apache() {
    return <Seccion>
        <Titulo> Apache </Titulo>
        <Comandos>
↵           sudo nano /etc/apache2/sites-available/nuestroservidor.com.ar.conf
↵           sudo nano /etc/php/7.0/apache2/php.ini
↵           ProxyTimeout 1200
        </Comandos>
    </Seccion>
}

export function ClonarInstApp() {
    return <Seccion>
        <Titulo> Clonar una instalación de app a partir de otra </Titulo>
        <Comandos>
↵           export nombre_origen=nombre_instancia
↵
↵           export nombre_dir=nombre_instancia
↵           source /opt/bin/bash-yaml/script/yaml.sh
↵           create_variables /opt/insts/$nombre_origen.yaml ori_
        </Comandos>
        # ✋ empezar una aplicación nueva y luego volver donde se encuentre el label CLON1
        <Comandos>
↵           # ✋ si es solo la base de datos saltear esta parte hasta CLON-DB
↵           echo /opt/npm/$nombre_origen /opt/npm/$nombre_dir
↵           sudo cp -r /opt/npm/$nombre_origen/* /opt/npm/$nombre_dir
↵           sudo rm /opt/npm/$nombre_dir/local-config.yaml
↵           sudo ln -s /opt/insts/$nombre_dir.yaml /opt/npm/$nombre_dir/local-config.yaml
↵           sudo chown $USER -R /opt/npm/$nombre_dir
↵           cd /opt/npm/$nombre_dir
↵           npm start -- --dump-db
↵           cat local-db-dump-create-db.sql
↵           sudo -u postgres psql {'<'} local-db-dump-create-db.sql
        </Comandos>
        # ✋ CLON-DB saltear hasta acá si solo se clona la base de datos
        <Comandos>
↵           touch local-db-clone.sql
↵           sudo chown postgres local-db-clone.sql
↵           sudo -u postgres pg_dump --format plain $ori_db_database > local-db-clone.sql
↵           sudo -u postgres sed -e "s/$ori_install_dump_db_owner/$install_dump_db_owner/g ; 
↵                s/$ori_db_user/$db_user/g " local-db-clone.sql > local-db-cloned.sql
↵           sudo -u postgres psql -v ON_ERROR_STOP=on --quiet --single-transaction --pset 
↵                pager=off --file local-db-cloned.sql $db_database
        </Comandos>
    </Seccion>
}

export function EliminarInstalacion() {
    return <Seccion>
        <Titulo> Eliminar una instalación </Titulo>
        # ✋ Primero ir arriba a leer el archivo de configuración de la instancia
        <Comandos>
↵           sudo mkdir /opt/deleted
↵           sudo mkdir /opt/trash
↵       </Comandos>
        <Comandos>
↵           sudo mkdir /opt/deleted/$nombre_dir
↵           sudo chown $USER /opt/deleted/$nombre_dir
↵           cd /opt/deleted/$nombre_dir
↵           sudo -u postgres pg_dump --format plain --dbname $db_database > before-delete-db.psql
↵           gzip before-delete-db.psql
↵           sudo cp /opt/insts/$nombre_dir.yaml local-config.yaml
↵           sudo cp /opt/npm/$nombre_dir/package*.json
↵           sudo cp -r /opt/npm/$nombre_dir/local-*/
↵           sudo zip -r locals.zip /opt/npm/$nombre_dir/local-* 
↵           cp /etc/systemd/system/$nombre_dir.service
↵           sudo cp /opt/nginx.conf/$nombre_dir.conf nginx.conf
↵           sudo systemctl stop $nombre_dir.service
↵           sudo systemctl disable $nombre_dir.service
↵           sudo rm /opt/nginx.conf/$nombre_dir.conf
↵           rem sudo -u postgres psql --command "drop database $db_database"
↵           sudo mv /opt/npm/$nombre_dir /opt/trash/$nombre_dir  
↵
↵           sudo chown root /opt/npm
↵           sudo chown -R root /opt/nginx.conf
↵           sudo chown -R root /opt/services
↵           sudo chown -R root /opt/bin
↵           sudo chown -R root /opt/deleted/$nombre_dir
↵           sudo systemctl restart nginx
↵           sudo systemctl daemon-reload
↵           sudo systemctl reset-failed
        </Comandos>
    </Seccion>
}

function Pie(){
    return <div className="pie"></div>
}

export function Operaciones(){
    return <div className="doc-operaciones">
        <Provider store={store}>
            <h1>Operaciones bp</h1>
            <ModoVisualizacionDocumento/>
            <CreacionDelArchivoDeConfiguracion/>
            <LecturaDelArchivoDeConfiguracion/>
            <CreacionDeLaInstancia/>
            <Mantenimiento/>
            <ActualizarNginx/>
            <ActualizarServicio/>
            <RestaurarPermisosOwnersReiniciar/>
            <MantenimientoGeneral/>
            <Diagnostico/>
            <PSQL/>
            <Postgresql/>
            <Apache/>
            <ClonarInstApp/>
            <EliminarInstalacion/>
        </Provider>
        <Pie/>
    </div>
}