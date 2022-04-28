import { v4 as uuidV4 } from "uuid";

type Task = {
  id: string;
  title: string;
  completed: boolean;
  createdAt: Date;
};
const list = document.querySelector<HTMLUListElement>("#list");
const form =
  (document.getElementById("new-task-form") as HTMLFormElement) || null;
const input = document.querySelector<HTMLInputElement>("#new-task-title");
const clearBtn = document.querySelector<HTMLButtonElement>("#clear");
let tasks: Task[] = loadTasks();
tasks.forEach(addListItem);

form?.addEventListener("submit", (e) => {
  e.preventDefault();

  if (input?.value == "" || input?.value == null) return;

  const newTask: Task = {
    id: uuidV4(),
    title: input.value,
    completed: false,
    createdAt: new Date(),
  };

  tasks.push(newTask);

  addListItem(newTask);
  input.value = "";
});

function addListItem(task: Task) {
  const item: any = <HTMLElement>document.createElement("li");
  const label: any = <HTMLElement>document.createElement("label");
  const checkbox = document.createElement("input");
  const editButton = document.createElement("button");
  const editInput: any = <HTMLInputElement>document.createElement("input");
  const delButton = document.createElement("button");

  ifCompleted();

  label.id = task.id;

  editInput.classList.add("edit-input");
  editInput.style.display = "none";

  editButton.textContent = "✔";
  editButton.classList.add("edit-button");
  editButton.style.opacity = "0";

  delButton.innerHTML = "&#10005;";
  delButton.classList.add("del-button");
  checkbox.classList.add("checkbox");
  checkbox.addEventListener("change", () => {
    task.completed = checkbox.checked;
    ifCompleted();
    saveTasks();
  });

  checkbox.type = "checkbox";
  checkbox.checked = task.completed;

  label.append(task.title);
  item.append(checkbox);
  item.append(label);
  item.append(editInput);
  list?.append(item);
  item.append(editButton);
  item.append(delButton);

  const delButtonClicked =
    document.querySelectorAll<HTMLButtonElement>(".del-button");

  delButtonClicked.forEach((button) => {
    button.addEventListener("click", delTask);
  });

  label.addEventListener("click", () => {
    editButton.style.opacity = "1";
    editButton.style.animation = "rotateIn .5s ease-in-out";
    console.log(task.title);
    editInput.style.display = "block";
    editInput.value = label.textContent;
    editInput.style.cursor = "text";
    editInput.focus();
    label.style.display = "none";

    window.addEventListener("click", (e) => {
      if (e.target !== label && e.target !== editInput) {
        task.title = editInput.value;
        label.textContent = editInput.value;
        editInput.style.display = "none";
        label.style.display = "block";
        editButton.style.opacity = "0";
        editButton.style.animation = "rotateOut .5s ease-in-out";
        saveTasks();
      }
    });
  });

  saveTasks();
  tasksCounter();

  function ifCompleted() {
    if (task.completed) {
      label.style.textDecoration = "line-through";
    } else label.style.textDecoration = "none";
  }
}

function delTask() {
  const confirmModal: any = <any>document.createElement("dialog");
  const body = document.querySelector("body");
  body?.append(confirmModal);
  confirmModal.classList.add("modal");
  confirmModal.innerHTML = `<h4>Na pewno usunąć?</h4>
  <div class="answer-buttons">
  <button id="btn-yes">Tak</button>
  <button id="btn-no">Nie</button>
  </div>`;
  confirmModal.showModal();

  const btnYes = document.querySelector<HTMLButtonElement>("#btn-yes");
  const btnNo = document.querySelector<HTMLButtonElement>("#btn-no");

  btnYes?.addEventListener("click", function (this: any) {
    const index = tasks
      .map((e) => e.id)
      .indexOf(this.previousElementSibling.id);

    tasks.splice(index, 1);

    this.closest("li").style.transform = "translateX(-50rem)";
    setTimeout(() => {
      this.closest("li").remove();
      tasksCounter();
    }, 300);
    confirmModal.remove();
    saveTasks();
  });

  btnNo?.addEventListener("click", () => {
    confirmModal.remove();

    return;
  });
}

function saveTasks() {
  localStorage.setItem("TASKS", JSON.stringify(tasks));
}

function loadTasks(): Task[] {
  const taskJSON = localStorage.getItem("TASKS");
  if (taskJSON == null) return [];
  return JSON.parse(taskJSON);
}

clearBtn?.addEventListener("click", () => {
  tasks = [];
  saveTasks();
  tasksCounter();
  const listItems = document.querySelectorAll("li");
  listItems.forEach((item) => {
    item.style.transform = "translateX(-50rem)";
    setTimeout(() => {
      item.remove();
      tasksCounter();
    }, 300);
  });
});

// counts task and returns in app title
function tasksCounter() {
  const taskLength = document.querySelectorAll("li").length;
  const appTitle = document.querySelector<HTMLUListElement>("h1");

  if (taskLength > 10) {
    appTitle!.style.color = "orange";
  } else {
    appTitle!.style.color = "white";
  }

  appTitle!.textContent = `Todo list (${taskLength})`;
}
