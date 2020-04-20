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

export function InstServer(){
    return <Seccion>
        <h1>Instalación de un servidor para Codenautas</h1>
        </Seccion>
}

export function UsuariosAdministradores(){
    return <Seccion para={MV.DEPLOY_INICIAL}>
        <Titulo> Usuarios administradores </Titulo>
        <Equivale>
            <Codigo> 
↵               sudo locale-gen es_AR 
↵               sudo locale-gen es_AR.UTF-8 
            </Codigo>
            <Contenido>
↵               <b>verificar con:</b> hostnamectl 
↵               <b>cambiar con:</b> hostnamectl set-hostname nombre-servidor
↵
            </Contenido>
            <Codigo>
↵               sudo timedatectl set-timezone America/Argentina/Buenos_Aires 
            </Codigo>
            <Contenido>
↵               <b>más opciones con:</b> dpkg-reconfigure tzdata
↵               <b>verificar la hora:</b> date
↵               <b>poner la hora:</b> sudo date --set "2020-01-02 12:58:10"
            </Contenido>
        </Equivale>
        <Comandos> 
↵           <b>solo locales:</b> adduser nombre-usuario-administrador
↵           <b>solo locales:</b> adduser nombre-usuario-administrador sudo
↵           <b>solo locales:</b> sudo nano /etc/ssh/sshd_config
↵               # solo servidores privados: PermitRootLogin no
↵               AddressFamily inet
↵           <b>solo locales:</b> sudo systemctl restart sshd
        </Comandos>
    </Seccion>
}

