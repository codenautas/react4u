import * as React from "react";
import { useState, useEffect } from "react";
import { AppBar, Menu, MenuItem, Toolbar, Button, IconButton } from "@material-ui/core";
import { makeStyles, SvgIcon, Typography } from "@material-ui/core";
import { Drawer, List, ListItem, ListItemText, ListItemIcon } from "@material-ui/core";

import * as likeAr from "like-ar";
import { response } from "express";

export function useFetch<T>(url:string, defaultData:T) {
    const [data, updateData] = useState(defaultData)
    const [err , updateErr ] = useState<Error|null>(null)
    useEffect(()=>{
        const ajaxRequest = async () => {
            try{
                const resp = await fetch(url)
                const json = await resp.json()
                updateData(json)
            }catch(err){
                updateErr(err);
            }
        }
        ajaxRequest();
    }, [url])
    return [data,err];
}

export type FetcherFun = (action:{type:string, payload?:any})=>void

export function fetchAndDispatch(url:string, dispatchDataOrError:FetcherFun, typeDoing:'FECTHING', typeOk:'FETCHED'):void;
export function fetchAndDispatch(url:string, dispatchDataOrError:FetcherFun, typeDoing:'SAVING', typeOk:'SAVED', content:string):void;
export function fetchAndDispatch(url:string, dispatchDataOrError:FetcherFun, typeDoing:string, typeOk:string, content?:string):void
export function fetchAndDispatch(url:string, dispatchDataOrError:FetcherFun, typeDoing:string, typeOk:string, content?:string
) {
    dispatchDataOrError({type:typeDoing})
    const ajaxRequest = async () => {
        var resp: Response|null = null;
        try{
            var request:string = url + (content?'&content='+JSON.stringify(content):'')
            resp = await fetch(request)
            if(resp.status==200){
                const json = await resp.json()
                // TODO: generalizar y pasar el timestamp a otro lado
                var loaded = {...json, content:JSON.parse(json.content||null)}
                dispatchDataOrError({type:typeOk, payload:loaded})
            }else{
                dispatchDataOrError({type:'TX_ERROR', payload:{code:resp.status, message:resp.status+' '+resp.statusText, details:url}})
            }
        }catch(err){
            try{
                var details=resp && (resp.statusText || (await resp.text()).substr(0,10));
                console.log(details);
                err.details=details;
            }finally{
                console.log(err);
                dispatchDataOrError({type:'TX_ERROR', payload:err});
            }
        }
    }
    ajaxRequest();
}

const MENUTYPE:'simple'|'draw'='draw';

export function Conditional(props:{visible:boolean, children:any}){
    return props.visible?<>
        {props.children}
    </>:null;
}

type Children = React.ReactElement;

export function WScreen(props:{page:string, menuLabel?:string, iconSvgPath?:string, iconName?:string, children:Children}){
    return <>
        {props.children}
    </>;
}

const useStyles = makeStyles(theme => ({
  root: {
    flexGrow: 1,
  },
  menuButton: {
    marginRight: theme.spacing(2),
  },
  title: {
    flexGrow: 1,
  },
  list: {
    width: 250,
  },
  fullList: {
    width: 'auto',
  },
}));

// https://material-ui.com/components/material-icons/
export const materialIoIconsSvgPath:{[k:string]:string}={
    Add: "M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z",
    Assignment: "M19 3h-4.18C14.4 1.84 13.3 1 12 1c-1.3 0-2.4.84-2.82 2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 0c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zm2 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z",
    CheckBoxOutlineBlankOutlined: "M19 5v14H5V5h14m0-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2z",
    CheckBoxOutlined: "M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V5h14v14zM17.99 9l-1.41-1.42-6.59 6.59-2.58-2.57-1.42 1.41 4 3.99z",
    Code: "M9.4 16.6L4.8 12l4.6-4.6L8 6l-6 6 6 6 1.4-1.4zm5.2 0l4.6-4.6-4.6-4.6L16 6l6 6-6 6-1.4-1.4z",
    EmojiObjects: "M12 3c-.46 0-.93.04-1.4.14-2.76.53-4.96 2.76-5.48 5.52-.48 2.61.48 5.01 2.22 6.56.43.38.66.91.66 1.47V19c0 1.1.9 2 2 2h.28c.35.6.98 1 1.72 1s1.38-.4 1.72-1H14c1.1 0 2-.9 2-2v-2.31c0-.55.22-1.09.64-1.46C18.09 13.95 19 12.08 19 10c0-3.87-3.13-7-7-7zm2 16h-4v-1h4v1zm0-2h-4v-1h4v1zm-1.5-5.59V14h-1v-2.59L9.67 9.59l.71-.71L12 10.5l1.62-1.62.71.71-1.83 1.82z",
    Label: "M17.63 5.84C17.27 5.33 16.67 5 16 5L5 5.01C3.9 5.01 3 5.9 3 7v10c0 1.1.9 1.99 2 1.99L16 19c.67 0 1.27-.33 1.63-.84L22 12l-4.37-6.16z",
    LocalAtm: "M11 17h2v-1h1c.55 0 1-.45 1-1v-3c0-.55-.45-1-1-1h-3v-1h4V8h-2V7h-2v1h-1c-.55 0-1 .45-1 1v3c0 .55.45 1 1 1h3v1H9v2h2v1zm9-13H4c-1.11 0-1.99.89-1.99 2L2 18c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V6c0-1.11-.89-2-2-2zm0 14H4V6h16v12z",
    Menu: "M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z",
    Save: "M17 3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V7l-4-4zm-5 16c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3zm3-10H5V5h10v4z"
}

