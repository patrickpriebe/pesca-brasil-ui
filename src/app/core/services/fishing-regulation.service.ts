import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { SpringPage, FishingRegulation, FishingRegulationPayload } from '../models/api-models';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class FishingRegulationService {
  private apiUrl = `${environment.apiUrl}/api/fishing-regulations`;

  constructor(private http: HttpClient) {}

  listarRegulamentos(
    page: number = 0,
    size: number = 10,
    sortBy: string = 'startDate',
  ): Observable<SpringPage<FishingRegulation>> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString())
      .set('sortBy', sortBy);
    return this.http.get<SpringPage<FishingRegulation>>(this.apiUrl, { params });
  }

  salvarRegulamento(regulamento: FishingRegulationPayload): Observable<FishingRegulation> {
    return this.http.post<FishingRegulation>(this.apiUrl, regulamento);
  }

  excluirRegulamento(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
