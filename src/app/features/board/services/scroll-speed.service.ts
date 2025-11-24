import { Injectable, signal } from '@angular/core';
import { Subject, timer } from 'rxjs';
import { debounce } from 'rxjs/operators';

@Injectable({
    providedIn: 'root'
})
export class ScrollSpeedService {
    private _isFastScrolling = signal(false);
    isFastScrolling = this._isFastScrolling.asReadonly();

    private scrollSubject = new Subject<number>();
    private lastScrollTime = 0;
    private lastScrollTop = 0;
    private velocityThreshold = 0.5; // Pixels per ms (Lowered for sensitivity)

    constructor() {
        // Reset fast scrolling state when scrolling stops
        this.scrollSubject.pipe(
            debounce(() => timer(150)) // Increased debounce to keep fast mode active longer
        ).subscribe(() => {
            this._isFastScrolling.set(false);
        });
    }

    onScroll(scrollTop: number) {
        const now = Date.now();
        const timeDiff = now - this.lastScrollTime;

        if (timeDiff > 0) {
            const distance = Math.abs(scrollTop - this.lastScrollTop);
            const velocity = distance / timeDiff;

            if (velocity > this.velocityThreshold) {
                this._isFastScrolling.set(true);
            }
        }

        this.lastScrollTime = now;
        this.lastScrollTop = scrollTop;
        this.scrollSubject.next(scrollTop);
    }
}
