import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  SpringPage,
  CatchRecord,
  CatchRecordPayload,
  RankingPeixe,
  RankingPescador,
} from '../models/api-models';

@Injectable({
  providedIn: 'root',
})
export class CatchRecordService {
  private apiUrl = `${environment.apiUrl}/api/catch-records`;

  constructor(private http: HttpClient) {}

  listarCapturas(
    page: number = 0,
    size: number = 20,
    sortBy: string = 'catchDate',
    search: string = '',
  ): Observable<SpringPage<CatchRecord>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString())
      .set('sortBy', sortBy);

    if (search.trim() !== '') {
      params = params.set('search', search);
    }

    return this.http.get<SpringPage<CatchRecord>>(this.apiUrl, { params });
  }

  salvarCaptura(registro: CatchRecordPayload): Observable<CatchRecord> {
    return this.http.post<CatchRecord>(this.apiUrl, registro);
  }

  excluirCaptura(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  getRankingPorComprimento(): Observable<RankingPeixe[]> {
    return this.http.get<RankingPeixe[]>(`${this.apiUrl}/ranking/comprimento`);
  }

  getRankingPorPeso(): Observable<RankingPeixe[]> {
    return this.http.get<RankingPeixe[]>(`${this.apiUrl}/ranking/peso`);
  }

  getRankingDePescadores(): Observable<RankingPescador[]> {
    return this.http.get<RankingPescador[]>(`${this.apiUrl}/ranking/pescadores`);
  }
}
