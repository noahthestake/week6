/**
 * ISIT 300 — Week 6 Class 1 scaffold
 *
 * Goal by end of class:
 *   Submit the form → a simple list item appears.
 *   Nothing is saved yet. Refresh clears the list (Class 2 fixes that).
 *
 * Prefer const and let. Avoid var in new code (function-scoped and easier to misuse).
 */

// ---------------------------------------------------------------------------
// 1) Select the DOM nodes you will use (CSS selectors you already know).
// ---------------------------------------------------------------------------
// TODO(student): use document.querySelector to select:
//   - the form (#todo-form)
//   - the title input (#todo-title)
//   - the list (#todo-list)
//   - the empty-state paragraph (#empty-state)
//   - the count element (#todo-count)
// Example:
//   const form = document.querySelector("#todo-form");
const STORAGE_KEY = "todos";
const todoForm = document.querySelector("#todo-form");
const todoTitle = document.querySelector("#todo-title");
const todoList = document.querySelector("#todo-list");
const emptyState = document.querySelector("#empty-state");
const todoCount = document.querySelector("#todo-count");
const todoSortButton = document.querySelector("#todo-sort-button");
const notesEl = document.querySelector("#todo-notes");
const dueEl = document.querySelector("#todo-due");

// ---------------------------------------------------------------------------
// 2) Keep a simple in-memory count for Class 1 (preview of "state").
// ---------------------------------------------------------------------------
// TODO(student): declare a let variable for how many items you have added.
// Class 2 will replace this with an array of todo objects.
let todoCounter = 0;
let todoTaskSort = "asc";
let todos = loadTodos();


// ---------------------------------------------------------------------------
// 3) Helper: update the empty state and count text.
// ---------------------------------------------------------------------------
// TODO(student): write a function updateListMeta() that:
//   - hides #empty-state when the list has children, shows it when empty
//   - sets #todo-count text to "N item" / "N items"
function updateListMeta() {
    const n = todos.length || 0;
    emptyState.hidden = n > 0;
    todoCount.textContent = n === 1 ? "1 item" : `${n} items`;
}
// ---------------------------------------------------------------------------
// 4) Helper: append one simple list item (title text only for Class 1).
// ---------------------------------------------------------------------------
// TODO(student): write a function addTodoItem(title) that:
//   - creates an <li class="todo-item">
//   - puts the title in a <p class="todo-title">
//   - appends the <li> to #todo-list
//   - logs the title with console.log for DevTools practice
// Later classes will turn this into a full object with completed + dueDate.
function addTodoItem(item) {
    const li = document.createElement("li");
    li.classList.add("todo-item");
    const p = document.createElement("p");
    p.classList.add("todo-title");
    p.textContent = item;
    li.appendChild(p);
    todoList.appendChild(li);
    console.log(item);
}

// ---------------------------------------------------------------------------
// 5) Listen for the form submit event.
// ---------------------------------------------------------------------------
// TODO(student): form.addEventListener("submit", function (event) { ... })
// Inside the handler:
//   - call event.preventDefault() so the page does not reload
//   - read the title value (trim whitespace)
//   - if the title is empty, console.warn and return
//   - call addTodoItem(title)
//   - clear the title input
//   - call updateListMeta()
//   - optionally form.reset() if you also want notes/date cleared
todoForm.addEventListener("submit", function(event){
    event.preventDefault();
    const title = todoTitle.value.trim();
    const notes = notesEl.value.trim();
    const dueDate = dueEl.value.trim();
    
    if(title === "") {
        console.warn("Title is empty");
        todoTitle.focus();
        return;
    }

    createTodo(title, notes, dueDate);
    todoForm.reset();
    todoTitle.focus();
});


todoSortButton.addEventListener("click", function(event){
    event.preventDefault();
    todoSortButton.textContent = "Done";
    if(todoTaskSort === "asc") {
        todoSortButton.textContent = "DESCENDING";
        todoTaskSort = "desc";
    } else {
        todoSortButton.textContent = "ASCENDING";
        todoTaskSort = "asc";
    }
    sortTodos();
    saveTodos(todos);
    renderTodos();
    console.log("Sort button clicked");
});
// ---------------------------------------------------------------------------
// 6) Initial UI state
// ---------------------------------------------------------------------------
// TODO(student): call updateListMeta() once when the script loads
// so the empty state and count look correct before any submits.


// (1)
function sortTodos() {
    try {
        if (todoTaskSort === "asc") {
        todos.sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
        } else {
        todos.sort((a, b) => new Date(b.dueDate) - new Date(a.dueDate));
        }
        console.log(todos);
    } catch(error) {
        console.error("Error sorting todos:", error);
        return false;
    }
}


//(2)
function loadTodos() {
    try {
        const data = localStorage.getItem(STORAGE_KEY); 
        if(!data) return [];
        return JSON.parse(data);
    } catch(error) {
        console.error("Todo data is not initialized correctly", error);
        return [];
    }
}

function saveTodos(currentTodos) {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(currentTodos));
    } catch(error) {
        console.error("Error saving todos:", error);
        return false;
    }
    return true;
}


// (3)
function renderTodos() {
    try {
        todoList.innerHTML = "";
        todos.forEach(todo => {
            const li = document.createElement("li");
            li.className = "todo-item";
            li.id = todo.id;
            li.innerHTML = `
                <div class="todo-body">
                    <h3 class="todo-title">${todo.title}</h3>
                    <p class="todo-notes">${todo.notes || ""}</p>
                    <p class="todo-due">${todo.dueDate || ""}</p>
                    <button class="todo-delete">Delete</button>
                </div>
                <div class="todo-controls">
                    <input type="checkbox" class="todo-complete" ${todo.completed ? "checked" : ""} data-id="${todo.id}">
                </div>
             `;
            li.querySelector(".todo-complete").addEventListener("change", (event) => toggleTodo(todo.id));
            li.querySelector(".todo-delete").addEventListener("click", () => deleteTodo(todo.id));
            todoList.appendChild(li);
        });
        updateListMeta();
    } catch(error) {
        console.error("Error rendering todos:", error);
    }
}

// (4)
function createTodo(title, notes, dueDate) {
    try {
        const id = String(Date.now());
        const todo = {
            id,
            title,
            notes,
            dueDate,
            completed: false,
            createdAt: new Date().toISOString()
        };

        todos.push(todo);
        sortTodos();
        saveTodos(todos);
        renderTodos();
        console.log("Created todo");
    } catch(error) {
        console.error("Error creating todo:", error);
        return false;
    }
    return true;
}

function toggleTodo(id) {
    try {
        const index = todos.findIndex(currentTodo => currentTodo.id === id);
        if( index === -1) return false;
        todos[index].completed = !todos[index].completed;
        saveTodos(todos);
        renderTodos();
    } catch (error) {
        console.error("Error toggling todo:", error);
        return false;
    }
    return true;
}

function deleteTodo(id) {
    try {
        todos = todos.filter(currentTodo => currentTodo.id !== id);
        sortTodos();
        saveTodos(todos);
        renderTodos();
    }catch(error) {
        console.error("Error deleting todo:", error);
        return false;
    }
    return true;
}

renderTodos();
