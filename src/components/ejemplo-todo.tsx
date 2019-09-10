import * as React from "react";
import { createStore } from "redux";
import { Provider, useSelector } from "react-redux"; 

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

function todoReducer(state:TodoState = initialState){
    return state;
}

const store = createStore(todoReducer); 

function TodoTaskRow(props:{id:string}){
    const task = useSelector((todos:TodoState)=>todos.byIds[props.id]);
    return <>
        <tr className={task.completed?"completed":"pending"}>
            <td>{props.id}</td>
            <td>{task.content}</td>
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