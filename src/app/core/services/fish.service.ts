import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { SpringPage, Fish, FishPayload } from '../models/api-models';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class FishService {
  private apiUrl = `${environment.apiUrl}/api/fishes`;

  constructor(private http: HttpClient) {}

  criar(peixe: any): Observable<Fish> {
    return this.http.post<Fish>(this.apiUrl, peixe);
  }

  listarPeixes(page: number = 0, size: number = 10, name?: string): Observable<SpringPage<Fish>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString())
      .set('sortBy', 'commonName');
    if (name) params = params.set('name', name);
    return this.http.get<SpringPage<Fish>>(this.apiUrl, { params });
  }

  buscarPorId(id: number): Observable<Fish> {
    return this.http.get<Fish>(`${this.apiUrl}/${id}`);
  }

  salvarPeixe(peixe: FishPayload): Observable<Fish> {
    return this.http.post<Fish>(this.apiUrl, peixe);
  }

  excluirPeixe(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
