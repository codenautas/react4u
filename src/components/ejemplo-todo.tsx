import * as React from "react";
import { useState } from "react";
import { createStore } from "redux";
import { Provider, useSelector, useDispatch } from "react-redux"; 
import { Dialog, DialogTitle, DialogContent, DialogContentText, TextField, DialogActions, Button } from "@material-ui/core";
import { deepFreeze } from "best-globals";

///////// ESTADO:
type TodoTask={
    content:string
    completed:boolean
};

type TodoState={
    allIds:string[]
    byIds:{[id:string]:TodoTask},
}

const taskList4Example={
    T1: {content: 'instalar Redux', completed:true},
    T2: {content: 'empezar a estudiar Redux', completed:false},
    T3: {content: 'enseñarle a los demás', completed:false},
};

const initialState:TodoState = {
    allIds: Object.keys(taskList4Example),
    byIds:  taskList4Example
};

/////////// CONTROLADOR
const ADD_TODO='ADD_TODO';
const TOGGLE_TODO='TOGGLE_TODO';

type TodoActionAdd = {type:'ADD_TODO', payload:{id:string, content:string}};
type TodoActionToggle = {type:'TOGGLE_TODO', payload:{id:string}};
type TodoAction = TodoActionAdd | TodoActionToggle;

function todoReducer(state:TodoState = initialState, action:TodoAction) {
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
            }
        });
    }
    default:
        return deepFreeze(state);
    }
}

const store = createStore(todoReducer); 

/////////////// VISTA:
function TodoTaskRow(props:{id:string}){
    const task = useSelector((todos:TodoState)=>todos.byIds[props.id]);
    const dispatch = useDispatch();
    return <>
        <tr className={task.completed?"completed":"pending"}>
            <td>{props.id}</td>
            <td>{task.content}</td>
            <td onClick={_=>
                dispatch({type:'TOGGLE_TODO', payload:{id:props.id}})
            }>{task.completed?"✔":"✘"}</td>
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
            }>+</td>
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
    const ids = useSelector((todos:TodoState)=>todos.allIds);
    return <table className="ejemplo-todo">
        {ids.map(id=>
            <TodoTaskRow key={id} id={id}/>
        )}
        <TodoAddRow/>
    </table>
}

export function EjemploTodo(){
    return <>
        <h1>TO DO</h1>
        <Provider store={store}>
            <TodoViewer />
        </Provider>,
    </>
}