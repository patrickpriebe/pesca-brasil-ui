import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { SpringPage, RiverSpecies, RiverSpeciesPayload } from '../models/api-models';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class RiverSpeciesService {
  private apiUrl = `${environment.apiUrl}/api/river-species`;

  constructor(private http: HttpClient) {}

  listarAssociacoes(
    page: number = 0,
    size: number = 50,
    sortBy: string = 'id',
  ): Observable<SpringPage<RiverSpecies>> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString())
      .set('sortBy', sortBy);
    return this.http.get<SpringPage<RiverSpecies>>(this.apiUrl, { params });
  }

  salvarAssociacao(payload: RiverSpeciesPayload): Observable<RiverSpecies> {
    return this.http.post<RiverSpecies>(this.apiUrl, payload);
  }

  excluirAssociacao(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
