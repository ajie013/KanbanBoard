import KanbanBoard from "./model/KanbanBoard.js";
import { Modal } from "./model/Modal.js";
import { Project } from "./types/Project.js";
import { ColumnStatus, Task } from "./types/Task.js";

let projectList: Project[] = [
  { id: 1, name: "Default Project", board: new KanbanBoard() }
];

let selectedProject: Project | null = null;
let currentTask: Task | null = null;

// DOM ELEMENTS
const sidebar = document.getElementById("sidebar") as HTMLDivElement;
const hamburger = document.getElementById("hamburger") as HTMLButtonElement;
const closeBtn = document.querySelector('.sidebar-close') as HTMLButtonElement;
const noProjectWrapper = document.querySelector(".no-project") as HTMLDivElement;
const projectListWrapper = document.querySelector(".project-list") as HTMLDivElement;
const projectListWrapperSide = document.querySelector("#projectList") as HTMLDivElement;
const board = document.getElementById("board") as HTMLDivElement;
const boardTitle = document.getElementById("boardTitle") as HTMLHeadingElement;
const backBtn = document.getElementById("backBtn") as HTMLButtonElement;
const mainContent = document.querySelector('.main-content') as HTMLDivElement;

//TOAST
const toastWrapper = document.querySelector('.toast-wrapper') as HTMLDivElement;
const toastTitle = document.querySelector('.toast-title') as HTMLDivElement;
const toastContent = document.querySelector('.toast-content') as HTMLDivElement;
const toastClose = document.querySelector('.toast-close') as HTMLDivElement;

// TASK WRAPPERS
const toDoWrapper = document.querySelector(".todo .task-list") as HTMLDivElement;
const inProgressWrapper = document.querySelector(".in-progress .task-list") as HTMLDivElement;
const reviewWrapper = document.querySelector(".review .task-list") as HTMLDivElement;
const doneWrapper = document.querySelector(".done .task-list") as HTMLDivElement;
const addTaskBtn = document.querySelector(".add-task-btn") as HTMLButtonElement;

// PROJECT MODAL
const projectNameInput = document.getElementById("projectName") as HTMLInputElement;
const saveProjectBtn = document.getElementById("saveProject") as HTMLButtonElement;
const cancelProjectBtn = document.getElementById("cancelProject") as HTMLButtonElement;
const addProjectBtn = document.querySelectorAll(".addProjectBtn");

// TASK MODAL
const taskTitleInput = document.getElementById("taskTitle") as HTMLInputElement;
const taskDescInput = document.getElementById("taskDescription") as HTMLTextAreaElement;
const saveTaskBtn = document.getElementById("saveTask") as HTMLButtonElement;
const cancelTaskBtn = document.getElementById("cancelTask") as HTMLButtonElement;

// VIEW MODAL
const viewTitle = document.getElementById("viewTaskTitle") as HTMLHeadingElement;
const viewDesc = document.getElementById("viewTaskDescription") as HTMLParagraphElement;
const editBtn = document.getElementById("editTaskBtn") as HTMLButtonElement;
const closeViewBtn = document.getElementById("closeTaskView") as HTMLButtonElement;

const editTitle = document.getElementById("editTaskTitle") as HTMLInputElement;
const editDesc = document.getElementById("editTaskDescription") as HTMLTextAreaElement;
const cancelEditBtn = document.getElementById("cancelEditTask") as HTMLButtonElement;
const saveEditBtn = document.getElementById("saveEditTask") as HTMLButtonElement;

const taskViewMode = document.getElementById("taskViewMode") as HTMLDivElement;
const taskEditMode = document.getElementById("taskEditMode") as HTMLDivElement;

//Modal instance
const projectModal = new Modal("projectModal", "modalOverlay");
const taskModal = new Modal("taskModal", "taskOverlay" );
const viewModal = new Modal("taskViewModal", "taskViewOverlay");

projectModal.onClose(() =>{
    projectNameInput.value = "";
})

taskModal.onClose(() =>{
  taskTitleInput.value = "";
  taskDescInput.value = "";
})

viewModal.onOpen((task) => {
   if (!task) return;
   currentTask = task; 
   viewTitle.textContent = task.title;
   viewDesc.textContent = task.description;
})

viewModal.onClose(() => {
  currentTask = null; 
  taskViewMode.classList.remove("hidden");
  taskEditMode.classList.add("hidden");
})

const showToast = (title: string, content: string) =>{
  toastWrapper.style.display = "block"
  toastTitle.innerHTML = title;
  toastContent.innerHTML = content;

  setTimeout(() => {
    toastWrapper.style.display = "none"
    toastContent.innerHTML = "";
    toastTitle.innerHTML = ""
  }, 2000);
}

