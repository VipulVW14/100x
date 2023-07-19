import React from "react";
import { useState } from "react";

function useTodos(){
  const [todos, setTodo]=useState([])

  React.useEffect(()=>{
    fetch("http://localhost:3000/todos").then((response)=>{
      response.json().then((data)=>{
        console.log(data);
      })
    })
  })

  setInterval(() => {
    fetch("http://localhost:3000/todos").then((response)=>{
      response.json().then((data)=>{
        console.log(data);
      })
    })
  }, 1000);
}

function App() {
  const todos= useTodos();
  
  return (
    <div>
      {todos.map((todo)=>{
       return <Todo title={todo.title} description={todo.description}/>
      })}
    </div>
  )
}

function Todo(props){
  return <div>
    {props.title}
    {props.description }
    <button>Delete</button>
  </div>
}

export default App
