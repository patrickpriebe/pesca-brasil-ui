import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { SpringPage, FishingSpot, FishingSpotPayload } from '../models/api-models';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class FishingSpotService {
  private apiUrl = `${environment.apiUrl}/api/fishing-spots`;

  constructor(private http: HttpClient) {}

  criar(local: { name: string; riverName: string }): Observable<FishingSpot> {
    return this.http.post<FishingSpot>(this.apiUrl, local);
  }

  listarLocais(page: number = 0, size: number = 10): Observable<SpringPage<FishingSpot>> {
    const params = new HttpParams().set('page', page).set('size', size);
    return this.http.get<SpringPage<FishingSpot>>(this.apiUrl, { params });
  }

  salvarLocal(local: FishingSpotPayload): Observable<FishingSpot> {
    return this.http.post<FishingSpot>(this.apiUrl, local);
  }

  excluirLocal(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
