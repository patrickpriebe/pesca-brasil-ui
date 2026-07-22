import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { EquipmentService } from '../core/services/equipment.service';
import { Equipment } from '../core/models/api-models';

@Component({
  selector: 'app-equipment-management',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="h-full w-full flex flex-col gap-8 p-4 animate-fade-in relative">
      <div>
        <h2 class="text-4xl font-serif font-black text-neo-ink tracking-tight">Equipamentos</h2>
        <p class="text-neo-ink font-bold text-sm mt-2 uppercase tracking-widest">Arsenal Técnico</p>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8 flex-1">
        <div class="neo-card p-8 flex flex-col h-fit">
          <h3 class="text-2xl font-serif font-black text-neo-ink mb-6">Novo Arsenal</h3>
          <form [formGroup]="equipForm" (ngSubmit)="salvar()" class="flex flex-col gap-5">
            <div class="relative">
              <label class="block text-sm font-black text-neo-ink uppercase tracking-wider mb-2"
                >Tipo *</label
              >

              <button
                type="button"
                (click)="ddTipo = !ddTipo"
                class="neo-input w-full text-left flex justify-between items-center cursor-pointer bg-white relative z-[51]"
              >
                <span class="block truncate">{{ getTipoNome() }}</span>
                <svg
                  class="w-5 h-5 text-neo-ink pointer-events-none transition-transform"
                  [class.rotate-180]="ddTipo"
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

              <div *ngIf="ddTipo" class="fixed inset-0 z-[50]" (click)="ddTipo = false"></div>
              <div
                *ngIf="ddTipo"
                class="absolute left-0 right-0 top-[calc(100%+8px)] z-[55] bg-white border-[3px] border-neo-ink rounded-xl shadow-[4px_4px_0px_0px_#1D2B1F] flex flex-col overflow-hidden animate-scale-up"
              >
                <button
                  type="button"
                  (click)="selTipo('CARRETILHA')"
                  class="px-4 py-3 text-left font-bold text-neo-ink hover:bg-neo-lime transition-colors border-b-[2px] border-neo-ink/20"
                  [ngClass]="{ 'bg-neo-lime': equipForm.get('type')?.value === 'CARRETILHA' }"
                >
                  Carretilha
                </button>
                <button
                  type="button"
                  (click)="selTipo('MOLINETE')"
                  class="px-4 py-3 text-left font-bold text-neo-ink hover:bg-neo-lime transition-colors"
                  [ngClass]="{ 'bg-neo-lime': equipForm.get('type')?.value === 'MOLINETE' }"
                >
                  Molinete
                </button>
              </div>
            </div>

            <div>
              <label class="block text-sm font-black text-neo-ink uppercase tracking-wider mb-2"
                >Ação *</label
              >
              <input
                type="text"
                formControlName="action"
                placeholder="Ex: Rápida, Média"
                class="neo-input"
              />
            </div>
            <div>
              <label class="block text-sm font-black text-neo-ink uppercase tracking-wider mb-2"
                >Libragem (Linha) *</label
              >
              <input
                type="text"
                formControlName="recommendedLineWeight"
                placeholder="Ex: 10-20 lbs"
                class="neo-input font-mono"
              />
            </div>
            <button
              type="submit"
              [disabled]="equipForm.invalid || salvando"
              class="neo-btn mt-4 w-full"
            >
              {{ salvando ? 'Salvando...' : 'Gravar Equipamento' }}
            </button>
          </form>
        </div>

        <div class="lg:col-span-2 flex flex-col h-fit">
          <div class="neo-table-container">
            <table class="w-full text-left border-collapse neo-table">
              <thead>
                <tr>
                  <th>Tipo</th>
                  <th>Ação</th>
                  <th>Libragem (Linha)</th>
                  <th class="text-right">Ações</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let eq of equipamentos">
                  <td>
                    <span
                      class="border-2 border-neo-ink bg-white font-black px-2 py-1 text-xs shadow-[2px_2px_0px_0px_#1D2B1F]"
                      >{{ eq.type }}</span
                    >
                  </td>
                  <td class="font-bold">{{ eq.action }}</td>
                  <td class="font-black text-neo-muted font-mono">
                    {{ eq.recommendedLineWeight }}
                  </td>
                  <td class="text-right">
                    <button
                      (click)="abrirModalExclusao(eq.id)"
                      class="neo-btn neo-btn-danger !px-4 !py-2 !text-xs"
                    >
                      Excluir
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
            <div
              *ngIf="carregando"
              class="text-center py-8 font-bold text-neo-ink uppercase tracking-widest"
            >
              Carregando equipamentos...
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
            Você está jogando este equipamento fora. Confirma exclusão?
          </p>
          <div class="flex gap-4 w-full">
            <button (click)="fecharModalExclusao()" class="neo-btn neo-btn-outline flex-1">
              Cancelar</button
            ><button (click)="confirmarExclusao()" class="neo-btn neo-btn-danger flex-1">
              Excluir
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
export class EquipmentManagementComponent implements OnInit {
  equipForm: FormGroup;
  equipamentos: Equipment[] = [];
  carregando = true;
  salvando = false;
  idParaExcluir: number | null = null;
  ddTipo = false;

  constructor(
    private fb: FormBuilder,
    private equipService: EquipmentService,
    private cdr: ChangeDetectorRef,
  ) {
    this.equipForm = this.fb.group({
      type: ['CARRETILHA', Validators.required],
      action: ['', Validators.required],
      recommendedLineWeight: ['', Validators.required],
    });
  }

  ngOnInit(): void {
    this.carregarEquipamentos();
  }

  getTipoNome(): string {
    const v = this.equipForm.get('type')?.value;
    return v === 'CARRETILHA' ? 'Carretilha' : v === 'MOLINETE' ? 'Molinete' : 'Selecione...';
  }

  selTipo(t: string): void {
    this.equipForm.patchValue({ type: t });
    this.ddTipo = false;
  }

  carregarEquipamentos(): void {
    this.equipService.listarEquipamentos(0, 50).subscribe({
      next: (p) => {
        this.equipamentos = p.content;
        this.carregando = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.carregando = false;
        this.cdr.detectChanges();
      },
    });
  }

  salvar(): void {
    if (this.equipForm.invalid) return;
    this.salvando = true;
    this.equipService.salvarEquipamento(this.equipForm.value).subscribe({
      next: (e) => {
        this.equipamentos.unshift(e);
        this.equipForm.reset({ type: 'CARRETILHA' });
        this.salvando = false;
        this.cdr.detectChanges();
      },
      error: () => {
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
    this.equipService.excluirEquipamento(this.idParaExcluir).subscribe({
      next: () => {
        this.equipamentos = this.equipamentos.filter((e) => e.id !== this.idParaExcluir);
        this.fecharModalExclusao();
        this.cdr.detectChanges();
      },
    });
  }
}
