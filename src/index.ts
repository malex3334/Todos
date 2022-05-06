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
  let currentCheckbox: boolean;
  ifCompleted();

  label.id = task.id;
  item.setAttribute("draggable", true);
  item.classList.add("draggable");
  editInput.classList.add("edit-input");
  editInput.style.display = "none";

  editButton.textContent = "✔";
  editButton.classList.add("edit-button");
  editButton.style.opacity = "0";

  delButton.innerHTML = "&#10005;";
  delButton.classList.add("del-button");
  checkbox.classList.add("checkbox");
  checkbox.dataset.checked = <any>task.completed;
  checkbox.addEventListener("change", () => {
    task.completed = checkbox.checked;
    ifCompleted();
    saveTasks();
    currentCheckbox = checkbox.checked;
    checkboxStateSet(currentCheckbox);
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

  delButtonClicked.forEach((button: any) => {
    button.addEventListener("click", delTask);
  });

  label.addEventListener("click", () => {
    editButton.style.opacity = "1";
    editButton.style.animation = "rotateIn .5s ease-in-out";

    editInput.style.display = "block";
    editInput.value = label.textContent;
    editInput.style.cursor = "text";
    editInput.focus();
    label.style.display = "none";

    // CONFIRM EDITION
    function confirmEdit() {
      task.title = editInput.value;
      label.textContent = editInput.value;
      editInput.style.display = "none";
      label.style.display = "block";
      editButton.style.opacity = "0";
      editButton.style.animation = "rotateOut .5s ease-in-out";
      saveTasks();
    }

    window.addEventListener("click", (e) => {
      if (e.target !== label && e.target !== editInput) {
        confirmEdit();
      }
    });
    window.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        confirmEdit();
      }
    });
  });

  saveTasks();
  tasksCounter();

  function ifCompleted() {
    if (task.completed) {
      label.style.textDecoration = "line-through";
    } else label.style.textDecoration = "none";
    setTimeout(() => {
      doneCounter();
    }, 0);
  }

  // dataset - checked: true or false
  function checkboxStateSet(onCheckbox: boolean) {
    checkbox.dataset.checked = <any>onCheckbox;
  }

  /////////////////////////////////////// DRAGABLE SORTING /////////////////////////////////
  const draggables = document.querySelectorAll(".draggable");
  console.log(draggables);
  const container = document.querySelector(".container");

  draggables.forEach((draggable) => {
    draggable.addEventListener("dragstart", () => {
      draggable.classList.add("dragging");
    });

    draggable.addEventListener("dragend", (e: any) => {
      console.log(e.target.children[1].id);
      draggable.classList.remove("dragging");
    });
  });

  container?.addEventListener("dragover", (e: any) => {
    e.preventDefault();
    const afterElement: any = getDragAfterElement(container, e.clientY);
    const draggable: any = document.querySelector(".dragging");
    if (afterElement == null) {
      container.appendChild(draggable);
      console.log(draggable);
    } else {
      console.log(draggable);

      container.insertBefore(draggable, afterElement);
    }
  });

  function getDragAfterElement(container: any, y: any) {
    const draggableElements = [
      ...container.querySelectorAll(".draggable:not(.dragging)"),
    ];

    return draggableElements.reduce(
      (closest, child) => {
        const box = child.getBoundingClientRect();
        const offset = y - box.top - box.height / 2;

        if (offset < 0 && offset > closest.offset) {
          return { offset: offset, element: child };
        } else {
          return closest;
        }
      },
      { offset: Number.NEGATIVE_INFINITY }
    ).element;
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

  const btnNo = document.querySelector<HTMLButtonElement>("#btn-no");
  const btnYes = document.querySelector<HTMLElement>("#btn-yes");

  btnYes?.addEventListener("click", () => {
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

function confirmDel() {}

clearBtn?.addEventListener("click", () => {
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

  const btnNo = document.querySelector<HTMLButtonElement>("#btn-no");
  const btnYes = document.querySelector<HTMLElement>("#btn-yes");

  btnYes?.addEventListener("click", () => {
    tasks = [];
    saveTasks();
    tasksCounter();
    confirmModal.remove();
    const listItems = document.querySelectorAll("li");
    listItems.forEach((item) => {
      item.style.transform = "translateX(-50rem)";
      setTimeout(() => {
        item.remove();
        tasksCounter();
      }, 300);
    });
    btnNo?.addEventListener("click", () => {
      confirmModal.remove();

      return;
    });
  });
});

// counts task and returns in app title
function tasksCounter() {
  const taskLength = document.querySelectorAll("li").length;
  const appTitle = document.querySelector<HTMLUListElement>("h1");
  const appAllCounter = document.querySelector<HTMLSpanElement>("#all-counter");
  // appTitle!.textContent = `Todo list (${taskLength})`;
  appAllCounter!.textContent = `${taskLength}`;
}

const filterDone = document.querySelector("#filter-done");
const filterClear = document.querySelector("#filter-clear");

filterDone?.addEventListener("click", onFilterDone);
filterClear?.addEventListener("click", onFilterClear);

function onFilterDone() {
  let checked = document.querySelectorAll(`[data-checked="true"]`);
  checked.forEach((task) => {
    task.closest("li")?.classList.add("moveOut");
    setTimeout(() => {
      task.closest("li")?.classList.add("hidden");
    }, 300);
  });
}

function onFilterClear() {
  let checked = document.querySelectorAll(`[data-checked="true"]`);
  checked.forEach((task) => {
    task.closest("li")?.classList.remove("moveOut");
    task.closest("li")?.classList.remove("hidden");
  });
}

function doneCounter() {
  const appDoneCounter =
    document.querySelector<HTMLSpanElement>("#done-counter");
  let checked: number = document.querySelectorAll(
    `[data-checked="true"]`
  ).length;

  appDoneCounter!.textContent = `${checked}`;
}

console.log(
  tasks.sort(function (a, b) {
    return a.title > b.title ? 1 : b.title > a.title ? -1 : 0;
  })
);
