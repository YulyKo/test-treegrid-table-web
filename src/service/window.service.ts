import {Injectable} from '@angular/core';
import {BehaviorSubject} from 'rxjs';
import {map} from 'rxjs/operators';

interface ISize {
  width: number;
  height: number;
}

@Injectable({
  providedIn: 'root'
})
export class WindowService {
  private readonly resizeSubject: BehaviorSubject<ISize> = new BehaviorSubject<ISize>({
    width: window.innerWidth,
    height: window.innerHeight
  });
  public readonly width$ = this.resizeSubject.pipe(
    map(size => size.width)
  );
  public readonly height$ = this.resizeSubject.pipe(
    map(size => size.height)
  );

  constructor() {
    window.addEventListener('resize', () => {
      this.resizeSubject.next({
        width: window.innerWidth,
        height: window.innerHeight
      });
    });
  }

  getScrollbarWidth(): number {
    // Creating invisible container
    const outer = document.createElement('div');
    outer.style.visibility = 'hidden';
    outer.style.overflowX = 'scroll'; // forcing scrollbar to appear
    outer.style.overflowY = 'scroll'; // forcing scrollbar to appear
    document.body.appendChild(outer);

    // Creating inner element and placing it in the container
    const inner = document.createElement('div');
    outer.appendChild(inner);

    // Calculating difference between container's full width and the child width
    const scrollbarWidth = (outer.offsetWidth - inner.offsetWidth);

    // Removing temporary elements from the DOM
    outer.parentNode.removeChild(outer);

    return scrollbarWidth;
  }
}
