import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { RiverService } from '../core/services/river.service';
import { River } from '../core/models/api-models';

@Component({
  selector: 'app-river-management',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="h-full w-full flex flex-col gap-8 p-4 animate-fade-in relative">

      <div>
        <h2 class="text-4xl font-serif font-black text-neo-ink tracking-tight">Gerenciamento de Rios</h2>
        <p class="text-neo-ink font-bold text-sm mt-2 uppercase tracking-widest">Base de dados hidrográfica</p>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8 flex-1">

        <div class="neo-card p-8 flex flex-col h-fit">
          <h3 class="text-2xl font-serif font-black text-neo-ink mb-6">Novo Rio</h3>

          <form [formGroup]="rioForm" (ngSubmit)="salvar()" class="flex flex-col gap-5">
            <div>
              <label class="block text-sm font-black text-neo-ink uppercase tracking-wider mb-2">Nome do Rio *</label>
              <input type="text" formControlName="name" placeholder="Ex: Rio Jacuí" class="neo-input">
            </div>

            <div>
              <label class="block text-sm font-black text-neo-ink uppercase tracking-wider mb-2">Bacia Hidrográfica *</label>
              <input type="text" formControlName="hydrographicBasin" placeholder="Ex: Bacia do Jacuí" class="neo-input">
            </div>

            <div>
              <label class="block text-sm font-black text-neo-ink uppercase tracking-wider mb-2">Descrição</label>
              <textarea formControlName="description" rows="3" placeholder="Detalhes..." class="neo-input resize-none"></textarea>
            </div>

            <button type="submit" [disabled]="rioForm.invalid || salvando" class="neo-btn mt-4 w-full">
              {{ salvando ? 'Salvando...' : 'Cadastrar Rio' }}
            </button>
          </form>
        </div>

        <div class="lg:col-span-2 flex flex-col h-fit">
          <div class="neo-table-container">
            <table class="w-full text-left border-collapse neo-table">
              <thead>
              <tr>
                <th>Nome do Rio</th>
                <th>Bacia</th>
                <th class="text-right">Ações</th>
              </tr>
              </thead>
              <tbody>
              <tr *ngFor="let rio of rios">
                <td class="font-bold">{{ rio.name }}</td>
                <td class="font-medium text-neo-muted">{{ rio.hydrographicBasin }}</td>
                <td class="text-right">
                  <button (click)="abrirModalExclusao(rio.id)" class="neo-btn neo-btn-danger !px-4 !py-2 !text-xs">Excluir</button>
                </td>
              </tr>
              </tbody>
            </table>

            <div *ngIf="carregando" class="text-center py-8 font-bold text-neo-ink uppercase tracking-widest">Carregando rios...</div>
            <div *ngIf="!carregando && rios.length === 0" class="text-center py-8 font-bold text-neo-ink uppercase tracking-widest">Nenhum rio cadastrado.</div>
          </div>
        </div>
      </div>

      <div *ngIf="idParaExcluir !== null" class="fixed inset-0 bg-neo-ink/80 flex items-center justify-center z-50 p-4">
        <div class="neo-card max-w-sm w-full p-8 flex flex-col items-center text-center animate-scale-up">
          <h3 class="text-3xl font-serif font-black text-neo-ink mb-4">Atenção!</h3>
          <p class="text-neo-ink font-bold text-sm mb-8 leading-relaxed">Tem certeza que deseja remover este rio? A ação é permanente.</p>
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
export class RiverManagementComponent implements OnInit {
  rioForm: FormGroup;
  rios: River[] = [];
  carregando = true;
  salvando = false;
  idParaExcluir: number | null = null;

  constructor(private fb: FormBuilder, private riverService: RiverService, private cdr: ChangeDetectorRef) {
    this.rioForm = this.fb.group({
      name: ['', Validators.required],
      hydrographicBasin: ['', Validators.required],
      description: ['']
    });
  }

  ngOnInit(): void { this.carregarRios(); }

  carregarRios(): void {
    this.riverService.listarRios(0, 50).subscribe({
      next: (pagina) => { this.rios = pagina.content; this.carregando = false; this.cdr.detectChanges(); },
      error: () => { this.carregando = false; this.cdr.detectChanges(); }
    });
  }

  salvar(): void {
    if (this.rioForm.invalid) return;
    this.salvando = true;
    this.riverService.salvarRio(this.rioForm.value).subscribe({
      next: (rioSalvo) => { this.rios.unshift(rioSalvo); this.rioForm.reset(); this.salvando = false; this.cdr.detectChanges(); },
      error: () => { this.salvando = false; this.cdr.detectChanges(); }
    });
  }

  abrirModalExclusao(id: number): void { this.idParaExcluir = id; }
  fecharModalExclusao(): void { this.idParaExcluir = null; }

  confirmarExclusao(): void {
    if (this.idParaExcluir === null) return;
    this.riverService.excluirRio(this.idParaExcluir).subscribe({
      next: () => {
        this.rios = this.rios.filter(r => r.id !== this.idParaExcluir);
        this.fecharModalExclusao();
        this.cdr.detectChanges();
      },
      error: () => this.fecharModalExclusao()
    });
  }
}
