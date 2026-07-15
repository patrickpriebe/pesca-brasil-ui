import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { FishingRegulationService } from '../core/services/fishing-regulation.service';
import { FishingRegulation } from '../core/models/api-models';

@Component({
  selector: 'app-fishing-regulation-management',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="h-full w-full flex flex-col gap-8 p-4 animate-fade-in relative">
      <div>
        <h2 class="text-4xl font-serif font-black text-neo-ink tracking-tight">Leis e Defesos</h2>
        <p class="text-neo-ink font-bold text-sm mt-2 uppercase tracking-widest">Piracema e Restrições</p>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8 flex-1">
        <div class="neo-card p-8 flex flex-col h-fit">
          <h3 class="text-2xl font-serif font-black text-neo-ink mb-6">Nova Regra</h3>
          <form [formGroup]="regForm" (ngSubmit)="salvar()" class="flex flex-col gap-5">
            <div>
              <label class="block text-sm font-black text-neo-ink uppercase tracking-wider mb-2">Bacia Hidrográfica *</label>
              <input type="text" formControlName="hydrographicBasin" placeholder="Ex: Bacia do Rio Uruguai" class="neo-input">
            </div>
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-black text-neo-ink uppercase tracking-wider mb-2">Início *</label>
                <input type="date" formControlName="startDate" class="neo-input uppercase text-xs">
              </div>
              <div>
                <label class="block text-sm font-black text-neo-ink uppercase tracking-wider mb-2">Fim *</label>
                <input type="date" formControlName="endDate" class="neo-input uppercase text-xs">
              </div>
            </div>
            <div>
              <label class="block text-sm font-black text-neo-ink uppercase tracking-wider mb-2">Observações / Regras</label>
              <textarea formControlName="notes" rows="4" placeholder="Ex: Proibido abate..." class="neo-input resize-none"></textarea>
            </div>
            <button type="submit" [disabled]="regForm.invalid || salvando" class="neo-btn mt-4 w-full">
              {{ salvando ? 'Salvando...' : 'Cadastrar Regra' }}
            </button>
          </form>
        </div>

        <div class="lg:col-span-2 flex flex-col h-fit">
          <div class="neo-table-container">
            <table class="w-full text-left border-collapse neo-table">
              <thead>
              <tr>
                <th>Bacia Hidrográfica</th>
                <th>Período</th>
                <th class="text-right">Ações</th>
              </tr>
              </thead>
              <tbody>
              <tr *ngFor="let reg of regulations">
                <td>
                  <div class="font-bold">{{ reg.hydrographicBasin }}</div>
                  <div class="text-xs font-bold text-neo-muted mt-1 uppercase" [title]="reg.notes">{{ reg.notes || 'SEM OBSERVAÇÕES' }}</div>
                </td>
                <td class="font-black text-neo-rust">
                  {{ reg.startDate | date:'dd/MM/yy' }} - {{ reg.endDate | date:'dd/MM/yy' }}
                </td>
                <td class="text-right">
                  <button (click)="abrirModalExclusao(reg.id)" class="neo-btn neo-btn-danger !px-4 !py-2 !text-xs">Excluir</button>
                </td>
              </tr>
              </tbody>
            </table>
            <div *ngIf="carregando" class="text-center py-8 font-bold text-neo-ink uppercase tracking-widest">Carregando regulamentos...</div>
          </div>
        </div>
      </div>

      <div *ngIf="idParaExcluir !== null" class="fixed inset-0 bg-neo-ink/80 flex items-center justify-center z-50 p-4">
        <div class="neo-card max-w-sm w-full p-8 flex flex-col items-center text-center animate-scale-up bg-white">
          <h3 class="text-3xl font-serif font-black text-neo-ink mb-4">Atenção!</h3>
          <p class="text-neo-ink font-bold text-sm mb-8 leading-relaxed">Você está prestes a excluir esta regra de pesca permanentemente.</p>
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
export class FishingRegulationManagementComponent implements OnInit {
  regForm: FormGroup;
  regulations: FishingRegulation[] = [];
  carregando = true;
  salvando = false;
  idParaExcluir: number | null = null;

  constructor(private fb: FormBuilder, private regService: FishingRegulationService, private cdr: ChangeDetectorRef) {
    this.regForm = this.fb.group({
      hydrographicBasin: ['', Validators.required],
      startDate: ['', Validators.required],
      endDate: ['', Validators.required],
      notes: ['']
    });
  }

  ngOnInit(): void { this.carregarRegulamentos(); }

  carregarRegulamentos(): void {
    this.regService.listarRegulamentos(0, 50).subscribe({
      next: (p) => { this.regulations = p.content; this.carregando = false; this.cdr.detectChanges(); },
      error: () => { this.carregando = false; this.cdr.detectChanges(); }
    });
  }

  salvar(): void {
    if (this.regForm.invalid) return;
    this.salvando = true;
    this.regService.salvarRegulamento(this.regForm.value).subscribe({
      next: (reg) => { this.regulations.unshift(reg); this.regForm.reset(); this.salvando = false; this.cdr.detectChanges(); },
      error: () => { this.salvando = false; this.cdr.detectChanges(); }
    });
  }

  abrirModalExclusao(id: number): void { this.idParaExcluir = id; }
  fecharModalExclusao(): void { this.idParaExcluir = null; }

  confirmarExclusao(): void {
    if (this.idParaExcluir === null) return;
    this.regService.excluirRegulamento(this.idParaExcluir).subscribe({
      next: () => {
        this.regulations = this.regulations.filter(r => r.id !== this.idParaExcluir);
        this.fecharModalExclusao();
        this.cdr.detectChanges();
      },
      error: () => this.fecharModalExclusao()
    });
  }
}
