import * as React from "react";
import { useState } from "react";
import { AppBar, Menu, MenuItem, Toolbar, Button, IconButton } from "@material-ui/core";
import { makeStyles, SvgIcon, Typography } from "@material-ui/core";

export function Conditional(props:{visible:boolean, children:any}){
    return props.visible?<>
        {props.children}
    </>:null;
}

type Children = React.ReactElement;

export function WScreen(props:{page:string, menuLabel?:string, children:Children}){
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
}));

export function Application(props:{children:Children[]}){
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
