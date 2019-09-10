import * as React from "react";
import { createStore } from "redux";
import { Provider, useSelector, useDispatch } from "react-redux"; 
import { SvgIcon } from "@material-ui/core";

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
        return {
            ...state,
            allIds: [...state.allIds, id],
            byIds: {
                ...state.byIds,
                [id]: {
                    content,
                    completed: false
                }
            }
        };
    }
    case TOGGLE_TODO: {
        const { id } = action.payload;
        var selTask = state.byIds[id];
        return {
            ...state,
            byIds:{
                ...state.byIds,
                [id]:{
                    ...selTask,
                    completed: !selTask.completed
                }
            }
        };
    }
    default:
        return state;
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

function TodoViewer(){
    const ids = useSelector((todos:TodoState)=>todos.allIds);
    return <table className="ejemplo-todo">
        {ids.map(id=>
            <TodoTaskRow key={id} id={id}/>
        )}
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