export function Servidor() {
    return <Seccion>
        <Titulo> Servidor </Titulo>
        <b>Probado en un Ubuntu 18.04</b>
        <Equivale>
            <Contenido>
↵               <Codigo>Verificar tener acceso a internet (que esté el proxy configurado)</Codigo>
↵               wget codenautas.com/txt-to-sql
↵
↵               <Codigo>Si no en <b>nano ~/.profile</b> poner:</Codigo>
↵               export http_proxy=10.32.3.7:3128
↵               export https_proxy=10.32.3.7:3128
↵   
↵               <Codigo> Volver a leer: </Codigo>
↵               . .profile
↵                echo $http_proxy
                <Comandos>  
↵                <Codigo>#Revisar antes de la siguiente instrucción cuál es la última versión en: <b>https://github.com/creationix/nvm</b></Codigo> 
↵
↵                   sudo apt-get upgrade
↵                   sudo apt-get update
↵                   curl -o- https://raw.githubusercontent.com/creationix/nvm/v0.35.2/install.sh | bash
↵                   sudo mv ~/.nvm /opt/.nvm
↵                   export NVM_DIR="/opt/.nvm"
↵                   [ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh"
↵                   command -v nvm   
↵                   npm config set proxy http://10.32.3.7:3128   
↵                   npm config set https-proxy http://10.32.3.7:3128   
↵                   npm install -g typescript  
                </Comandos>
            </Contenido>
        </Equivale>
    </Seccion>
}
 
export function Postgres(){
    return <Seccion>
        <Titulo> Postgres </Titulo>
            <Equivale>    
                Siguiendo <b>https://www.postgresql.org/download/linux/ubuntu/</b> veo que falta el repositorio
                <Comandos>
↵                   sudo nano /etc/apt/sources.list.d/pgdg.list
                </Comandos>   
                and add a line for the repository 
                <Contenido>
↵                   deb http://apt.postgresql.org/pub/repos/apt/ bionic-pgdg main
                </Contenido>
                <Comandos>
↵                   wget --quiet -O - https://www.postgresql.org/media/keys/ACCC4CF8.asc |
↵                       sudo apt-key add -
↵                   sudo apt-get update
↵                   sudo apt-get install postgresql
↵
↵                   <b>Probar si arranca:</b>
↵                       sudo -u postgres psql -c "select version()"
↵
↵                   <b>si no arranca:</b>
↵                       sudo -u postgres /usr/lib/postgresql/11/bin/pg_ctl restart -D
↵                           /etc/postgresql/11/main
↵                       sudo -u postgres psql -c "select version()"
↵
↵                   <b>Si hay más de uno instalado:</b>
↵                       sudo nano /etc/postgresql/11/main/postgresql.conf
↵                       <b>hay que cambiar el port a 54311 (poniendo la versión al final del puerto)</b>
↵                       sudo -u postgres /usr/lib/postgresql/11/bin/pg_ctl restart -D
↵                          /etc/postgresql/11/main
↵                       sudo -u postgres psql --port 54311 -c "select version()"
↵
↵                   
↵                   sudo apt-get install git
↵                   
↵                   sudo apt-get install nginx
↵
↵                   Falta quizás: mc, svn
                </Comandos>
            </Equivale>
    </Seccion>
}
 
export function ConfigPostgres(){
    return <Seccion>
        <Titulo> Configuración del postgres </Titulo>
        <Equivale>
            <b>Para poder acceder desde otras máquinas con una conexión directa tipo ODBC hay que actualizar el hba.conf</b>
            <Comandos> 
↵               <b>para ver la versión instalada:</b>     
↵               sudo nano /etc/postgresql/12/main/pg_hba.conf
↵
↵               <b>para acceder</b>
↵               sudo nano /etc/postgresql/12/main/pg_hba.con
↵
↵               <b>agregar algo tipo:</b>
                <Contenido> 
↵                   host    all          all           192.168.1.0/24         md5    
                </Contenido>
↵               <b>para acceder</b>
↵               sudo nano /etc/postgresql/12/main/postgresql.conf
↵
↵               <b>y cambiar</b>
                <Contenido> 
↵                   #listen_addresses = 'localhost'    
                </Contenido>              
↵               <b>por</b>
                <Contenido> 
↵                   listen_addresses = '*'    
                </Contenido> 
↵
↵               <b>Luego, para que tome la nueva configuración poner:</b>    
↵               sudo systemctl restart postgresql         
            </Comandos>
        </Equivale>
    </Seccion>
}
 
export function ConfInstApp(){
    return <Seccion>
        <Titulo> Preparación para configurar e instalar las aplicaciones </Titulo>
        <Comandos>
↵           sudo addgroup runner    
↵           sudo mkdir /opt/npm
↵           sudo chgrp -R runner /opt/npm
↵           sudo chmod -R g-w,u+wr,o-wr /opt/npm
↵
↵           sudo mkdir /opt/bin
↵           sudo mkdir /opt/bin/coderun
↵           sudo chown $USER -R /opt/bin/coderun
↵           git clone https://github.com/codenautas/coderun.git /opt/bin/coderun
↵           sudo chmod +x /opt/bin/coderun/script/*.sh
↵
↵           sudo mkdir /opt/bin/bash-yaml
↵           sudo chown $USER -R /opt/bin/bash-yaml
↵           git clone https://github.com/jasperes/bash-yaml.git /opt/bin/bash-yaml
↵           sudo mkdir /opt/insts
↵           sudo mkdir /opt/nginx.conf/
↵           sudo mkdir /opt/services/
↵
↵           sudo nano /etc/nginx/sites-enabled/default
↵           <b> Buscamos y colocamos en la sección que incluye “default_server” antes de la llave final de cierre: </b>
            <Contenido>
↵               include /opt/nginx.conf/*.conf;
            </Contenido>
        </Comandos>
    </Seccion>
}
 
export function MantenimientoServer(){
    return <Seccion /*para={MV.ACTUALIZACION}*/>
        <h1>Mantenimiento del servidor para Codenautas</h1>
    </Seccion>
}

export function ActVerSeguridad(){
    return <Seccion>
            <Titulo>Actualización de versiones de seguridad</Titulo>
            ✋ Hacer backup del servidor y/o de todos los datos:
            <Comandos>
↵               <b>1.</b> bases de datos
↵                   <b>a.</b>   usar pgdump
↵                   <b>b.</b>   hacer hot
↵               <b>2.</b>   archivos adjuntos subidos
↵                   <b>a.</b>   pueden estar en la carpeta /opt/npm/aplicacion/local-attachments
↵                   <b>b.</b>   o en /srv/npm/aplicacion/local-attachments
↵               <b>3.</b>   configuraciones
↵                   <b>a.</b>   las aplicaciones de backend-plus que siguen estas instrucciones están en: /opt/insts
↵                   <b>b.</b>   otras configuraciones específicas pueden estar en otros lugares 📝habría que definir dónde anotar esas excepciones
            </Comandos>
    </Seccion>
}
 
export function Nodejs(){
    return <Seccion>
        <Titulo>Nodejs</Titulo>
        <Equivale>
            <Comandos>
↵               export NVM_DIR="/opt/.nvm"
↵               [ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh"
↵               nvm install --lts
↵               npm install -g typescript   
            </Comandos>
            ✋ luego hay que reiniciar cada uno de los servicios que estén andando para que tomen la nueva versión
        </Equivale>
    </Seccion>
}
 
export function Postgresql(){
    return <Seccion>
        <Titulo>Postgresql</Titulo>
        <Equivale>
                <b>Averiguar versión actual</b>
                <Comandos>
↵                   sudo -u postgres psql -c "select version()"
↵
↵                   Si solo se cambia el último dígito con actualizar los binarios alcanza, si no hay que hacer un dump y volver a levantar. 
↵                   Leer lo que hay que agregar después de hacer el update.
↵                   Por ejemplo en <b>https://www.postgresql.org/about/news/1905/</b> dice que para cambiar
↵                       <b>*de 10 a 11 hay que ejecutar:</b>   
↵                       ALTER EXTENSION pg_stat_statements UPDATE;
                </Comandos>
                <b>install</b>
                <Comandos>
↵                   Siguiendo <b>https://www.postgresql.org/download/linux/ubuntu/</b> veo que falta el repositorio
↵                   sudo nano /etc/apt/sources.list.d/pgdg.list
↵
↵                   and add a line for the repository
                    <Contenido>
↵                       deb http://apt.postgresql.org/pub/repos/apt/ bionic-pgdg main
                    </Contenido>
↵                   wget --quiet -O - https://www.postgresql.org/media/keys/ACCC4CF8.asc |
↵                   sudo apt-key add -
↵                   sudo apt-get update
↵                   sudo apt-get install postgresql
                </Comandos>
                <b>dump</b>
                <Comandos>
↵                   <b>Para hacer el dump hay que crear el archivo de destino y ponerle permisos a postgres que es el que va a escribir el archivo.</b>
↵                   <b>Conviene hacer el dump con el postgres recién instalado</b>
↵                   cd ~
↵                   export TMP_TS=`date +%Y%m%dT%H%M%S`
↵                   mkdir $TMP_TS
↵                   cd $TMP_TS
↵                   touch dump_all.sql
↵                   sudo chmod 600 dump_all.sql
↵                   sudo chown postgres dump_all.sql
↵                   sudo -u postgres /usr/lib/postgresql/11/bin/pg_dumpall -f dump_all.sql
↵                   sudo -u postgres psql -c "SHOW data_directory;"
↵                   sudo -u postgres /usr/lib/postgresql/10/bin/pg_ctl stop -D
↵                       /var/lib/postgresql/10/main
↵                   sudo nano /etc/postgresql/11/main/postgresql.conf
↵           
↵                   <b>Cambiar al puerto 5432 dentro del archivo de configuración y arrancarlo:</b>
↵                   sudo nano /etc/postgresql/10/main/postgresql.conf
↵
↵                   <b>Quitar el puerto 5432 dentro del archivo de configuración del postgres anterior por si se arranca igual. Ponemos 543versión, en este caso 54310</b>
↵                   sudo -u postgres /usr/lib/postgresql/11/bin/pg_ctl restart -D
↵                       /etc/postgresql/11/main
↵                   sudo -u postgres psql -c "select version()"
↵                   sudo -u postgres psql -f dump_all.sql
                </Comandos>
                <b>Nota 1</b>
                <Comandos>
↵                   Si se quiere transmitir el archivo conviene comprimirlo para transmitirlo a windows:
↵                   sudo gzip -k dump_all.sql
↵           
↵                   🗔 En un cmd de windows:
↵                       pscp user@yourhost.net:/home/user/190113T160741/dump_all.sql.gz 
↵                       /temp/dump_all.sql.gz
                </Comandos>
        </Equivale>
    </Seccion>
}
 
export function Nginx(){
    return <Seccion> 
        <Titulo>Nginx</Titulo>
        <Comandos>
↵           nginx -v  
        </Comandos>
    </Seccion>
}
 
export function Git(){
    return <Seccion>
        <Titulo>git</Titulo>
        <Comandos>
↵           git --version 
        </Comandos>
        <Contenido>
↵           Midnight Commander
↵           sudo add-apt-repository universe
↵           sudo apt update
↵           sudo apt install mc
↵           ----------------- postgres -----------------
↵           sudo service postgresql restart
↵           1- En hba_config agregué
↵               host    all               all            10.32.72.0/23         md5
↵           2- En postgres.config descomenté
↵               Listen_address=’*’
        </Contenido>
    </Seccion>
}
 
export function InstBaseDeDatosCode() {
    return <Seccion>
        <h1> Instalación de un servidor de base de datos para Codenautas </h1>
        <Comandos>
↵           sudo locale-gen es_AR
↵           sudo locale-gen es_AR.UTF-8
↵           <b>verificar con</b> hostnamectl
↵           <b>cambiar con</b> hostnamectl set-hostname nombre-servidor
↵
↵           sudo timedatectl set-timezone America/Argentina/Buenos_Aires
↵           <b>más opciones con</b> dpkg-reconfigure tzdata
↵           <b>verificar la hora</b> date
        </Comandos>
    </Seccion>
}
 
export function PostgresBaseDeDatos(){
    return <Seccion>
        <Titulo>Postgres</Titulo>
        <Equivale>
            Siguiendo <b>https://www.postgresql.org/download/linux/ubuntu/</b> veo que falta el repositorio
            <Comandos>
↵               sudo nano /etc/apt/sources.list.d/pgdg.list       
↵               and add a line for the repository
                <Contenido>
↵                   deb http://apt.postgresql.org/pub/repos/apt/ bionic-pgdg main
                </Contenido>
↵               wget --quiet -O - https://www.postgresql.org/media/keys/ACCC4CF8.asc |        
↵                   sudo apt-key add -
↵               sudo apt-get update
↵               sudo apt-get install postgresql
↵
↵               <b>Probar si arranca</b>
↵                   sudo -u postgres psql -c "select version()"
↵
↵               <b>si no arranca:</b>
↵                   sudo -u postgres /usr/lib/postgresql/11/bin/pg_ctl restart -D
↵                       /etc/postgresql/11/main
↵
↵               <b>Si hay más de uno instalado</b>
↵                   sudo nano /etc/postgresql/11/main/postgresql.conf
↵                   hay que cambiar el port a 54311 (poniendo la versión al final del puerto)
↵                   sudo -u postgres /usr/lib/postgresql/11/bin/pg_ctl restart -D
↵                       /etc/postgresql/11/main
↵                   sudo -u postgres psql --port 54311 -c "select version()"
            </Comandos>
        </Equivale>
    </Seccion>
}
 
export function PregFrecuentes(){
    return <Seccion>
        <Titulo>Preguntas Frecuentes</Titulo>
        <b>Para enumerar todas las unidades instaladas en el sistema:</b>
        <Comandos>
↵           sudo systemctl list-unit-files
        </Comandos>
        <b>Estado de las aplicaciones instaladas en el sistema:</b>
        <Comandos>
↵           sudo systemctl status
        </Comandos>
    </Seccion>
}
 
export function ServAppPHP(){
    return <Seccion>
        <h1>Servidores con aplicaciones PHP</h1>
        <Equivale>
            <Comandos>
↵               sudo mkdir /opt/svn
↵               sudo apt-get install php
↵               sudo apt-get install php7.2-fpm
↵               sudo apt-get install php-pgsql
↵ 
↵               sudo apt-get install subversion
↵ 
↵               sudo nano /etc/nginx/sites-available/default
↵  
                <Contenido>
↵                   location ~* \.php$ {'{'}
↵                       fastcgi_pass unix:/run/php/php7.2-fpm.sock;
↵                       include fastcgi_params;
↵                       fastcgi_param   SCRIPT_FILENAME
↵                           $document_root$fastcgi_script_name;
↵                       fastcgi_param   SCRIPT_NAME        $fastcgi_script_name;
↵                   {'}'}
                </Contenido>
↵               sudo nano /var/www/html/info.php   
↵
                <Contenido>
↵                   {'<'}?php
↵                   phpinfo();
↵                   ?{'>'}
                </Contenido>      
↵               sudo systemctl restart nginx   
↵               
↵               <b>Entrar al navegador a IP.00.00.00/info.php</b>
↵
↵               <b>Si no anda:</b>
↵               sudo /etc/init.d/php7.2-fpm restart
↵               sudo systemctl start php7.2-fpm.service
↵               sudo systemctl restart nginx
↵
↵               <b>si anda !!!!! Borrar php.info</b>
↵               sudo rm /var/www/html/info.php
            </Comandos>
        </Equivale>
    </Seccion>
}
 
export function ParaApp(){
    return <Seccion>
        <Titulo>Para la APP</Titulo>
        <Comandos>
↵           cd /opt/svn
↵           sudo mkdir alserver_etoi201
↵           sudo chown $USER alserver_etoi201
↵           svn co http://10.35.3.234/svn/yeah/trunk/fuentes/alserver alserver_etoi201
↵
↵           sudo nano /opt/nginx.conf/svn-etoi201.conf
↵ 
            <Contenido>
↵               location /etoi201 {'{'}
↵                   alias /opt/svn/alserver_etoi201;
↵                       location ~ \.php$ {'{'}
↵                           fastcgi_pass unix:/run/php/php7.2-fpm.sock;
↵                           fastcgi_index index.php;
↵                           include fastcgi_params;
↵                           fastcgi_param   SCRIPT_FILENAME    $request_filename;
↵                           fastcgi_param   SCRIPT_NAME        $fastcgi_script_name;
↵                           fastcgi_read_timeout 300;
↵                           {'}'}
↵               {'}'}          
            </Contenido>
↵           sudo systemctl restart nginx
↵
↵           Instalar <b>php_pgsql.dll</b>      
↵               sudo apt-get install php7.2-pgsql 
↵
↵           <b>Reiniciar el php y nginx</b>  
↵               sudo /etc/init.d/php7.2-fpm restart
↵               sudo systemctl start php7.2-fpm.service
↵               sudo systemctl restart nginx
↵
↵           <b>Necesité cambiar el dueño de la carpeta alserver_eah2019 de root a desadmin</b>
↵               sudo chown desadmin alserver_eah2019/ -R
↵
↵           <b>y dar permiso de escritura en los *.json dentro de /eah2019</b>
↵
↵           Puede ser que falte instalar la librería  <b>ZipArchive</b> (lo utilizamos para exportar las bases desde el sistema)
↵
↵           para instalarla ejecutamos:
↵               sudo apt-get install php7.2-zip
↵           Y reiniciamos el php y nginx como se indica en el punto anterior
        </Comandos>
    </Seccion>
}
 
export function Debug(){
    return <Seccion>
        <Titulo>Debug</Titulo>
        <Comandos>
↵           sudo nano /var/log/nginx/error.log    
↵           sudo journalctl -u nginx
        </Comandos>
    </Seccion>
}
 
export function ModDeConf(){
    return <Seccion>
        <Titulo>Modificación de configuración</Titulo>
        <b>error body too large</b>
        <Comandos>
↵           En php.ini incrementar
↵               post_max_size
↵
↵               upload_max_file_size
↵
↵           En la carpeta nginx.conf, en archivo de configuración del operativo  setear:
↵               client_max_body_size
        </Comandos>
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
            <InstServer/>
            <UsuariosAdministradores/>
            <Servidor/>
            <Postgres/>
            <ConfigPostgres/>
            <ConfInstApp/>
            <MantenimientoServer/>
            <ActVerSeguridad/>
            <Nodejs/>
            <Postgresql/>
            <Nginx/>
            <Git/>
            <InstBaseDeDatosCode/>
            <PostgresBaseDeDatos/>
            <PregFrecuentes/>
            <ServAppPHP/>
            <ParaApp/>
            <Debug/>
            <ModDeConf/>
        </Provider>
        <Pie/>
    </div>
}