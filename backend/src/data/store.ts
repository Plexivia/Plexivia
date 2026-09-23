import { User, Client, Project, Task, Team } from '../types/index.js';

export interface DataStore {
  users: User[];
  clients: Client[];
  projects: Project[];
  tasks: Task[];
  teams: Team[];
}

export const Store: DataStore = {
  users: [],
  clients: [],
  projects: [],
  tasks: [],
  teams: [],
};
