import { Project } from './Project.js';
import { Task } from './Task.js';
import { isToday, isThisWeek } from 'date-fns';
import { PAGE_STATES } from './PageStates.js';


export class TaskManager {
    constructor() {
        this.projects = this.#loadFromStorage("projects").map(p => new Project(p));
        this.tasks = this.#loadFromStorage("tasks").map(t => new Task(t));
        this.state = this.#loadFromStorage("state");
    }

    // ==========================================================================
    // PRIVATE helpers 
    // ==========================================================================

    #saveToStorage(key, data) {
        localStorage.setItem(key, JSON.stringify(data));
    }

    #loadFromStorage(key) {
        const data = localStorage.getItem(key);
        return data ? JSON.parse(data) : [];
    }

    #projectIdExists(projectId) {
        return this.projects.some(p => p.projectId === projectId);
    }

    #taskIdExists(taskId) {
        return this.tasks.some(t => t.taskId === taskId);
    }

    #projectNameExists(name) {
        const cleanedName = name.trim().toLowerCase();
        return this.projects.some(p => p.name.toLowerCase() === cleanedName);
    }

    // ==========================================================================
    // PROJECTS operations
    // ==========================================================================

    addProject(projectData) {
        if (this.#projectNameExists(projectData.name)) {
            throw new Error(`Project Manager Error: A project named "${projectData.name.trim()}" already exists.`);
        }

        const newProject = new Project(projectData);
        this.projects.push(newProject);
        this.#saveToStorage("projects", this.projects)
        return newProject;
    }

    deleteProject(projectId) {
        if (!this.#projectIdExists(projectId)) {
            throw new Error(`Project Manager Error: Cannot delete. Project ID "${projectId}" not found.`);
        }
        
        this.projects = this.projects.filter(p => p.projectId !== projectId);
        this.tasks = this.tasks.filter(t => t.projectId !== projectId);
        this.#saveToStorage("projects", this.projects);
        this.#saveToStorage("tasks", this.tasks);
    }

    // ==========================================================================
    // TASKS operations
    // ==========================================================================

    addTask(taskData) {
        if (!this.#projectIdExists(taskData.projectId)) {
            throw new Error(`Task Manager Error: Cannot add task. Project ID "${taskData.projectId}" does not exist.`);
        }

        const newTask = new Task(taskData);
        this.tasks.push(newTask);
        this.#saveToStorage("tasks", this.tasks);
        return newTask;
    }

    deleteTask(taskId) {
        if (!this.#taskIdExists(taskId)) {
            throw new Error(`Task Manager Error: Cannot remove task. Task ID "${taskId}" does not exist.`);
        }

        this.tasks = this.tasks.filter(t => t.taskId !== taskId)
        this.#saveToStorage("tasks", this.tasks);
    }

    // ==========================================================================
    // FILTER / QUERY operations
    // ==========================================================================
    
    getTasksByProject(projectId) {
        if (!this.#projectIdExists(projectId)) {
            throw new Error(`Task Manager Error: Cannot get tasks. Project ID "${projectId}" does not exist.`);
        }
        
        return this.tasks.filter(t => t.projectId === projectId);
    }

    getNumberOfTasksByProject(projectId) {
        if (!this.#projectIdExists(projectId)) {
            throw new Error(`Task Manager Error: Cannot get tasks. Project ID "${projectId}" does not exist.`);
        }
        
        return (this.tasks.filter(t => t.projectId === projectId)).length;
    }

    getProjectIdByName(projectName) {
        if (!this.#projectNameExists(projectName)) {
            throw new Error(`Task Manager Error: Project Name "${projectName}" does not exist.`);
        }

        const project = this.projects.find(p => p.name === projectName);
        return project.projectId;
    }

    updateTaskStatus(taskId, newStatus) {
        if (!this.#taskIdExists(taskId)) {
            throw new Error(`Task Manager Error: Cannot update task. Task ID "${taskId}" does not exist.`);
        }

        if (!["todo", "progress", "completed"].includes(newStatus)) {
            throw new Error(`Task Manager Error: Invalid status "${newStatus}".`);
        }

        const task = this.tasks.find(t => t.taskId === taskId);
        task.status = newStatus;
        
        this.#saveToStorage("tasks", this.tasks);
        return task;
    }

    changePageState(newState) {
        if (!Object.values(PAGE_STATES).includes(newState)) {
            throw new Error(`Cannot resolve page state: "${newState}"`);        
        } 

        this.state = newState;
        this.#saveToStorage("state", newState);
    }

    getCurrentStateTasks() {
        switch (this.state) {
            case PAGE_STATES.TODAY:
                return this.getTodayTasks();
                break;
            case PAGE_STATES.WEEK:
                return this.getWeekTasks();
                break;
            case PAGE_STATES.ALL:
                return this.getAllTasks();
                break;
            default:
                return this.getTodayTasks();
                break;
        }
    }

    getTodayTasks() {
        return this.tasks.filter(task => task.dueDate && isToday(new Date(task.dueDate)));
    }

    getWeekTasks() {
        return this.tasks.filter(task => task.dueDate && isThisWeek(new Date(task.dueDate)));
    }

    getAllTasks() {
        return this.tasks;
    }
}