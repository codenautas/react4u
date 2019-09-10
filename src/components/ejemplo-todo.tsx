import * as React from "react";
import { createStore } from "redux";
import { Provider, useSelector } from "react-redux"; 

type TodoTask={
    id:string
    content:string
    completed:boolean
};

type TodoState={
    taskList:TodoTask[],
}

const taskList4Example=[
    {id:'T2', content: 'empezar a estudiar Redux', completed:false},
    {id:'T1', content: 'instalar Redux', completed:false},
];

const initialState:TodoState = {
    taskList:taskList4Example,
};

function todoReducer(state:TodoState = initialState){
    return state;
}

const store = createStore(todoReducer); 

export function TodoViewer(){
    const todos = useSelector((todos:TodoState)=>todos.taskList);
    return <table>
        {todos.map(todo=>
            <tr key={todo.id}>
                <td>{todo.id}</td>
                <td>{todo.content}</td>
                <td>{todo.completed?'(listo)':'(en progreso)'}</td>
            </tr>
        )}
    </table>
}

export function EjemploTodo(){
    return <>
        <h1>Este es el ejemplo todo</h1>
        <Provider store={store}>
            <TodoViewer />
        </Provider>,
    </>
}