import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { SpringPage, River, RiverPayload } from '../models/api-models';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class RiverService {
  private apiUrl = `${environment.apiUrl}/api/rivers`;

  constructor(private http: HttpClient) {}

  criar(rio: { name: string; basin: string }): Observable<River> {
    return this.http.post<River>(this.apiUrl, rio);
  }

  listarRios(
    page: number = 0,
    size: number = 10,
    sortBy: string = 'name',
  ): Observable<SpringPage<River>> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString())
      .set('sortBy', sortBy);
    return this.http.get<SpringPage<River>>(this.apiUrl, { params });
  }

  salvarRio(rio: RiverPayload): Observable<River> {
    return this.http.post<River>(this.apiUrl, rio);
  }

  excluirRio(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
