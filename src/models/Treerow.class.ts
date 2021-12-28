export default class Treerow {
  // ID
  public TaskID: number;
  // TEXT
  public TaskName: string = '';

  public StartDate: Date;

  public EndDate: Date;

  public Duration: number;

  public Progress: number;

  public Priority: string = '';

  public isParent: boolean;
  public ParentItem:number=null;

  public children: Treerow[] = [];
  id: string;

  constructor(
    _taskID: number,
    _taskName: string,
    _startDate: Date,
    _endDate: Date,
    _duration: number,
    _progress: number,
    _priority: string,
    _parentItem:number
  ) {
    this.TaskID = _taskID;
    this.TaskName = _taskName;
    this.StartDate = _startDate;
    this.EndDate = _endDate;
    this.Duration = _duration;
    this.Progress = _progress;
    this.Priority = _priority;
    this.ParentItem=_parentItem;
  }
}
