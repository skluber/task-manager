export class Project {
    constructor({
        projectId = null,
        name,
        color = "#3b82f6"
    }) {
        if (!name || name.trim() === "") {
            throw new Error("Project validation failed: 'name' is required and cannot be empty.");
        }

        this.projectId = projectId || crypto.randomUUID();
        this.name = name.trim();
        this.color = color;
    }
}