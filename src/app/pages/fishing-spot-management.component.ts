import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { FishingSpotService } from '../core/services/fishing-spot.service';
import { RiverService } from '../core/services/river.service';
import { FishingSpot, FishingSpotPayload, River } from '../core/models/api-models';

@Component({
  selector: 'app-fishing-spot-management',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="h-full w-full flex flex-col gap-8 p-4 animate-fade-in relative">
      <div>
        <h2 class="text-4xl font-serif font-black text-neo-ink tracking-tight">Locais de Pesca</h2>
        <p class="text-neo-ink font-bold text-sm mt-2 uppercase tracking-widest">Pontos geográficos e Pesqueiros</p>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8 flex-1">
        <div class="neo-card p-8 flex flex-col h-fit">
          <h3 class="text-2xl font-serif font-black text-neo-ink mb-6">Novo Local</h3>
          <form [formGroup]="spotForm" (ngSubmit)="salvar()" class="flex flex-col gap-5">
            <div>
              <label class="block text-sm font-black text-neo-ink uppercase tracking-wider mb-2">Rio Associado *</label>
              <select formControlName="riverId" class="neo-input cursor-pointer">
                <option value="" disabled selected>Selecione um rio...</option>
                <option *ngFor="let rio of riosDisponiveis" [value]="rio.id">{{ rio.name }}</option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-black text-neo-ink uppercase tracking-wider mb-2">Nome do Local *</label>
              <input type="text" formControlName="name" placeholder="Ex: Curva do Jacuí" class="neo-input">
            </div>
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-black text-neo-ink uppercase tracking-wider mb-2">Lat *</label>
                <input type="number" step="any" formControlName="latitude" class="neo-input font-mono text-xs">
              </div>
              <div>
                <label class="block text-sm font-black text-neo-ink uppercase tracking-wider mb-2">Lng *</label>
                <input type="number" step="any" formControlName="longitude" class="neo-input font-mono text-xs">
              </div>
            </div>
            <div>
              <label class="block text-sm font-black text-neo-ink uppercase tracking-wider mb-2">Acesso (Opcional)</label>
              <input type="text" formControlName="accessType" placeholder="Ex: Barco, Barranco..." class="neo-input">
            </div>
            <div>
              <label class="block text-sm font-black text-neo-ink uppercase tracking-wider mb-2">Descrição / Dicas do Local</label>
              <textarea formControlName="description" rows="2" placeholder="Ex: Fundo de pedra, muita galhada na margem direita..." class="neo-input resize-none"></textarea>
            </div>
            <button type="submit" [disabled]="spotForm.invalid || salvando" class="neo-btn mt-4 w-full">
              {{ salvando ? 'Salvando...' : 'Cadastrar Local' }}
            </button>
          </form>
        </div>

        <div class="lg:col-span-2 flex flex-col h-fit">
          <div class="neo-table-container">
            <table class="w-full text-left border-collapse neo-table">
              <thead>
              <tr>
                <th>Local / Coordenadas</th>
                <th>Rio Principal</th>
                <th class="text-right">Ações</th>
              </tr>
              </thead>
              <tbody>
              <tr *ngFor="let spot of spots">
                <td>
                  <div class="font-bold">{{ spot.name }}</div>
                  <div class="text-xs font-black font-mono mt-1 text-neo-muted">{{ spot.latitude }}, {{ spot.longitude }}</div>
                </td>
                <td class="font-bold text-neo-muted">{{ spot.riverName }}</td>
                <td class="text-right">
                  <button (click)="abrirModalExclusao(spot.id)" class="neo-btn neo-btn-danger !px-4 !py-2 !text-xs">Excluir</button>
                </td>
              </tr>
              </tbody>
            </table>
            <div *ngIf="carregando" class="text-center py-8 font-bold text-neo-ink uppercase tracking-widest">Carregando locais...</div>
          </div>
        </div>
      </div>

      <div *ngIf="idParaExcluir !== null" class="fixed inset-0 bg-neo-ink/80 flex items-center justify-center z-50 p-4">
        <div class="neo-card max-w-sm w-full p-8 flex flex-col items-center text-center animate-scale-up bg-white">
          <h3 class="text-3xl font-serif font-black text-neo-ink mb-4">Atenção!</h3>
          <p class="text-neo-ink font-bold text-sm mb-8 leading-relaxed">A remoção deste local de pesca será permanente. Confirma?</p>
          <div class="flex gap-4 w-full">
            <button (click)="fecharModalExclusao()" class="neo-btn neo-btn-outline flex-1">Cancelar</button>
            <button (click)="confirmarExclusao()" class="neo-btn neo-btn-danger flex-1">Excluir</button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
    @keyframes scaleUp { from { transform: scale(0.96); opacity: 0; } to { transform: scale(1); opacity: 1; } }
    .animate-fade-in { animation: fadeIn 0.2s ease-out forwards; }
    .animate-scale-up { animation: scaleUp 0.15s cubic-bezier(0.34, 1.56, 0.64, 1) forwards; }
  `]
})
export class FishingSpotManagementComponent implements OnInit {
  spotForm: FormGroup;
  spots: FishingSpot[] = [];
  riosDisponiveis: River[] = [];
  carregando = true;
  salvando = false;
  idParaExcluir: number | null = null;

  constructor(private fb: FormBuilder, private fishingSpotService: FishingSpotService, private riverService: RiverService, private cdr: ChangeDetectorRef) {
    this.spotForm = this.fb.group({
      riverId: ['', Validators.required],
      name: ['', Validators.required],
      latitude: ['', Validators.required],
      longitude: ['', Validators.required],
      accessType: [''],
      description: ['']
    });
  }

  ngOnInit(): void { this.carregarLocais(); this.carregarRiosParaODropdown(); }

  carregarLocais(): void {
    this.fishingSpotService.listarLocais(0, 50).subscribe({
      next: (p) => { this.spots = p.content; this.carregando = false; this.cdr.detectChanges(); },
      error: () => { this.carregando = false; this.cdr.detectChanges(); }
    });
  }

  carregarRiosParaODropdown(): void {
    this.riverService.listarRios(0, 100).subscribe({ next: (p) => { this.riosDisponiveis = p.content; this.cdr.detectChanges(); } });
  }

  salvar(): void {
    if (this.spotForm.invalid) return;
    this.salvando = true;
    const payload: FishingSpotPayload = {
      ...this.spotForm.value,
      riverId: Number(this.spotForm.value.riverId),
      latitude: Number(this.spotForm.value.latitude),
      longitude: Number(this.spotForm.value.longitude)
    };
    this.fishingSpotService.salvarLocal(payload).subscribe({
      next: (s) => { this.spots.unshift(s); this.spotForm.reset({riverId: ''}); this.salvando = false; this.cdr.detectChanges(); },
      error: () => { this.salvando = false; this.cdr.detectChanges(); }
    });
  }

  abrirModalExclusao(id: number): void { this.idParaExcluir = id; }
  fecharModalExclusao(): void { this.idParaExcluir = null; }

  confirmarExclusao(): void {
    if (this.idParaExcluir === null) return;
    this.fishingSpotService.excluirLocal(this.idParaExcluir).subscribe({
      next: () => {
        this.spots = this.spots.filter(s => s.id !== this.idParaExcluir);
        this.fecharModalExclusao();
        this.cdr.detectChanges();
      },
      error: () => this.fecharModalExclusao()
    });
  }
}
