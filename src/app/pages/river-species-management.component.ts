import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { RiverSpeciesService } from '../core/services/river-species.service';
import { RiverService } from '../core/services/river.service';
import { FishService } from '../core/services/fish.service';
import { RiverSpecies, RiverSpeciesPayload, River, Fish } from '../core/models/api-models';

@Component({
  selector: 'app-river-species-management',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="h-full w-full flex flex-col gap-8 p-4 animate-fade-in relative">
      <div>
        <h2 class="text-4xl font-serif font-black text-neo-ink tracking-tight">Rios e Peixes</h2>
        <p class="text-neo-ink font-bold text-sm mt-2 uppercase tracking-widest">Associação de Espécies e Habitats</p>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8 flex-1">
        <div class="neo-card p-8 flex flex-col h-fit">
          <h3 class="text-2xl font-serif font-black text-neo-ink mb-6">Nova Ocorrência</h3>

          <form [formGroup]="rsForm" (ngSubmit)="salvar()" class="flex flex-col gap-5">
            <div>
              <label class="block text-sm font-black text-neo-ink uppercase tracking-wider mb-2">Rio / Bacia *</label>
              <select formControlName="riverId" class="neo-input cursor-pointer">
                <option value="" disabled selected>Selecione o rio...</option>
                <option *ngFor="let r of rios" [value]="r.id">{{ r.name }}</option>
              </select>
            </div>

            <div>
              <label class="block text-sm font-black text-neo-ink uppercase tracking-wider mb-2">Espécie de Peixe *</label>
              <select formControlName="fishId" class="neo-input cursor-pointer">
                <option value="" disabled selected>Selecione a espécie...</option>
                <option *ngFor="let f of peixes" [value]="f.id">{{ f.commonName }}</option>
              </select>
            </div>

            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-black text-neo-ink uppercase tracking-wider mb-2">Abundância *</label>
                <select formControlName="abundance" class="neo-input cursor-pointer">
                  <option value="ALTA">Alta</option>
                  <option value="MEDIA">Média</option>
                  <option value="BAIXA">Baixa</option>
                  <option value="RARA">Rara</option>
                </select>
              </div>

              <div>
                <label class="block text-sm font-black text-neo-ink uppercase tracking-wider mb-2">Melhor Época</label>
                <input type="text" formControlName="bestSeason" placeholder="Ex: Verão" class="neo-input">
              </div>
            </div>

            <button type="submit" [disabled]="rsForm.invalid || salvando" class="neo-btn mt-4 w-full">
              {{ salvando ? 'Salvando...' : 'Vincular Peixe ao Rio' }}
            </button>
          </form>
        </div>

        <div class="lg:col-span-2 flex flex-col h-fit">
          <div class="neo-table-container">
            <table class="w-full text-left border-collapse neo-table">
              <thead>
              <tr>
                <th>Rio</th>
                <th>Peixe</th>
                <th>Status</th>
                <th class="text-right">Ações</th>
              </tr>
              </thead>
              <tbody>
              <tr *ngFor="let rs of associacoes">
                <td class="font-bold">{{ rs.riverName || 'ID: ' + rs.riverId }}</td>
                <td class="font-bold text-neo-muted">{{ rs.fishName || 'ID: ' + rs.fishId }}</td>
                <td>
                  <div class="font-black text-neo-ink">{{ rs.abundance }}</div>
                  <div class="text-xs font-bold uppercase tracking-widest mt-1">{{ rs.bestSeason || 'S/ Época' }}</div>
                </td>
                <td class="text-right">
                  <button (click)="abrirModalExclusao(rs.id)" class="neo-btn neo-btn-danger !px-4 !py-2 !text-xs">Remover</button>
                </td>
              </tr>
              </tbody>
            </table>
            <div *ngIf="carregando" class="text-center py-8 font-bold text-neo-ink uppercase tracking-widest">Carregando dados...</div>
            <div *ngIf="!carregando && associacoes.length === 0" class="text-center py-8 font-bold text-neo-ink uppercase tracking-widest">Nenhuma espécie mapeada.</div>
          </div>
        </div>
      </div>

      <div *ngIf="idParaExcluir !== null" class="fixed inset-0 bg-neo-ink/80 flex items-center justify-center z-50 p-4">
        <div class="neo-card max-w-sm w-full p-8 flex flex-col items-center text-center animate-scale-up bg-white">
          <h3 class="text-3xl font-serif font-black text-neo-ink mb-4">Atenção!</h3>
          <p class="text-neo-ink font-bold text-sm mb-8 leading-relaxed">Isso removerá a ocorrência desta espécie neste rio. Deseja continuar?</p>
          <div class="flex gap-4 w-full">
            <button (click)="fecharModalExclusao()" class="neo-btn neo-btn-outline flex-1">Cancelar</button>
            <button (click)="confirmarExclusao()" class="neo-btn neo-btn-danger flex-1">Remover</button>
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
export class RiverSpeciesManagementComponent implements OnInit {
  rsForm: FormGroup;
  associacoes: RiverSpecies[] = [];
  rios: River[] = [];
  peixes: Fish[] = [];
  carregando = true;
  salvando = false;
  idParaExcluir: number | null = null;

  constructor(
    private fb: FormBuilder,
    private rsService: RiverSpeciesService,
    private riverService: RiverService,
    private fishService: FishService,
    private cdr: ChangeDetectorRef
  ) {
    this.rsForm = this.fb.group({
      riverId: ['', Validators.required],
      fishId: ['', Validators.required],
      abundance: ['MEDIA', Validators.required],
      bestSeason: ['']
    });
  }

  ngOnInit(): void {
    this.carregarAssociacoes();
    this.carregarListasBase();
  }

  carregarListasBase(): void {
    this.riverService.listarRios(0, 100).subscribe(r => { this.rios = r.content; this.cdr.detectChanges(); });
    this.fishService.listarPeixes(0, 100).subscribe(p => { this.peixes = p.content; this.cdr.detectChanges(); });
  }

  carregarAssociacoes(): void {
    this.rsService.listarAssociacoes(0, 50).subscribe({
      next: (p) => { this.associacoes = p.content; this.carregando = false; this.cdr.detectChanges(); },
      error: () => { this.carregando = false; this.cdr.detectChanges(); }
    });
  }

  salvar(): void {
    if (this.rsForm.invalid) return;
    this.salvando = true;

    const payload: RiverSpeciesPayload = {
      ...this.rsForm.value,
      riverId: Number(this.rsForm.value.riverId),
      fishId: Number(this.rsForm.value.fishId)
    };

    this.rsService.salvarAssociacao(payload).subscribe({
      next: (rs) => {
        const nomeRio = this.rios.find(r => r.id === payload.riverId)?.name;
        const nomePeixe = this.peixes.find(p => p.id === payload.fishId)?.commonName;
        rs.riverName = nomeRio;
        rs.fishName = nomePeixe;

        this.associacoes.unshift(rs);
        this.rsForm.reset({abundance: 'MEDIA'});
        this.salvando = false;
        this.cdr.detectChanges();
      },
      error: () => { this.salvando = false; this.cdr.detectChanges(); }
    });
  }

  abrirModalExclusao(id: number): void { this.idParaExcluir = id; }
  fecharModalExclusao(): void { this.idParaExcluir = null; }

  confirmarExclusao(): void {
    if (this.idParaExcluir === null) return;
    this.rsService.excluirAssociacao(this.idParaExcluir).subscribe({
      next: () => {
        this.associacoes = this.associacoes.filter(rs => rs.id !== this.idParaExcluir);
        this.fecharModalExclusao();
        this.cdr.detectChanges();
      },
      error: () => this.fecharModalExclusao()
    });
  }
}
