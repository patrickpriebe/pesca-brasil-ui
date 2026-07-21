import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { FishService } from '../core/services/fish.service';
import { BaitService } from '../core/services/bait.service';
import { EquipmentService } from '../core/services/equipment.service';
import { Fish, Bait, Equipment } from '../core/models/api-models';

@Component({
  selector: 'app-fish-management',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="h-full w-full flex flex-col gap-8 p-4 animate-fade-in relative">
      <div>
        <h2 class="text-4xl font-serif font-black text-neo-ink tracking-tight">
          Catálogo de Peixes
        </h2>
        <p class="text-neo-ink font-bold text-sm mt-2 uppercase tracking-widest">
          Espécies registradas
        </p>
      </div>

      <div class="grid grid-cols-1 xl:grid-cols-3 gap-8 flex-1">
        <div class="neo-card p-8 flex flex-col h-fit">
          <h3 class="text-2xl font-serif font-black text-neo-ink mb-6">Nova Espécie</h3>
          <form [formGroup]="fishForm" (ngSubmit)="salvar()" class="flex flex-col gap-5">
            <div>
              <label class="block text-sm font-black text-neo-ink uppercase tracking-wider mb-2"
                >Nome Comum *</label
              >
              <input
                type="text"
                formControlName="commonName"
                placeholder="Ex: Tucunaré"
                class="neo-input"
              />
            </div>

            <div>
              <label class="block text-sm font-black text-neo-ink uppercase tracking-wider mb-2"
                >Nome Científico</label
              >
              <input
                type="text"
                formControlName="scientificName"
                placeholder="Ex: Cichla ocellaris"
                class="neo-input italic"
              />
            </div>

            <div>
              <label class="block text-sm font-black text-neo-ink uppercase tracking-wider mb-2"
                >Descrição / Comportamento</label
              >
              <textarea
                formControlName="description"
                rows="3"
                placeholder="Ex: Peixe predador de emboscada, prefere águas calmas..."
                class="neo-input resize-none"
              ></textarea>
            </div>

            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-black text-neo-ink uppercase tracking-wider mb-2"
                  >Conservação</label
                >
                <input
                  type="text"
                  formControlName="conservationStatus"
                  placeholder="Ex: LC"
                  class="neo-input uppercase text-xs"
                />
              </div>
              <div>
                <label class="block text-sm font-black text-neo-ink uppercase tracking-wider mb-2"
                  >Imagem (PNG)</label
                >
                <input
                  type="text"
                  formControlName="imageUrl"
                  placeholder="Ex: foto.png"
                  class="neo-input font-mono text-xs"
                />
              </div>
            </div>

            <div class="border-t-[3px] border-neo-ink pt-4 mt-2">
              <h4
                class="text-sm font-black text-neo-ink uppercase tracking-widest mb-4 flex items-center gap-2"
              >
                <svg class="w-4 h-4 text-neo-lime" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fill-rule="evenodd"
                    d="M11.3 1.046A12.014 12.014 0 0010.399 0 11.99 11.99 0 000 10.399c0 1.58.307 3.082.855 4.453l.417.834A2 2 0 002.583 17h.034a2 2 0 001.733-1.045l.504-1.009a9.96 9.96 0 011.838-2.61L8 11h4l1.308 1.336a9.96 9.96 0 011.838 2.61l.504 1.009a2 2 0 001.733 1.045h.034a2 2 0 001.311-1.328l.417-.834A11.99 11.99 0 0020 10.399c0-.306-.015-.611-.046-.913l-4.707-4.707a2 2 0 00-2.828 0l-1.122 1.122-4.707-4.707z"
                    clip-rule="evenodd"
                  ></path>
                </svg>
                Itens Recomendados
              </h4>

              <div class="mb-4">
                <label
                  class="block text-[10px] font-bold text-neo-muted uppercase tracking-wider mb-1"
                  >Iscas Ideais</label
                >
                <select
                  multiple
                  formControlName="recommendedBaitIds"
                  class="neo-input neo-select-multiple custom-scrollbar !h-32 !p-2 !text-xs cursor-pointer"
                >
                  <option *ngFor="let bait of iscas" [value]="bait.id">
                    {{ bait.name }} ({{ bait.type }})
                  </option>
                </select>
                <p class="text-[9px] font-bold uppercase tracking-widest text-neo-ink mt-1">
                  Segure CTRL para selecionar várias
                </p>
              </div>

              <div>
                <label
                  class="block text-[10px] font-bold text-neo-muted uppercase tracking-wider mb-1"
                  >Equipamentos Ideais</label
                >
                <select
                  multiple
                  formControlName="recommendedEquipmentIds"
                  class="neo-input neo-select-multiple custom-scrollbar !h-32 !p-2 !text-xs cursor-pointer"
                >
                  <option *ngFor="let eq of equipamentos" [value]="eq.id">
                    {{ eq.type }} - Ação: {{ eq.action }}
                  </option>
                </select>
              </div>
            </div>

            <button
              type="submit"
              [disabled]="fishForm.invalid || salvando"
              class="neo-btn mt-4 w-full"
            >
              {{ salvando ? 'Salvando...' : 'Cadastrar Espécie' }}
            </button>
          </form>
        </div>

        <div class="xl:col-span-2 flex flex-col h-fit">
          <div class="neo-table-container">
            <table class="w-full text-left border-collapse neo-table">
              <thead>
                <tr>
                  <th>Nome Comum</th>
                  <th>Nome Científico</th>
                  <th class="text-right">Ações</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let fish of fishes">
                  <td class="font-bold">{{ fish.commonName }}</td>
                  <td class="font-bold text-neo-muted italic">
                    {{ fish.scientificName || 'Não informado' }}
                  </td>
                  <td class="text-right">
                    <button
                      (click)="abrirModalExclusao(fish.id)"
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
              Carregando espécies...
            </div>
          </div>
        </div>
      </div>

      <div
        *ngIf="idParaExcluir !== null"
        class="fixed inset-0 bg-neo-ink/80 flex items-center justify-center z-50 p-4"
      >
        <div
          class="neo-card max-w-sm w-full p-8 flex flex-col items-center text-center animate-scale-up bg-white"
        >
          <h3 class="text-3xl font-serif font-black text-neo-ink mb-4">Atenção!</h3>
          <p class="text-neo-ink font-bold text-sm mb-8 leading-relaxed">
            Excluir este peixe pode afetar registros no diário e associações de iscas. Deseja
            continuar?
          </p>
          <div class="flex gap-4 w-full">
            <button (click)="fecharModalExclusao()" class="neo-btn neo-btn-outline flex-1">
              Cancelar
            </button>
            <button (click)="confirmarExclusao()" class="neo-btn neo-btn-danger flex-1">
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
        animation: fadeIn 0.2s ease-out forwards;
      }
      .animate-scale-up {
        animation: scaleUp 0.15s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
      }
    `,
  ],
})
export class FishManagementComponent implements OnInit {
  fishForm: FormGroup;
  fishes: Fish[] = [];
  iscas: Bait[] = [];
  equipamentos: Equipment[] = [];

  carregando = true;
  salvando = false;
  idParaExcluir: number | null = null;

  constructor(
    private fb: FormBuilder,
    private fishService: FishService,
    private baitService: BaitService,
    private equipmentService: EquipmentService,
    private cdr: ChangeDetectorRef,
  ) {
    this.fishForm = this.fb.group({
      commonName: ['', Validators.required],
      scientificName: [''],
      conservationStatus: [''],
      imageUrl: [''],
      recommendedBaitIds: [[]],
      recommendedEquipmentIds: [[]],
    });
  }

  ngOnInit(): void {
    this.carregarPeixes();
    this.carregarAuxiliares();
  }

  carregarAuxiliares(): void {
    this.baitService.listarIscas(0, 100).subscribe((res) => {
      this.iscas = res.content;
      this.cdr.detectChanges();
    });

    this.equipmentService.listarEquipamentos(0, 100).subscribe((res) => {
      this.equipamentos = res.content;
      this.cdr.detectChanges();
    });
  }

  carregarPeixes(): void {
    this.fishService.listarPeixes(0, 50).subscribe({
      next: (p) => {
        this.fishes = p.content;
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
    if (this.fishForm.invalid) return;
    this.salvando = true;

    const payload = {
      ...this.fishForm.value,
      recommendedBaitIds: this.fishForm.value.recommendedBaitIds.map((id: string) => Number(id)),
      recommendedEquipmentIds: this.fishForm.value.recommendedEquipmentIds.map((id: string) =>
        Number(id),
      ),
    };

    this.fishService.salvarPeixe(payload).subscribe({
      next: (f) => {
        this.fishes.unshift(f);
        this.fishForm.reset({ recommendedBaitIds: [], recommendedEquipmentIds: [] });
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
    this.fishService.excluirPeixe(this.idParaExcluir).subscribe({
      next: () => {
        this.fishes = this.fishes.filter((f) => f.id !== this.idParaExcluir);
        this.fecharModalExclusao();
        this.cdr.detectChanges();
      },
      error: () => this.fecharModalExclusao(),
    });
  }
}
