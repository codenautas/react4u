import * as React from "react";
import { useState, useEffect } from "react";
import { createStore } from "redux";
import { Provider, useSelector, useDispatch } from "react-redux"; 
import { Dialog, DialogTitle, DialogContent, DialogContentText, TextField, DialogActions, Button, SvgIcon } from "@material-ui/core";
import { deepFreeze } from "best-globals";
import { ProgressLine } from "./progress";
import { fetchAndDispatch, materialIoIconsSvgPath } from "./marcos";

///////// ESTADO:
type TodoTask={
    content:string
    completed:boolean
};

type TodoState={
    allIds:string[]
    byIds:{[id:string]:TodoTask},
    repo:{
        localTimeStamp: number|null,
        serverTimeStamp: number|null,
        saving: boolean|null,
        loading: boolean|null,
        lastError: Error|null,
    }
}

const taskList4Example={
    T1: {content: 'instalar Redux', completed:true},
    T2: {content: 'empezar a estudiar Redux', completed:false},
    T3: {content: 'enseñarle a los demás', completed:false},
};

const initialState:TodoState = {
    allIds: Object.keys(taskList4Example),
    byIds:  taskList4Example,
    repo:{
        localTimeStamp: null,
        serverTimeStamp: null,
        loading: null,
        saving: false,
        lastError: null
    }
};

/////////// CONTROLADOR
const ADD_TODO   ='ADD_TODO';
const TOGGLE_TODO='TOGGLE_TODO';
const FETCHED    ='FETCHED';
const SAVED      ='SAVED';
const TX_ERROR   ='TX_ERROR';
const LOADING    ='LOADING';
const SAVING     ='SAVING';

type TodoActionAdd = {type:'ADD_TODO', payload:{id:string, content:string}};
type TodoActionToggle = {type:'TOGGLE_TODO', payload:{id:string}};
type TodoActionSaved = {type:'SAVED', payload:{timestamp:number}};
type TodoActionFetched = {type:'FETCHED', payload:{content:TodoState, timestamp:number}};
type TodoActionTxError = {type:'TX_ERROR', payload:Error};
type TodoActionLoading = {type:'LOADING'};
type TodoActionSaving = {type:'SAVING'};
type TodoAction = TodoActionAdd | TodoActionToggle | TodoActionSaved | TodoActionFetched | TodoActionTxError | TodoActionLoading | TodoActionSaving;

function todoReducer(state:TodoState = initialState, action:TodoAction):TodoState {
    switch (action.type) {
    case ADD_TODO: {
        const { id, content } = action.payload;
        return deepFreeze({
            ...state,
            allIds: [...state.allIds, id],
            byIds: {
                ...state.byIds,
                [id]: {
                    content,
                    completed: false
                }
            },
            repo:{
                ...state.repo,
                localTimeStamp: new Date().getTime()
            }
        });
    }
    case TOGGLE_TODO: {
        const { id } = action.payload;
        var selTask = state.byIds[id];
        return deepFreeze({
            ...state,
            byIds:{
                ...state.byIds,
                [id]:{
                    ...selTask,
                    completed: !selTask.completed
                }
            },
            repo:{
                ...state.repo,
                localTimeStamp: new Date().getTime()
            }
        });
    }
    case FETCHED: {
        return deepFreeze({
            ...action.payload.content,
            repo:{
                localTimeStamp:action.payload.timestamp,
                serverTimeStamp:action.payload.timestamp,
                lastError:null,
                loading:false
            }
        });
    }
    case SAVED: {
        return deepFreeze({
            ...state,
            repo:{
                localTimeStamp:action.payload.timestamp,
                serverTimeStamp:action.payload.timestamp,
                lastError:null,
                saving:false
            }
        });
    }
    case TX_ERROR: {
        return deepFreeze({
            ...state,
            repo:{
                ...state.repo,
                lastError:action.payload,
                saving:false,
                loading:false
            }
        });
    }
    case LOADING: {
        return deepFreeze({
            ...state,
            repo:{
                ...state.repo,
                loading:true
            }
        });
    }
    case SAVING: {
        return deepFreeze({
            ...state,
            repo:{
                ...state.repo,
                saving:true
            }
        });
    }
    default:
        return deepFreeze(state);
    }
}

function loadState():TodoState{
    var content = localStorage.getItem('ejemplo-todo');
    if(content){
        var state:TodoState = JSON.parse(content);
        return {
            ...state,
            repo:{
                ...state.repo,
                loading: null,
                saving: false,
                lastError: null
            }
        };
    }else{
        return initialState;
    }
}