function splitVariables(line:string){
    return (
        likeAr(line.slice(line[0]=='?' || line[0]=='#'?1:0).split('&'))
        .build<(string|boolean), string>((asignacion:string)=>{
            const eqPosition = asignacion.indexOf('=');
            return eqPosition ? {[asignacion.substr(0,eqPosition)]:asignacion.substr(eqPosition+1)} : {[asignacion]: true}
        })
    );
}

export function Application(props:{children:Children[]}){
    const classes = useStyles();
    const [drawOpened, setDrawOpened] = React.useState(false);
    const locationParts=splitVariables(location.hash);
    console.log(locationParts);
    const [selectedPage, setSelectedPage] = useState<string>(locationParts.w||'main')
    useEffect(()=>{
        if(selectedPage){
            location.hash='w='+selectedPage;
        }else{
            location.hash='';
        }
        const onHashChange = function (){
            const locationParts=splitVariables(location.hash);
            if(locationParts.w && locationParts.w != selectedPage){
                setSelectedPage(locationParts.w);
            }
        };
        window.addEventListener('hashchange', onHashChange);
        return function cleanUp(){
            window.removeEventListener('hashchange', onHashChange)
        }
    })
    const [hamburguerMenu, setHamburguerMenu] = useState<HTMLButtonElement|null>(null);
    const toggleDrawer = (open: boolean) => (
        event: React.KeyboardEvent | React.MouseEvent,
    ) => {
        if (
            event.type === 'keydown' &&
            ((event as React.KeyboardEvent).key === 'Tab' ||
                (event as React.KeyboardEvent).key === 'Shift')
        ) {
            return;
        }
        setDrawOpened(open);
    };
    return <>
        <AppBar position="static">
            <Toolbar>
                <IconButton edge="start" className={classes.menuButton} color="inherit" aria-label="menu"
                    onClick={(event)=>MENUTYPE=='simple'?setHamburguerMenu(event.currentTarget):setDrawOpened(true)}
                >
                    <SvgIcon>
                        <path d={materialIoIconsSvgPath.Menu} />
                    </SvgIcon>
                </IconButton>
                <Typography variant="h6" className={classes.title}>
                    react4U
                </Typography>
                <Button color="inherit">Login</Button>
            </Toolbar>            
        </AppBar>
        {props.children.map(child=>
            child.props.page && child.props.children?
                <Conditional key={child.props.page} visible={child.props.page==selectedPage}>{child}</Conditional>
            :child
        )}
        <Drawer open={drawOpened} onClose={toggleDrawer(false)}>
            <div
                className={classes.list}
                role="presentation"
                onClick={toggleDrawer(false)}
                onKeyDown={toggleDrawer(false)}
            >
                <List>
                    {props.children.map((child) => { 
                        var item=child.props;
                        if(item==null){ return null; }
                        return (
                            <ListItem button key={item.page} onClick={()=>{
                                setSelectedPage(child.props.page) ; setDrawOpened(false);
                            }}>
                                <ListItemIcon>
                                    <SvgIcon>
                                        <path d={item.iconSvgPath||materialIoIconsSvgPath[item.iconName||'Label']}/>
                                    </SvgIcon>
                                </ListItemIcon>
                                <ListItemText primary={item.menuLabel||item.page} />
                            </ListItem>
                        );
                    })}
                </List>
            </div>
        </Drawer>
        <Menu
            anchorEl={hamburguerMenu}
            keepMounted
            open={Boolean(hamburguerMenu)}
            onClose={()=>setHamburguerMenu(null)}
        >
            {props.children.map(child=>
                child.props.page?
                    <MenuItem key={child.props.page} onClick={()=>{
                        setSelectedPage(child.props.page) ; setHamburguerMenu(null);
                    }}>
                        {child.props.menuLabel||child.props.page}
                    </MenuItem>
                :null
            )}
        </Menu>
    </>;
}
