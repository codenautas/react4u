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
    {id:'T1', content: 'instalar Redux', completed:true},
    {id:'T2', content: 'empezar a estudiar Redux', completed:false},
    {id:'T2', content: 'enseñarle a los demás', completed:false},
];

const initialState:TodoState = {
    taskList:taskList4Example,
};

function todoReducer(state:TodoState = initialState){
    return state;
}

const store = createStore(todoReducer); 

function TodoTaskRow(props:{todo:TodoTask}){
    var todo = props.todo;
    return <>
        <tr className={todo.completed?"completed":"pending"}>
            <td>{todo.id}</td>
            <td>{todo.content}</td>
        </tr>
    </>;
}

function TodoViewer(){
    const todos = useSelector((todos:TodoState)=>todos.taskList);
    return <table className="ejemplo-todo">
        {todos.map(todo=>
            <TodoTaskRow key={todo.id} todo={todo}/>
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