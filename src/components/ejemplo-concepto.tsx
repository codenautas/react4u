import * as React from "react";
import {useState, useRef, useEffect, useImperativeHandle, createRef, forwardRef} from "react";
import {changing} from "best-globals";
import * as likeAr from "like-ar";

import {Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle} from '@material-ui/core';

export function ButtonWithAlertDialog() {
  const [open, setOpen] = React.useState(false);

  function handleClickOpen() {
    setOpen(true);
  }

  function handleClose() {
    setOpen(false);
  }

  return (
    <div>
      <Button variant="outlined" color="primary" onClick={handleClickOpen}>
        Motivación
      </Button>
      <Dialog
        open={open}
        onClose={handleClose}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">{"¿Puede ser react un modo de mejorar el front-end?"}</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            Este es un ejemplo de pruebas de concepto que estamos haciendo en react
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="primary">
            Flojo
          </Button>
          <Button onClick={handleClose} color="primary" autoFocus>
            Interesante
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}

type TripleDatoType = {uno:string, dos:number, tres:Date};

function TripleDatoConTimestamp(props:TripleDatoType & {timestamp:Date}){
    return <span title={props.timestamp.toISOString()}>
        <span>{props.uno} </span>
        <b> {props.dos.toString()} </b>
        <span> {props.tres.toLocaleDateString()} </span>
        <ButtonWithAlertDialog/>
    </span>;
}

function TripleDato(props:TripleDatoType){
    var params = {timestamp:new Date(), ...props};
    return <TripleDatoConTimestamp {...params}/>;
}

export function HolaMundo(props:TripleDatoType & {mensaje:string}){
    var {mensaje, ...tripleDato} = props;
    return <h1>
        <i>{mensaje} </i>
        <TripleDato {...tripleDato}/>
    </h1>
}