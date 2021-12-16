export default interface Task {
  taskID: number;
  [key: string]: string | boolean | Date | Array<string> | number;
}