toastClose.addEventListener("click", () =>{
  toastWrapper.style.display = "none"
  toastContent.innerHTML = "";
  toastTitle.innerHTML = ""
})

//Render projects on sidebar
function displayProjectsSideBar() {
  projectListWrapperSide.innerHTML = projectList.map(p => `
    <div class="project-item sidebar-item ${selectedProject?.id === p.id ? 'active' : ''}" data-id="${p.id}">
      <span><i class="fa-solid fa-folder" style="color: var(--primary); margin-right: 6px;"></i> ${p.name}</span>
    </div>
  `).join("");
}

//Render task items on each board
function displayTaskItem(status: ColumnStatus, wrapper: HTMLDivElement) {
  if (!selectedProject) return;

  wrapper.innerHTML = selectedProject.board
    .getTasksByStatus(status)
    .map(task => `
        <div class="task-item" draggable="true" data-id="${task.id}">
            <strong>${task.title}</strong>
            <p>${task.description || 'No description provided.'}</p>
            <button class="delete-task-btn btn btn-secondary" style="align-self: flex-end; padding: 0.25rem 0.5rem; font-size: 0.75rem; border-radius: 4px; border: none; background: transparent;" data-id="${task.id}" title="Delete Task">
            <i class="fa-solid fa-trash-can"></i>
            </button>
        </div>
    `).join("");
    
}

let draggedTaskElement: HTMLElement | null = null;

function setupDragAndDrop() {
  const columns = [
    { wrapper: toDoWrapper, status: "todo" as ColumnStatus },
    { wrapper: inProgressWrapper, status: "in-progress" as ColumnStatus },
    { wrapper: reviewWrapper, status: "review" as ColumnStatus },
    { wrapper: doneWrapper, status: "done" as ColumnStatus }
  ];

  columns.forEach(({ wrapper, status }) => {

    wrapper.addEventListener("dragover", (e) => {
        console.log(e)
      e.preventDefault(); // REQUIRED
    });

    wrapper.addEventListener("drop", (e) => {
      e.preventDefault();

      if (!selectedProject) return;

      const id = Number(
        e.dataTransfer?.getData("text/plain") ||
        draggedTaskElement?.dataset.id
      );

      if (!id) return;

      selectedProject.board.updateTaskStatus(id, status);


      draggedTaskElement = null;

      render();
      showToast("Task Moved", `Moved to ${status}`);
    });
  });
}

document.addEventListener("dragstart", (e) => {
  const el = (e.target as HTMLElement).closest(".task-item") as HTMLElement;
  
  if (!el) return;

  draggedTaskElement = el;

  e.dataTransfer?.setData("text/plain", el.dataset.id || "");
  e.dataTransfer!.effectAllowed = "move";
});

//Reponsible for re-rendering elements when there's an upate in the DOM
function render() {
  displayProjectsSideBar();

  if (projectList.length === 0) {
    noProjectWrapper.style.display = "block";
    projectListWrapper.innerHTML = "";
    board.classList.add("hidden");
    return;
  }

  if (!selectedProject) {
    noProjectWrapper.style.display = "none";
    projectListWrapper.classList.remove("hidden");
    board.classList.add("hidden");

    projectListWrapper.innerHTML = projectList.map(p => `
      <div class="project-item" data-id="${p.id}">
        <span><i class="fa-solid fa-folder" style="color: var(--primary); margin-right: 8px;"></i> ${p.name}</span>
        <button class="delete-project-btn" data-id="${p.id}" title="Delete Project">
          <i class="fa-solid fa-trash"></i>
        </button>
      </div>
    `).join("");
    return;
  }

  noProjectWrapper.style.display = "none";
  projectListWrapper.innerHTML = "";
  board.classList.remove("hidden");
  boardTitle.textContent = selectedProject.name;

  displayTaskItem("todo", toDoWrapper);
  displayTaskItem("in-progress", inProgressWrapper);
  displayTaskItem("review", reviewWrapper);
  displayTaskItem("done", doneWrapper);
}

//Related events for SideBar
const sideBarEvent= () =>{
  hamburger.addEventListener("click", () => sidebar.classList.toggle("open"));
  closeBtn.addEventListener("click", () => sidebar.classList.remove("open"));
}

//PROJECT OPERATION
const addProject = () =>{
  const name = projectNameInput.value.trim();

  if (!name) return;

  projectList.push({ id: Date.now(), name, board: new KanbanBoard() });

  projectModal.close();
  sidebar.classList.remove('open');
  render();

  showToast("Project Created", "The project was created successfully.")
}

