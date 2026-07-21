import { Component, OnInit, ChangeDetectorRef, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CatchRecordService } from '../../core/services/catch-record.service';
import { AuthService } from '../../core/services/auth/auth.service';
import { CatchRecord } from '../../core/models/api-models';

@Component({
  selector: 'app-logbook',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="min-h-screen w-full flex flex-col gap-6 animate-fade-in pb-8">

      <div class="max-w-6xl mx-auto w-full px-4 mt-8">
        <div class="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
          <div>
            <h2 class="text-5xl font-serif font-black text-neo-ink tracking-tight">Diário</h2>
            <p class="text-neo-ink font-bold text-sm mt-2 uppercase tracking-widest">Navegue pelas suas fisgadas</p>
          </div>

          <div class="flex gap-4 w-full md:w-auto">
            <input type="text" [(ngModel)]="termoBusca" (keyup.enter)="buscar()" placeholder="Buscar peixe ou local..." class="neo-input md:w-72">
            <button (click)="buscar()" class="neo-btn">
              Buscar
            </button>
          </div>
        </div>
      </div>

      <div *ngIf="carregando" class="max-w-6xl mx-auto w-full flex-1 flex flex-col items-center justify-center min-h-[400px]">
        <div class="w-12 h-12 border-[4px] border-neo-paper border-t-neo-ink rounded-full animate-spin mb-4"></div>
        <p class="text-neo-ink font-black uppercase tracking-widest">Pesquisando registros...</p>
      </div>

      <div *ngIf="!carregando && capturas.length === 0" class="max-w-6xl mx-auto w-full flex-1 flex flex-col items-center justify-center neo-card bg-white p-12 text-center my-4">
        <h3 class="text-2xl font-black text-neo-ink mb-2 uppercase tracking-widest">Nenhuma captura encontrada</h3>
        <p class="text-neo-ink font-bold">O diário está vazio ou a busca não encontrou resultados.</p>
      </div>

      <div *ngIf="!carregando && capturas.length > 0" class="flex-1 relative w-full overflow-hidden min-h-[600px] py-8">

        <button (click)="peixeAnterior()" [disabled]="currentIndex === 0"
                class="absolute left-4 md:left-8 xl:left-[calc(50%-550px)] top-1/2 -translate-y-1/2 z-30 neo-btn !p-0 w-14 h-14 !rounded-full focus:outline-none disabled:opacity-0 bg-white">
          <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M15 19l-7-7 7-7"></path></svg>
        </button>

        <div class="absolute left-1/2 top-1/2 flex items-center gap-6 transition-transform duration-500 ease-out" [style.transform]="getTrackTransform()">

          <div *ngFor="let cap of capturas; let i = index"
               (click)="onCardClick(i)"
               [ngClass]="i === currentIndex ? 'opacity-100 scale-100' : 'opacity-40 scale-95 cursor-pointer hover:opacity-70'"
               class="w-[280px] sm:w-[420px] md:w-[540px] shrink-0 neo-card bg-white flex flex-col transition-all duration-500 ease-out select-none overflow-hidden">

            <div class="w-full h-56 sm:h-72 md:h-[350px] relative bg-neo-paper flex items-center justify-center overflow-hidden border-b-[3px] border-neo-ink">
              <div class="absolute inset-0 opacity-10 bg-[radial-gradient(#1D2B1F_2px,transparent_2px)] [background-size:16px_16px]"></div>

              <img [src]="cap.photoUrl || 'assets/placeholder-fish.png'" [alt]="cap.fishName" class="relative z-10 max-w-full max-h-full object-contain filter drop-shadow-[4px_4px_0px_rgba(29,43,31,0.5)]">

              <div class="absolute top-4 left-4 z-20">
                <span *ngIf="cap.outcome === 'RELEASED'" class="border-[3px] border-neo-ink bg-neo-lime text-neo-ink font-black px-3 py-1.5 text-xs uppercase tracking-widest shadow-[4px_4px_0px_0px_#1D2B1F]">
                  Pesque & Solte
                </span>
                <span *ngIf="cap.outcome === 'KEPT'" class="border-[3px] border-neo-ink bg-neo-rust text-white font-black px-3 py-1.5 text-xs uppercase tracking-widest shadow-[4px_4px_0px_0px_#1D2B1F]">
                  Abatido
                </span>
              </div>
            </div>

            <div class="p-6 flex flex-col bg-white">
              <div class="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-5 pb-5 border-b-[3px] border-neo-ink">
                <div>
                  <p class="text-neo-muted font-bold tracking-widest uppercase text-[10px] mb-1">{{ cap.catchDate | date:"dd 'de' MMMM, yyyy" }}</p>
                  <h3 class="text-2xl sm:text-3xl font-black text-neo-ink tracking-tight uppercase">{{ cap.fishName }}</h3>
                  <p class="text-sm font-bold mt-1 uppercase flex items-center gap-1.5">
                    📍 {{ cap.fishingSpotName }}
                  </p>
                </div>

                <div class="text-left sm:text-right border-2 border-neo-ink p-2 bg-neo-paper shadow-[2px_2px_0px_0px_#1D2B1F]">
                  <p class="text-[9px] text-neo-ink uppercase font-black tracking-widest">Pescador</p>
                  <p class="text-sm font-bold uppercase truncate max-w-[120px]">
                    {{ cap.userName || 'Desconhecido' }}
                  </p>
                </div>
              </div>

              <div class="grid grid-cols-3 gap-4 text-center">
                <div class="border-r-[3px] border-neo-ink pr-2">
                  <p class="text-[10px] font-black uppercase tracking-widest mb-1">Peso</p>
                  <p class="font-mono font-black text-lg">{{ cap.weightInKg ? cap.weightInKg + 'KG' : '--' }}</p>
                </div>
                <div class="border-r-[3px] border-neo-ink px-2">
                  <p class="text-[10px] font-black uppercase tracking-widest mb-1">Tamanho</p>
                  <p class="font-mono font-black text-lg">{{ cap.lengthInCm ? cap.lengthInCm + 'CM' : '--' }}</p>
                </div>
                <div class="pl-2">
                  <p class="text-[10px] font-black uppercase tracking-widest mb-1">Isca</p>
                  <p class="font-bold text-sm uppercase truncate" [title]="cap.baitName || 'Nenhuma'">
                    {{ cap.baitName || 'Nenhuma' }}
                  </p>
                </div>
              </div>

              <div *ngIf="podeEditar(cap) && i === currentIndex" class="mt-6 pt-6 border-t-[3px] border-neo-ink flex gap-4">
                <button class="neo-btn neo-btn-outline flex-1 !py-2 !text-xs">Editar</button>
                <button class="neo-btn neo-btn-danger flex-1 !py-2 !text-xs">Excluir</button>
              </div>
            </div>
          </div>

        </div>

        <button (click)="proximoPeixe()" [disabled]="currentIndex === capturas.length - 1"
                class="absolute right-4 md:right-8 xl:right-[calc(50%-550px)] top-1/2 -translate-y-1/2 z-30 neo-btn !p-0 w-14 h-14 !rounded-full focus:outline-none disabled:opacity-0 bg-white">
          <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M9 5l7 7-7 7"></path></svg>
        </button>
      </div>

      <div *ngIf="!carregando && capturas.length > 0" class="max-w-6xl mx-auto w-full flex justify-center items-center">
        <span class="bg-neo-lime border-[3px] border-neo-ink px-6 py-2 shadow-[4px_4px_0px_0px_#1D2B1F] text-sm font-black uppercase tracking-widest">
          Registro {{ currentIndex + 1 }} de {{ capturas.length }}
        </span>
      </div>

    </div>
  `,
  styles: [`
    @keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
    .animate-fade-in { animation: fadeIn 0.4s ease-out forwards; }
    .cubic-bezier { transition-timing-function: cubic-bezier(0.25, 1, 0.5, 1); }
  `]
})
export class LogbookComponent implements OnInit {
  capturas: CatchRecord[] = [];
  carregando: boolean = true;
  currentIndex: number = 0;
  termoBusca: string = '';

  constructor(
    private catchRecordService: CatchRecordService,
    public authService: AuthService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.carregarDados();
  }

  @HostListener('window:resize')
  onResize(): void {
    this.cdr.detectChanges();
  }

  carregarDados(): void {
    this.carregando = true;
    this.catchRecordService.listarCapturas(0, 50, 'catchDate', this.termoBusca).subscribe({
      next: (paginaDoSpring) => {
        this.capturas = paginaDoSpring.content;
        this.currentIndex = 0;
        this.carregando = false;
        this.cdr.detectChanges();
      },
      error: (erro) => {
        console.error('Falha de comunicação:', erro);
        this.carregando = false;
        this.cdr.detectChanges();
      }
    });
  }

  buscar(): void {
    this.carregarDados();
  }

  proximoPeixe(): void {
    if (this.currentIndex < this.capturas.length - 1) {
      this.currentIndex++;
      this.cdr.detectChanges();
    }
  }

  peixeAnterior(): void {
    if (this.currentIndex > 0) {
      this.currentIndex--;
      this.cdr.detectChanges();
    }
  }

  onCardClick(index: number): void {
    if (index === this.currentIndex - 1) {
      this.peixeAnterior();
    } else if (index === this.currentIndex + 1) {
      this.proximoPeixe();
    }
  }

  getTrackTransform(): string {
    let cardWidth = 270;
    let gap = 16;

    if (typeof window !== 'undefined') {
      const viewWidth = document.documentElement.clientWidth;
      if (viewWidth >= 768) {
        cardWidth = 520;
        gap = 32;
      } else if (viewWidth >= 640) {
        cardWidth = 400;
        gap = 24;
      }
    }

    const deslocamento = (cardWidth / 2) + (this.currentIndex * (cardWidth + gap));

    return `translate(-${deslocamento}px, -50%)`;
  }

  podeEditar(cap: CatchRecord): boolean {
    if (this.authService.isAdmin()) {
      return true;
    }
    const nomeLogado = this.authService.getUserName();
    return cap.userName === nomeLogado;
  }
}
