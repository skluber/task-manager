import { IconManager } from './IconManager.js';
import { format, parseISO } from 'date-fns';
import { enUS } from 'date-fns/locale';
import { PAGE_STATES } from './PageStates.js';


export class DOMRenderer {
    static get #elements() {
        return {
            // Modal & Forms
            taskModal: document.getElementById("task-modal"),
            projectModal: document.getElementById("project-modal"),
            taskForm: document.getElementById("form-new-task"),
            projectForm: document.getElementById("form-new-project"),
            projectsList: document.getElementById("projects-list"),

            // Columns
            todoColumn: document.getElementById("todo_ul_list"),
            progressColumn: document.getElementById("progress_ul_list"),
            completedColumn: document.getElementById("completed_ul_list"),

            // Counters
            todoCount: document.querySelector("#column-todo .task-board__column-count"),
            progressCount: document.querySelector("#column-progress .task-board__column-count"),
            completedCount: document.querySelector("#column-completed .task-board__column-count")
        };
    }

    static openModal(type) {
        const modal = type === "task" ? DOMRenderer.#elements.taskModal : DOMRenderer.#elements.projectModal;

        console.log("Test" + modal)
        if (!modal) return;

        modal.classList.add("modal--show");
        modal.setAttribute("aria-hidden", "false");

        const focusFirst = modal.querySelector("input");
        if (focusFirst) focusFirst.focus();
    }

    static closeModal(type) {
        const modal = type === "task" ? DOMRenderer.#elements.taskModal : DOMRenderer.#elements.projectModal;
        const form = type === "task" ? DOMRenderer.#elements.taskForm : DOMRenderer.#elements.projectForm;

        if (!modal) return;

        modal.classList.remove("modal--show");
        modal.setAttribute("aria-hidden", "true");

        if (form) form.reset();
    }

    static renderProjectsSidebar(projects) {
        if (!DOMRenderer.#elements.projectsList) return;

        DOMRenderer.#elements.projectsList.innerHTML = "";

        projects.forEach(project => {
            // 1. LI
            const listItem = document.createElement("li");
            listItem.className = "sidebar__project-item";
            listItem.dataset.id = project.projectId;

            // 2. Button
            const button = document.createElement("button");
            button.className = "sidebar__project-button";
            button.dataset.id = project.projectId;

            // 3. Dot
            const dot = document.createElement("div");
            dot.className = "sidebar__project-dot";
            dot.style.backgroundColor = project.color;
            dot.setAttribute('aria-hidden', 'true');

            // 4. Project Name
            const name = document.createElement("span");
            name.className = "sidebar__project-name";
            name.textContent = project.name;

            // 5. Remove icon
            const rmIcon = document.createElement("span");
            rmIcon.className = "sidebar__filter-icon";
            rmIcon.innerHTML = IconManager.get('trash'); 
            rmIcon.setAttribute("aria-label", "Trash icon");

            // 6. Appends
            button.appendChild(dot);
            button.appendChild(name);
            button.appendChild(rmIcon);
            listItem.appendChild(button);
            
            DOMRenderer.#elements.projectsList.appendChild(listItem);
        });
    }

    static renderTasks(tasks, projects) {
        const { todoColumn, progressColumn, completedColumn, 
                todoCount, progressCount, completedCount } = DOMRenderer.#elements;
        

        if (todoColumn) todoColumn.innerHTML = "";
        if (progressColumn) progressColumn.innerHTML = "";
        if (completedColumn) completedColumn.innerHTML = "";

        let todoCounters = 0;
        let progressCounters = 0;
        let completedCounters = 0;

        tasks.forEach(task => {
            const associatedProject = projects.find(p => p.projectId === task.projectId)
            const projectName = associatedProject ? associatedProject.name : "No Project";
            const projectColor = associatedProject ? associatedProject.color : "#e2e8f0";

            const card = DOMRenderer.#createTaskCard(task, projectName, projectColor);

            switch (task.status) {
                case "todo":
                    if (todoColumn) { todoColumn.appendChild(card); todoCounters++; };
                    break;
                case "progress":
                    if (progressColumn) { progressColumn.appendChild(card); progressCounters++; };
                    break;
                case "completed":
                    if (completedColumn) { completedColumn.appendChild(card); completedCounters++; };
                    break;
            }
        })

        if (todoCount) todoCount.textContent = todoCounters;
        if (progressCount) progressCount.textContent = progressCounters;
        if (completedCount) completedCount.textContent = completedCounters;
    }

    static renderProjectsSelect(projects) {
        const projectSelect = document.getElementById("task-project");
        if (!projectSelect) return;

        const defaultOption = document.createElement("option");
        defaultOption.value = "";
        defaultOption.disabled = true;
        defaultOption.selected = true;
        defaultOption.textContent = "Select project";

        projectSelect.replaceChildren(defaultOption);

        projects.forEach(project => {
            const option = document.createElement("option");
            option.value = project.projectId;
            option.textContent = project.name;
            projectSelect.appendChild(option)
        })
    }

    static renderFilterState(currentState) {
        let filter;
        switch (currentState) {
            case PAGE_STATES.TODAY:
                filter = document.getElementById("todayState");
                break;

            case PAGE_STATES.WEEK:
                filter = document.getElementById("weekState");
                break;
        
            case PAGE_STATES.ALL:
                filter = document.getElementById("allState");
                break;
            default:
                filter = document.getElementById("allState");
                break;
        }

        filter.classList.add("sidebar__filter-button--active");
        filter.setAttribute("aria-current", "page");
    }

    // ==========================================================================
    // PRIVATE METHODS
    // ==========================================================================

    static #createTaskCard(task, projectName, projectColor) {
        const taskWrapper = document.createElement("li");
        taskWrapper.className = "task-board__item";

        const article = document.createElement("article");
        article.classList.add("task-card", `task-card--${task.status}`);
        
        article.draggable = true;

        article.addEventListener("dragstart", (e) => {
            e.dataTransfer.setData("text/plain", task.taskId);
            article.classList.add("task-card--dragging"); 
        });

        article.addEventListener("dragend", () => {
            article.classList.remove("task-card--dragging");
        });

        article.appendChild(DOMRenderer.#createTaskCompletion(task));
        article.appendChild(DOMRenderer.#createTaskInfo(task, projectName, projectColor));

        taskWrapper.appendChild(article);
        return taskWrapper;
    }

    static #createTaskCompletion(task) {
        const completion = document.createElement("div");
        completion.className = "task-card__completion";

        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.dataset.id = task.taskId;
        checkbox.className = "task-card__checkbox";
        
        if (task.status === "completed") {
            checkbox.checked = "checked";
        }

        const checkboxLabel = document.createElement("label");
        checkboxLabel.htmlFor = task.taskId;
        checkboxLabel.className = "sr-only";
        checkboxLabel.textContent = `Mark '${task.name}' as completed`
        
        completion.appendChild(checkbox);
        completion.appendChild(checkboxLabel);

        return completion;
    }

    static #createTaskInfo(task, projectName, projectColor) {
        const content = document.createElement("div");
        content.className = "task-card__content";

        const name = document.createElement("h3");
        name.className = "task-card__title";
        name.textContent = task.name;

        const p = document.createElement("p");
        p.className = "task-card__description";
        p.textContent = task.description;

        content.appendChild(name);
        content.appendChild(p);
        content.appendChild(DOMRenderer.#createCardFooter(task, projectName, projectColor));

        return content;
    }

    static #createCardFooter(task, projectName, projectColor) {
        const footer = document.createElement("div");
        footer.className = "task-card__meta";

        const dueDate = document.createElement("time");
        dueDate.className = "task-card__date";

        if (task.dueDate && task.dueDate.trim() !== "") {
            try {
                const dateObject = parseISO(task.dueDate);
                const formattedDate = format(dateObject, 'dd MMM, yyyy', { locale: enUS });
                dueDate.textContent = formattedDate;

            } catch (error) {
                dueDate.textContent = "No deadline";
            }
        } else {
            dueDate.textContent = "No deadline";
        }

        dueDate.dateTime = task.dueDate;

        const calendarIconContainer = document.createElement("span");
        calendarIconContainer.className = "task-card__meta-icon";
        calendarIconContainer.innerHTML = IconManager.get('calendar'); 
        calendarIconContainer.setAttribute("aria-label", "Calendar icon");

        dueDate.prepend(calendarIconContainer);

        const badges = document.createElement("div");
        badges.className = "task-card__badges";

        const project = document.createElement("span");
        project.className = "task-card__project-badge";
        project.textContent = projectName;
        project.style.backgroundColor = `${projectColor}36`;

        const priority = document.createElement("span");
        priority.classList.add("task-card__priority", `task-card__priority--${task.priority}`);
        priority.textContent = task.priority;   

        badges.appendChild(project);
        badges.appendChild(priority);

        footer.appendChild(dueDate);
        footer.appendChild(badges);

        return footer;
    }
}