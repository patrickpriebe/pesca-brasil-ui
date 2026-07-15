import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { SpringPage, Bait, BaitPayload } from '../models/api-models';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class BaitService {
  private apiUrl = `${environment.apiUrl}/api/baits`;

  constructor(private http: HttpClient) {}

  criar(isca: { name: string }): Observable<Bait> {
    return this.http.post<Bait>(this.apiUrl, isca);
  }

  listarIscas(page: number = 0, size: number = 10, name?: string): Observable<SpringPage<Bait>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString())
      .set('sortBy', 'name');
    if (name) params = params.set('name', name);
    return this.http.get<SpringPage<Bait>>(this.apiUrl, { params });
  }

  salvarIsca(isca: BaitPayload): Observable<Bait> {
    return this.http.post<Bait>(this.apiUrl, isca);
  }

  excluirIsca(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
