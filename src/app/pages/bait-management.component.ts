import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { BaitService } from '../core/services/bait.service';
import { Bait } from '../core/models/api-models';

@Component({
  selector: 'app-bait-management',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="h-full w-full flex flex-col gap-8 p-4 animate-fade-in relative">
      <div>
        <h2 class="text-4xl font-serif font-black text-neo-ink tracking-tight">
          Catálogo de Iscas
        </h2>
        <p class="text-neo-ink font-bold text-sm mt-2 uppercase tracking-widest">
          Artificiais e Naturais
        </p>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8 flex-1">
        <div class="neo-card p-8 flex flex-col h-fit">
          <h3 class="text-2xl font-serif font-black text-neo-ink mb-6">Nova Isca</h3>
          <form [formGroup]="baitForm" (ngSubmit)="salvar()" class="flex flex-col gap-5">
            <div>
              <label class="block text-sm font-black text-neo-ink uppercase tracking-wider mb-2"
                >Nome da Isca *</label
              >
              <input
                type="text"
                formControlName="name"
                placeholder="Ex: Zara Superfície"
                class="neo-input"
              />
            </div>
            <div>
              <label class="block text-sm font-black text-neo-ink uppercase tracking-wider mb-2"
                >Tipo *</label
              >
              <select formControlName="type" class="neo-input neo-select cursor-pointer">
                <option value="ARTIFICIAL">Artificial</option>
                <option value="NATURAL">Natural</option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-black text-neo-ink uppercase tracking-wider mb-2"
                >Descrição</label
              >
              <textarea
                formControlName="description"
                rows="3"
                placeholder="Características..."
                class="neo-input resize-none"
              ></textarea>
            </div>
            <button
              type="submit"
              [disabled]="baitForm.invalid || salvando"
              class="neo-btn mt-4 w-full"
            >
              {{ salvando ? 'Salvando...' : 'Cadastrar Isca' }}
            </button>
          </form>
        </div>

        <div class="lg:col-span-2 flex flex-col h-fit">
          <div class="neo-table-container">
            <table class="w-full text-left border-collapse neo-table">
              <thead>
                <tr>
                  <th>Nome</th>
                  <th>Tipo</th>
                  <th class="text-right">Ações</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let bait of baits">
                  <td class="font-bold">{{ bait.name }}</td>
                  <td>
                    <span
                      class="border-2 border-neo-ink font-black px-2 py-1 text-xs shadow-[2px_2px_0px_0px_#1D2B1F]"
                      [ngClass]="bait.type === 'ARTIFICIAL' ? 'bg-neo-lime' : 'bg-neo-paper'"
                    >
                      {{ bait.type }}
                    </span>
                  </td>
                  <td class="text-right">
                    <button
                      (click)="abrirModalExclusao(bait.id)"
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
              Carregando iscas...
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
            Excluir esta isca apagará o registro do banco de dados.
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
export class BaitManagementComponent implements OnInit {
  baitForm: FormGroup;
  baits: Bait[] = [];
  carregando = true;
  salvando = false;
  idParaExcluir: number | null = null;

  constructor(
    private fb: FormBuilder,
    private baitService: BaitService,
    private cdr: ChangeDetectorRef,
  ) {
    this.baitForm = this.fb.group({
      name: ['', Validators.required],
      type: ['ARTIFICIAL', Validators.required],
      description: [''],
    });
  }

  ngOnInit(): void {
    this.carregarIscas();
  }

  carregarIscas(): void {
    this.baitService.listarIscas(0, 50).subscribe({
      next: (p) => {
        this.baits = p.content;
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
    if (this.baitForm.invalid) return;
    this.salvando = true;
    this.baitService.salvarIsca(this.baitForm.value).subscribe({
      next: (b) => {
        this.baits.unshift(b);
        this.baitForm.reset({ type: 'ARTIFICIAL' });
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
    this.baitService.excluirIsca(this.idParaExcluir).subscribe({
      next: () => {
        this.baits = this.baits.filter((b) => b.id !== this.idParaExcluir);
        this.fecharModalExclusao();
        this.cdr.detectChanges();
      },
      error: () => this.fecharModalExclusao(),
    });
  }
}