const deleteProject = (projectId: number) =>{
  projectList = projectList.filter(p => p.id !== projectId);

  if (selectedProject?.id === projectId) selectedProject = null;

  render();
  showToast("Project Deleted", "The project was removed successfully.")
}

//TASK OPERATIONS
const onAddTask = () =>{
  if (!selectedProject) return;

  const title = taskTitleInput.value.trim();
  const desc = taskDescInput.value.trim();

  if (!title) return;

  selectedProject.board.addTask(title, desc);
  
  taskModal.close()
  render();

  showToast("Task Added", "The task was added successfully.")
}

const onUpdateTask = () =>{
  if (!selectedProject || !currentTask) return;
  
  const updatedTitle = editTitle.value.trim();
  if (!updatedTitle) return; 

  selectedProject.board.updateTaskDetails(currentTask.id, {
    title: updatedTitle,
    description: editDesc.value.trim()
  });

  viewModal.close(); 
  render(); 
  showToast("Task Updated", "The task was updated successfully.")
}

const onDeleteTask = (taskId: number) =>{
  selectedProject?.board.deleteTask(taskId);

  render();
  showToast("Task Deleted", "The task was removed successfully.")
}

//For selecting a project inside the SideBar
const projectListSideEvents = () =>{
  projectListWrapperSide.onclick = (e) => {
    const target = e.target as HTMLElement;
    const projectEl = target.closest(".project-item") as HTMLElement;
    if (!projectEl) return;

    const id = Number(projectEl.dataset.id);
    selectedProject = projectList.find(p => p.id === id) || null;
    render();
  };
}

//Showin/Closing the modal
const projectCreationEvents = () =>{
  addProjectBtn.forEach(btn => btn.addEventListener('click', () => projectModal.open()));
  cancelProjectBtn.addEventListener("click", () => projectModal.close());
  projectModal.close();

  saveProjectBtn.addEventListener("click", addProject)
}

//Showin/Closing the modal
const taskCreationEvents = () =>{
  addTaskBtn.addEventListener("click", () => {
    if(selectedProject) taskModal.open()
  });

  cancelTaskBtn.addEventListener("click", () => taskModal.close());
  
  saveTaskBtn.addEventListener("click", onAddTask)
  
  taskModal.close()
}

const taskBoardsEvent = () =>{
  [toDoWrapper, inProgressWrapper, reviewWrapper, doneWrapper].forEach(wrapper => {
    wrapper.onclick = (e) => {
      const target = e.target as HTMLElement;
      const taskEl = target.closest(".task-item") as HTMLElement;

      if (!taskEl) return;

      const id = Number(taskEl.dataset.id);
      const task = selectedProject?.board.getAllTasks().find(t => t.id === id);

      if (!task) return;

      if (target.closest(".delete-task-btn")) {
        e.stopPropagation();
        onDeleteTask(id);

        return;
      }

      viewModal.open(task)
    };
  });
}

//Events when selecting a project and deleting a project
const projectListMainEvents = () =>{
  projectListWrapper.onclick = (e) => {
    const target = e.target as HTMLElement;
    const projectEl = target.closest(".project-item") as HTMLElement;
    if (!projectEl) return;

    const id = Number(projectEl.dataset.id);

    if (target.closest(".delete-project-btn")) {
      deleteProject(id)

      return;
    }

    selectedProject = projectList.find(p => p.id === id) || null;
    render();
  };
}

const viewAndEditTaskEvent = () => {
  closeViewBtn.addEventListener("click", viewModal.close);
  viewModal.close();
  
  editBtn.addEventListener("click", () => {
    if (!currentTask) return;

    editTitle.value = currentTask.title;
    editDesc.value = currentTask.description;
    
    taskViewMode.classList.add("hidden");
    taskEditMode.classList.remove("hidden");
  });

  cancelEditBtn.addEventListener("click", () => {
    taskEditMode.classList.add("hidden");
    taskViewMode.classList.remove("hidden");
  });

  saveEditBtn.addEventListener("click", onUpdateTask)
}

/* GLOBAL EVENT DELEGATION & LISTENERS */
function setupEventListeners() {
  sideBarEvent();
  projectListMainEvents();
  projectListSideEvents();
  projectCreationEvents();
  taskCreationEvents();
  taskBoardsEvent();
  viewAndEditTaskEvent();
  setupDragAndDrop();

  mainContent.onclick = (e) =>{
    sidebar.classList.remove('open')
  }
  
  backBtn.addEventListener("click", () => {
    selectedProject = null;
    render();
  });
}

setupEventListeners();
render();