import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';

export interface Tag {
    id: string;
    label: string;
    color: string;
}

@Injectable({
    providedIn: 'root'
})
export class TagService {
    private mockTags: Tag[] = [
        { id: '1', label: 'Urgent', color: '#e2445c' },
        { id: '2', label: 'High Priority', color: '#ff5722' },
        { id: '3', label: 'Medium', color: '#ff9800' },
        { id: '4', label: 'Low', color: '#00c875' },
        { id: '5', label: 'Bug', color: '#e2445c' },
        { id: '6', label: 'Feature', color: '#579bfc' },
        { id: '7', label: 'Design', color: '#a25ddc' },
        { id: '8', label: 'Dev', color: '#0086c0' }
    ];

    searchTags(query: string): Observable<Tag[]> {
        const lowerQuery = query.toLowerCase();
        const results = this.mockTags.filter(t =>
            t.label.toLowerCase().includes(lowerQuery)
        );
        return of(results).pipe(delay(200));
    }

    createTag(label: string): Observable<Tag> {
        const newTag: Tag = {
            id: Math.random().toString(36).substr(2, 9),
            label,
            color: this.getRandomColor()
        };
        this.mockTags.push(newTag);
        return of(newTag).pipe(delay(300));
    }

    private getRandomColor(): string {
        const colors = ['#e2445c', '#ff5722', '#ff9800', '#00c875', '#579bfc', '#a25ddc', '#0086c0'];
        return colors[Math.floor(Math.random() * colors.length)];
    }
}
