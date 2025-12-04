import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { environment } from '../../environments/environment';

export interface Location {
  id: string;
  business_id: string;
  name: string;
  code: string;
  address?: string;
  city?: string;
  state?: string;
  postal_code?: string;
  country?: string;
  phone?: string;
  email?: string;
  manager_id?: string;
  status: string;
  opening_hours?: string;
  settings?: any;
  created_at: string;
  updated_at?: string;
}

@Injectable({
  providedIn: 'root'
})
export class LocationService {
  private apiUrl = `${environment.apiUrl}/locations`;
  private selectedLocationSubject = new BehaviorSubject<Location | null>(null);
  private locationsSubject = new BehaviorSubject<Location[]>([]);
  
  public selectedLocation$ = this.selectedLocationSubject.asObservable();
  public locations$ = this.locationsSubject.asObservable();

  constructor(private http: HttpClient) {
    this.loadSavedLocation();
  }

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('auth_token');
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : ''
    });
  }

  loadLocations(): Observable<Location[]> {
    return this.http.get<Location[]>(this.apiUrl, { headers: this.getHeaders() })
      .pipe(
        tap(locations => {
          this.locationsSubject.next(locations);
          
          // Auto-select first location if none selected and locations exist
          if (!this.selectedLocationSubject.value && locations.length > 0) {
            const savedLocationId = localStorage.getItem('selectedLocationId');
            const locationToSelect = savedLocationId 
              ? locations.find(l => l.id === savedLocationId) || locations[0]
              : locations[0];
            this.selectLocation(locationToSelect);
          }
        })
      );
  }

  selectLocation(location: Location | null): void {
    this.selectedLocationSubject.next(location);
    if (location) {
      localStorage.setItem('selectedLocationId', location.id);
    } else {
      localStorage.removeItem('selectedLocationId');
    }
  }

  getSelectedLocation(): Location | null {
    return this.selectedLocationSubject.value;
  }

  getSelectedLocationId(): string | null {
    return this.selectedLocationSubject.value?.id || null;
  }

  clearSelection(): void {
    this.selectedLocationSubject.next(null);
    localStorage.removeItem('selectedLocationId');
  }

  private loadSavedLocation(): void {
    const savedLocationId = localStorage.getItem('selectedLocationId');
    if (savedLocationId) {
      // Location will be set when loadLocations() is called
    }
  }

  // API methods
  getActiveLocations(): Observable<Location[]> {
    return this.http.get<Location[]>(`${this.apiUrl}/active`, { headers: this.getHeaders() });
  }

  getLocation(id: string): Observable<Location> {
    return this.http.get<Location>(`${this.apiUrl}/${id}`, { headers: this.getHeaders() });
  }

  createLocation(data: Partial<Location>): Observable<Location> {
    return this.http.post<Location>(this.apiUrl, data, { headers: this.getHeaders() });
  }

  updateLocation(id: string, data: Partial<Location>): Observable<Location> {
    return this.http.put<Location>(`${this.apiUrl}/${id}`, data, { headers: this.getHeaders() });
  }

  updateLocationStatus(id: string, status: string): Observable<Location> {
    return this.http.put<Location>(`${this.apiUrl}/${id}/status`, { status }, { headers: this.getHeaders() });
  }

  deleteLocation(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`, { headers: this.getHeaders() });
  }
}
