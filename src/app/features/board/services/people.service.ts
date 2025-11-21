import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';

export interface Person {
    id: string;
    name: string;
    avatarUrl?: string; // Optional, fallback to initials if missing
    color?: string; // Fallback color for initials
}

@Injectable({
    providedIn: 'root'
})
export class PeopleService {
    private mockPeople: Person[] = [
        { id: '1', name: 'Alice Malice', color: '#FF5733' },
        { id: '2', name: 'Bob Builder', color: '#33FF57' },
        { id: '3', name: 'Charlie Chaplin', color: '#3357FF' },
        { id: '4', name: 'David Bowie', color: '#FF33A8' },
        { id: '5', name: 'Eve Polastri', color: '#33FFF5' },
        { id: '6', name: 'Frank Sinatra', color: '#F5FF33' },
        { id: '7', name: 'Grace Hopper', color: '#FF8C33' },
        { id: '8', name: 'Harry Potter', color: '#8C33FF' },
        { id: '9', name: 'Iris West', color: '#33FF8C' },
        { id: '10', name: 'Jack Sparrow', color: '#FF3333' }
    ];

    searchPeople(query: string): Observable<Person[]> {
        const lowerQuery = query.toLowerCase();
        const results = this.mockPeople.filter(p =>
            p.name.toLowerCase().includes(lowerQuery)
        );
        return of(results).pipe(delay(300)); // Simulate network delay
    }

    getPerson(id: string): Observable<Person | undefined> {
        const person = this.mockPeople.find(p => p.id === id);
        return of(person).pipe(delay(100));
    }
}
