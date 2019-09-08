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

type Children = React.ReactElement;

function WScreen(props:{page:string, menuLabel?:string, children:Children}){
    return <>
        {props.children}
    </>;
}

function Application(props:{children:Children[]}){
    const classes = useStyles();
    const [selectedPage, setSelectedPage] = useState<string>('main')
    const [hamburguerMenu, setHamburguerMenu] = useState<HTMLButtonElement|null>(null);
    return <>
        <AppBar position="static">
            <Toolbar>
                <IconButton edge="start" className={classes.menuButton} color="inherit" aria-label="menu"
                    onClick={(event)=>setHamburguerMenu(event.currentTarget)}
                >
                    <SvgIcon >
                        <path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z" />
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
                <Conditional visible={child.props.page==selectedPage}>{child}</Conditional>
            :child
        )}
        <Menu
            anchorEl={hamburguerMenu}
            keepMounted
            open={Boolean(hamburguerMenu)}
            onClose={()=>setHamburguerMenu(null)}
        >
            {props.children.map(child=>
                child.props.page?
                    <MenuItem onClick={()=>{
                        setSelectedPage(child.props.page) ; setHamburguerMenu(null);
                    }}>
                        {child.props.menuLabel||child.props.page}
                    </MenuItem>
                :null
            )}
        </Menu>
    </>;
}

function ExampleApplication(){
    return <Application>
        <WScreen page='main'>
            <HolaMundo mensaje="La demo" uno="React4U" dos={1.0} tres={new Date()}/>
        </WScreen>
        <WScreen page='precios'>
            <PruebaRelevamientoPrecios/>
        </WScreen>
        <WScreen page='encuesta'>
            <ProbarFormularioEncuesta/>
        </WScreen>
        <WScreen page='json' menuLabel='json viewer'>
            <RenderDirectJsonApp/>
        </WScreen>
    </Application>;
}

ReactDOM.render(
    <React.StrictMode>
        <CssBaseline />
        <ExampleApplication />
    </React.StrictMode>,
    document.getElementById("main_layout")
)
