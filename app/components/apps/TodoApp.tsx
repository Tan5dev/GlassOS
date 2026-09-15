"use client";

import React, { FormEvent } from "react";
import { Icon } from "@iconify/react";

type Todo = {
  id: string;
  text: string;
  completed: boolean;
};

type TodoAppProps = {
  todos: Todo[];
  setTodos: React.Dispatch<React.SetStateAction<Todo[]>>;
  todoInput: string;
  setTodoInput: (val: string) => void;
  generateId: () => string;
};

export default function TodoApp({
  todos,
  setTodos,
  todoInput,
  setTodoInput,
  generateId,
}: TodoAppProps) {
  const activeCount = todos.filter((t) => !t.completed).length;
  const progress = todos.length
    ? Math.round(
        (todos.filter((t) => t.completed).length / todos.length) * 100,
      )
    : 0;

  const handleAddTodo = (e: FormEvent) => {
    e.preventDefault();
    if (!todoInput.trim()) return;
    setTodos([
      ...todos,
      { id: generateId(), text: todoInput.trim(), completed: false },
    ]);
    setTodoInput("");
  };

  const toggleTodo = (id: string) => {
    setTodos(
      todos.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t)),
    );
  };

  const deleteTodo = (id: string) => {
    setTodos(todos.filter((t) => t.id !== id));
  };

  return (
    <div className="flex flex-col flex-1 bg-zinc-950/60 backdrop-blur-xl p-5 overflow-y-auto text-neutral-200">
      <div className="flex justify-between items-center mb-3 select-none shrink-0">
        <div>
          <h3 className="font-medium text-white text-sm tracking-tight">Tasks</h3>
          <p className="text-neutral-400 text-xs">
            {activeCount} remaining
          </p>
        </div>
        <div className="font-mono text-neutral-300 text-xs">
          {progress}% done
        </div>
      </div>

      <div className="bg-white/10 mb-5 rounded-full w-full h-1 overflow-hidden shrink-0">
        <div
          className="bg-white h-full transition-all duration-300"
          style={{ width: `${progress}%` }}
        ></div>
      </div>

      <form onSubmit={handleAddTodo} className="flex gap-2 mb-5 shrink-0">
        <input
          type="text"
          value={todoInput}
          onChange={(e) => setTodoInput(e.target.value)}
          className="flex-1 bg-white/4 px-3 py-1.5 border border-white/10 rounded-lg outline-none placeholder:text-neutral-500 text-xs transition-colors"
          placeholder="Add task"
        />
        <button
          type="submit"
          className="flex items-center gap-1 bg-white hover:bg-neutral-200 px-3 py-1.5 rounded-lg font-medium text-zinc-950 text-xs transition-colors cursor-pointer"
        >
          <Icon icon="mdi:plus" width={14} />
          <span>Add</span>
        </button>
      </form>

      <div className="flex-1 space-y-2 min-h-0 overflow-y-auto">
        {todos.map((todo) => (
          <div
            key={todo.id}
            className="flex justify-between items-center bg-white/3 hover:bg-white/6 px-3 py-2.5 border border-white/6 rounded-lg transition-colors"
          >
            <div
              className="flex items-center gap-2.5 cursor-pointer"
              onClick={() => toggleTodo(todo.id)}
            >
              <Icon
                icon={
                  todo.completed
                    ? "mdi:checkbox-marked-circle"
                    : "mdi:checkbox-blank-circle-outline"
                }
                className={
                  todo.completed ? "text-emerald-400" : "text-neutral-500"
                }
                width={16}
              />
              <span
                className={`text-xs ${todo.completed ? "line-through text-neutral-500" : "text-neutral-200"}`}
              >
                {todo.text}
              </span>
            </div>
            <button
              onClick={() => deleteTodo(todo.id)}
              className="p-1 rounded text-neutral-500 hover:text-rose-400 transition-colors cursor-pointer"
            >
              <Icon icon="mdi:delete" width={14} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
