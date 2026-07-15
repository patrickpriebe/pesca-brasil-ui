import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { SpringPage, Equipment, EquipmentPayload } from '../models/api-models';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class EquipmentService {
  private apiUrl = `${environment.apiUrl}/api/equipments`;

  constructor(private http: HttpClient) {}

  criar(equipamento: {
    type: string;
    action: string;
    recommendedLineWeight: string;
  }): Observable<Equipment> {
    return this.http.post<Equipment>(this.apiUrl, equipamento);
  }

  listarEquipamentos(
    page: number = 0,
    size: number = 10,
    sortBy: string = 'id',
  ): Observable<SpringPage<Equipment>> {
    const params = new HttpParams().set('page', page).set('size', size).set('sortBy', sortBy);
    return this.http.get<SpringPage<Equipment>>(this.apiUrl, { params });
  }

  salvarEquipamento(equip: EquipmentPayload): Observable<Equipment> {
    return this.http.post<Equipment>(this.apiUrl, equip);
  }

  excluirEquipamento(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
