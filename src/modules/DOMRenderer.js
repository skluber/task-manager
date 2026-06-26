export class DOMRenderer {
    static #elements = {
        // Modal & Forms
        taskModal: document.getElementById("task-modal"),
        projectModal: document.getElementById("project-modal"),
        taskForm: document.getElementById("form-new-task"),
        projectForm: document.getElementById("form-new-project"),

        // Lists
        projectsList: document.getElementById("projects-list")
    }

    static openModal(type) {
        const modal = type === "task" ? DOMRenderer.#elements.taskModal : DOMRenderer.#elements.projectModal;

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

            // 3. Dot
            const dot = document.createElement("div");
            dot.className = "sidebar__project-dot";
            dot.style.backgroundColor = project.color;
            dot.setAttribute('aria-hidden', 'true');

            // 4. Project Name
            const name = document.createElement("span");
            name.className = "sidebar__project-name";
            name.textContent = project.name;

            // 5. Appends
            button.appendChild(dot);
            button.appendChild(name);
            listItem.appendChild(button);
            
            DOMRenderer.#elements.projectsList.appendChild(listItem);
        });
    }
}