function saveState(state:TodoState){
    localStorage.setItem('ejemplo-todo', JSON.stringify(state));
}

const store = createStore(todoReducer, loadState()); 
store.subscribe(function(){
    saveState(store.getState());
});

/////////////// VISTA:
function TodoTaskRow(props:{id:string}){
    const task = useSelector((todos:TodoState)=>todos.byIds[props.id]);
    const dispatch = useDispatch();
    return <>
        <tr className={task.completed?"completed":"pending"}>
            <td className="todo-id">{props.id}</td>
            <td className="todo-content">{task.content}</td>
            <td className="todo-checkbox" onClick={_=>
                dispatch({type:'TOGGLE_TODO', payload:{id:props.id}})
            }>{task.completed?
                <SvgIcon><path d={materialIoIconsSvgPath.CheckBoxOutlined}/></SvgIcon>
            :
                <SvgIcon><path d={materialIoIconsSvgPath.CheckBoxOutlineBlankOutlined}/></SvgIcon>
            }</td>
        </tr>
    </>;
}

function TodoAddRow(){
    const [dialog, setDialog] = useState<{id:string, content?:string}|null>(null);
    const dispatch = useDispatch();
    const handleClose = ()=>setDialog(null)
    return <>
        <tr className="add-task">
            <th></th>
            <th></th>
            <td onClick={_=>
                setDialog({id:'T'+Math.random().toString().slice(14)})
            }>
                <SvgIcon>
                    <path d={materialIoIconsSvgPath.Add}/>
                </SvgIcon>
            </td>
        </tr>
        <Dialog open={!!dialog} onClose={handleClose}>
            <DialogTitle id="form-dialog-title">Subscribe</DialogTitle>
            <DialogContent>
                <DialogContentText>
                    Agregar una nueva tarea
                </DialogContentText>
                <TextField
                    margin="dense"
                    id="id"
                    label="id"
                    type="text"
                    value={dialog && dialog!.id}
                    onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                        setDialog({...dialog, id:event.target.value})
                    }}
                />
                <TextField
                    autoFocus
                    margin="dense"
                    id="content"
                    label="Tarea"
                    type="text"
                    fullWidth
                    onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                        setDialog({...dialog!, content:event.target.value})
                    }}
                />
            </DialogContent>
            <DialogActions>
            <Button onClick={handleClose} color="secondary">
                Cancelar
            </Button>
            <Button disabled={ dialog==null || !dialog.id || !dialog.content } variant="outlined" onClick={_=>{
                dispatch({type:'ADD_TODO', payload:dialog})
                setDialog(null);
            }} color="primary">
                Agregar
            </Button>
            </DialogActions>        
        </Dialog>
    </>;
}

function TodoViewer(){
    const {repo, ...state} = useSelector((todos:TodoState)=>todos);
    const {allIds} = state;
    const {loading,saving,lastError,localTimeStamp,serverTimeStamp} = repo;
    const saved = localTimeStamp==null || serverTimeStamp!=null && localTimeStamp<=serverTimeStamp;
    const dispatch = useDispatch();
    useEffect(()=>{
        if(loading==null){
            fetchAndDispatch('file-read?file=ejemplo-todo.json', dispatch, 'LOADING', 'FETCHED');
        }
    },[loading])
    return <>
        {lastError!=null?(
            lastError.code==404?
                <div>Nuevo</div>
            :<> 
                <div style={{color:'red'}}>{lastError.message}</div>
                { lastError.details?<div style={{color:'red'}}>{lastError.details}</div>:null }
            </>
        ):null}
        {loading?<ProgressLine/>:null}
        {saving?<ProgressLine color="secondary" />:null}
        <table className="ejemplo-todo">
            <tbody>
                <tr>
                    <td className="todo-title" colSpan={2}>TO DO</td>
                    <td className="todo-save" >
                        <SvgIcon className={saved?'todo-saved':'todo-dirty'}
                            onClick={_=>{
                                if(!saving){
                                    fetchAndDispatch('file-write?file=ejemplo-todo.json', dispatch, 'SAVING', 'SAVED',JSON.stringify(state));
                                }
                            }}
                        >
                            <path d={materialIoIconsSvgPath.Save}/>
                        </SvgIcon>
                    </td>
                </tr>
                {allIds.map(id=>
                    <TodoTaskRow key={id} id={id}/>
                )}
            </tbody>
            <TodoAddRow/>
        </table>
    </>
}

export function EjemploTodo(){
    return <>
        <h1>TO DO</h1>
        <Provider store={store}>
            <TodoViewer />
        </Provider>,
    </>
}