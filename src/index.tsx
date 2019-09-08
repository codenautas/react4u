import * as React from "react";
import * as ReactDOM from "react-dom";
import { useState } from "react";

import { SaludoInicial } from "./components/marcos";
import { PruebaRelevamientoPrecios } from "./components/ejemplo-precios";
import { ProbarFormularioEncuesta } from "./components/ejemplo-encuesta"
import { HolaMundo } from "./components/ejemplo-concepto"
import { RenderDirectJsonApp } from "./components/json-viewer"
import { AppBar, Toolbar, IconButton, Typography, Button, CssBaseline, SvgIcon, makeStyles } from "@material-ui/core";
import { Menu, MenuItem } from "@material-ui/core";
import { Conditional } from "./components/marcos";

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
}));

function ExampleApplication(){
    const classes = useStyles();
    const [selectedPage, setSelectedPage] = useState<string>('main')
    // @ts-ignore no me deja poner null acá o |null o después en ref. 
    const [hamburguerMenu, setHamburguerMenu] = useState<HTMLButtonElement>(null);
    return <>
        <AppBar position="static">
            <Toolbar>
                <IconButton edge="start" ref={hamburguerMenu} className={classes.menuButton} color="inherit" aria-label="menu"
                    onClick={(event)=>setHamburguerMenu(event.currentTarget)}
                >
                    <SvgIcon >
                        <path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z" />
                    </SvgIcon>
                </IconButton>
                <Menu
                    anchorEl={hamburguerMenu}
                    keepMounted
                    open={Boolean(hamburguerMenu)}
                    onClose={()=>setHamburguerMenu(null)}
                >
                    <MenuItem onClick={()=>{setSelectedPage('precios') ; setHamburguerMenu(null);}}>precios    </MenuItem>
                    <MenuItem onClick={()=>{setSelectedPage('encuesta'); setHamburguerMenu(null);}}>encuesta   </MenuItem>
                    <MenuItem onClick={()=>{setSelectedPage('json')    ; setHamburguerMenu(null);}}>json viewer</MenuItem>
                </Menu>
                <Typography variant="h6" className={classes.title}>
                    react4U
                </Typography>
                <Button color="inherit">Login</Button>
            </Toolbar>            
        </AppBar>
        <Conditional visible={selectedPage=='main'}>
            <HolaMundo mensaje="La demo" uno="React4U" dos={1.0} tres={new Date()}/>
        </Conditional>
        <Conditional visible={selectedPage=='json'}>
            <RenderDirectJsonApp/>
        </Conditional>
        <Conditional visible={selectedPage=='precios'}>
            <PruebaRelevamientoPrecios/>
        </Conditional>
        <Conditional visible={selectedPage=='encuesta'}>
            <ProbarFormularioEncuesta/>
        </Conditional>
    </>;
}

ReactDOM.render(
    <React.StrictMode>
        <CssBaseline />
        <ExampleApplication />
    </React.StrictMode>,
    document.getElementById("main_layout")
)
