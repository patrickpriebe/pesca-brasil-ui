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
        <p class="text-neo-ink font-bold text-sm mt-2 uppercase tracking-widest">
          Associação de Espécies e Habitats
        </p>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8 flex-1">
        <div class="neo-card p-8 flex flex-col h-fit">
          <h3 class="text-2xl font-serif font-black text-neo-ink mb-6">Nova Ocorrência</h3>

          <form [formGroup]="rsForm" (ngSubmit)="salvar()" class="flex flex-col gap-5">
            <div class="relative">
              <label class="block text-sm font-black text-neo-ink uppercase tracking-wider mb-2"
                >Rio / Bacia *</label
              >
              <button
                type="button"
                (click)="ddRio = !ddRio"
                class="neo-input w-full text-left flex justify-between items-center cursor-pointer bg-white relative z-[51]"
              >
                <span class="block truncate">{{ getRioNome() }}</span>
                <svg
                  class="w-5 h-5 text-neo-ink pointer-events-none transition-transform"
                  [class.rotate-180]="ddRio"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="3"
                    d="M19 9l-7 7-7-7"
                  ></path>
                </svg>
              </button>
              <div *ngIf="ddRio" class="fixed inset-0 z-[50]" (click)="ddRio = false"></div>
              <div
                *ngIf="ddRio"
                class="absolute left-0 right-0 top-[calc(100%+8px)] z-[55] bg-white border-[3px] border-neo-ink rounded-xl shadow-[4px_4px_0px_0px_#1D2B1F] flex flex-col max-h-48 overflow-y-auto custom-scrollbar animate-scale-up"
              >
                <button
                  type="button"
                  *ngFor="let r of rios"
                  (click)="selRio(r.id)"
                  class="px-4 py-3 text-left font-bold text-neo-ink hover:bg-neo-lime transition-colors border-b-[2px] border-neo-ink/20 last:border-b-0"
                  [ngClass]="{ 'bg-neo-lime': rsForm.get('riverId')?.value === r.id }"
                >
                  {{ r.name }}
                </button>
              </div>
            </div>

            <div class="relative">
              <label class="block text-sm font-black text-neo-ink uppercase tracking-wider mb-2"
                >Espécie de Peixe *</label
              >
              <button
                type="button"
                (click)="ddPeixe = !ddPeixe"
                class="neo-input w-full text-left flex justify-between items-center cursor-pointer bg-white relative z-[51]"
              >
                <span class="block truncate">{{ getPeixeNome() }}</span>
                <svg
                  class="w-5 h-5 text-neo-ink pointer-events-none transition-transform"
                  [class.rotate-180]="ddPeixe"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="3"
                    d="M19 9l-7 7-7-7"
                  ></path>
                </svg>
              </button>
              <div *ngIf="ddPeixe" class="fixed inset-0 z-[50]" (click)="ddPeixe = false"></div>
              <div
                *ngIf="ddPeixe"
                class="absolute left-0 right-0 top-[calc(100%+8px)] z-[55] bg-white border-[3px] border-neo-ink rounded-xl shadow-[4px_4px_0px_0px_#1D2B1F] flex flex-col max-h-48 overflow-y-auto custom-scrollbar animate-scale-up"
              >
                <button
                  type="button"
                  *ngFor="let p of peixes"
                  (click)="selPeixe(p.id)"
                  class="px-4 py-3 text-left font-bold text-neo-ink hover:bg-neo-lime transition-colors border-b-[2px] border-neo-ink/20 last:border-b-0"
                  [ngClass]="{ 'bg-neo-lime': rsForm.get('fishId')?.value === p.id }"
                >
                  {{ p.commonName }}
                </button>
              </div>
            </div>

            <div class="grid grid-cols-2 gap-4">
              <div class="relative">
                <label class="block text-sm font-black text-neo-ink uppercase tracking-wider mb-2"
                  >Abundância *</label
                >
                <button
                  type="button"
                  (click)="ddAbundancia = !ddAbundancia"
                  class="neo-input w-full text-left flex justify-between items-center cursor-pointer bg-white relative z-[51]"
                >
                  <span class="block truncate">{{ getAbundanciaNome() }}</span>
                  <svg
                    class="w-5 h-5 text-neo-ink pointer-events-none transition-transform"
                    [class.rotate-180]="ddAbundancia"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="3"
                      d="M19 9l-7 7-7-7"
                    ></path>
                  </svg>
                </button>
                <div
                  *ngIf="ddAbundancia"
                  class="fixed inset-0 z-[50]"
                  (click)="ddAbundancia = false"
                ></div>
                <div
                  *ngIf="ddAbundancia"
                  class="absolute left-0 right-0 top-[calc(100%+8px)] z-[55] bg-white border-[3px] border-neo-ink rounded-xl shadow-[4px_4px_0px_0px_#1D2B1F] flex flex-col max-h-48 overflow-y-auto custom-scrollbar animate-scale-up"
                >
                  <button
                    type="button"
                    (click)="selAbundancia('ALTA')"
                    class="px-4 py-3 text-left font-bold border-b-[2px] border-neo-ink/20 hover:bg-neo-lime"
                    [ngClass]="{ 'bg-neo-lime': rsForm.get('abundance')?.value === 'ALTA' }"
                  >
                    Alta
                  </button>
                  <button
                    type="button"
                    (click)="selAbundancia('MEDIA')"
                    class="px-4 py-3 text-left font-bold border-b-[2px] border-neo-ink/20 hover:bg-neo-lime"
                    [ngClass]="{ 'bg-neo-lime': rsForm.get('abundance')?.value === 'MEDIA' }"
                  >
                    Média
                  </button>
                  <button
                    type="button"
                    (click)="selAbundancia('BAIXA')"
                    class="px-4 py-3 text-left font-bold border-b-[2px] border-neo-ink/20 hover:bg-neo-lime"
                    [ngClass]="{ 'bg-neo-lime': rsForm.get('abundance')?.value === 'BAIXA' }"
                  >
                    Baixa
                  </button>
                  <button
                    type="button"
                    (click)="selAbundancia('RARA')"
                    class="px-4 py-3 text-left font-bold hover:bg-neo-lime"
                    [ngClass]="{ 'bg-neo-lime': rsForm.get('abundance')?.value === 'RARA' }"
                  >
                    Rara
                  </button>
                </div>
              </div>

              <div>
                <label class="block text-sm font-black text-neo-ink uppercase tracking-wider mb-2"
                  >Melhor Época</label
                >
                <input
                  type="text"
                  formControlName="bestSeason"
                  placeholder="Ex: Verão"
                  class="neo-input"
                />
              </div>
            </div>

            <button
              type="submit"
              [disabled]="rsForm.invalid || salvando"
              class="neo-btn mt-4 w-full"
            >
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
                    <div class="text-xs font-bold uppercase tracking-widest mt-1">
                      {{ rs.bestSeason || 'S/ Época' }}
                    </div>
                  </td>
                  <td class="text-right">
                    <button
                      (click)="abrirModalExclusao(rs.id)"
                      class="neo-btn neo-btn-danger !px-4 !py-2 !text-xs"
                    >
                      Remover
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
            <div
              *ngIf="carregando"
              class="text-center py-8 font-bold text-neo-ink uppercase tracking-widest"
            >
              Carregando dados...
            </div>
          </div>
        </div>
      </div>

      <div
        *ngIf="idParaExcluir !== null"
        class="fixed inset-0 bg-neo-ink/80 flex items-center justify-center z-[100] p-4"
      >
        <div
          class="neo-card max-w-sm w-full p-8 flex flex-col items-center text-center animate-scale-up bg-white"
        >
          <h3 class="text-3xl font-serif font-black text-neo-ink mb-4">Atenção!</h3>
          <p class="text-neo-ink font-bold text-sm mb-8 leading-relaxed">
            Isso removerá a ocorrência desta espécie neste rio. Deseja continuar?
          </p>
          <div class="flex gap-4 w-full">
            <button (click)="fecharModalExclusao()" class="neo-btn neo-btn-outline flex-1">
              Cancelar</button
            ><button (click)="confirmarExclusao()" class="neo-btn neo-btn-danger flex-1">
              Remover
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      @keyframes fadeIn {
        from {
          opacity: 0;
        }
        to {
          opacity: 1;
        }
      }
      @keyframes scaleUp {
        from {
          transform: scale(0.96);
          opacity: 0;
        }
        to {
          transform: scale(1);
          opacity: 1;
        }
      }
      .animate-fade-in {
        animation: fadeIn 0.15s ease-out forwards;
      }
      .animate-scale-up {
        animation: scaleUp 0.15s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
      }
    `,
  ],
})
export class RiverSpeciesManagementComponent implements OnInit {
  rsForm: FormGroup;
  associacoes: RiverSpecies[] = [];
  rios: River[] = [];
  peixes: Fish[] = [];
  carregando = true;
  salvando = false;
  idParaExcluir: number | null = null;

  ddRio = false;
  ddPeixe = false;
  ddAbundancia = false;

  constructor(
    private fb: FormBuilder,
    private rsService: RiverSpeciesService,
    private riverService: RiverService,
    private fishService: FishService,
    private cdr: ChangeDetectorRef,
  ) {
    this.rsForm = this.fb.group({
      riverId: ['', Validators.required],
      fishId: ['', Validators.required],
      abundance: ['MEDIA', Validators.required],
      bestSeason: [''],
    });
  }

  ngOnInit(): void {
    this.carregarAssociacoes();
    this.carregarListasBase();
  }
  carregarListasBase(): void {
    this.riverService.listarRios(0, 100).subscribe((r) => {
      this.rios = r.content;
      this.cdr.detectChanges();
    });
    this.fishService.listarPeixes(0, 100).subscribe((p) => {
      this.peixes = p.content;
      this.cdr.detectChanges();
    });
  }
  carregarAssociacoes(): void {
    this.rsService.listarAssociacoes(0, 50).subscribe({
      next: (p) => {
        this.associacoes = p.content;
        this.carregando = false;
        this.cdr.detectChanges();
      },
    });
  }

  getRioNome(): string {
    const v = this.rsForm.get('riverId')?.value;
    return v ? this.rios.find((r) => r.id === v)?.name || 'Selecione...' : 'Selecione o rio...';
  }
  selRio(id: number): void {
    this.rsForm.patchValue({ riverId: id });
    this.ddRio = false;
  }

  getPeixeNome(): string {
    const v = this.rsForm.get('fishId')?.value;
    return v
      ? this.peixes.find((p) => p.id === v)?.commonName || 'Selecione...'
      : 'Selecione a espécie...';
  }
  selPeixe(id: number): void {
    this.rsForm.patchValue({ fishId: id });
    this.ddPeixe = false;
  }

  getAbundanciaNome(): string {
    const v = this.rsForm.get('abundance')?.value;
    return v === 'ALTA'
      ? 'Alta'
      : v === 'MEDIA'
        ? 'Média'
        : v === 'BAIXA'
          ? 'Baixa'
          : v === 'RARA'
            ? 'Rara'
            : 'Selecione...';
  }
  selAbundancia(v: string): void {
    this.rsForm.patchValue({ abundance: v });
    this.ddAbundancia = false;
  }

  salvar(): void {
    if (this.rsForm.invalid) return;
    this.salvando = true;
    const payload: RiverSpeciesPayload = {
      ...this.rsForm.value,
      riverId: Number(this.rsForm.value.riverId),
      fishId: Number(this.rsForm.value.fishId),
    };
    this.rsService.salvarAssociacao(payload).subscribe({
      next: (rs) => {
        rs.riverName = this.rios.find((r) => r.id === payload.riverId)?.name;
        rs.fishName = this.peixes.find((p) => p.id === payload.fishId)?.commonName;
        this.associacoes.unshift(rs);
        this.rsForm.reset({ abundance: 'MEDIA' });
        this.salvando = false;
        this.cdr.detectChanges();
      },
    });
  }

  abrirModalExclusao(id: number): void {
    this.idParaExcluir = id;
  }
  fecharModalExclusao(): void {
    this.idParaExcluir = null;
  }
  confirmarExclusao(): void {
    if (this.idParaExcluir === null) return;
    this.rsService.excluirAssociacao(this.idParaExcluir).subscribe({
      next: () => {
        this.associacoes = this.associacoes.filter((rs) => rs.id !== this.idParaExcluir);
        this.fecharModalExclusao();
        this.cdr.detectChanges();
      },
    });
  }
}
