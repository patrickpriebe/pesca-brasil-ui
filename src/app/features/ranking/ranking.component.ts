import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CatchRecordService } from '../../core/services/catch-record.service';

export interface RankingPeixe {
  posicao: number;
  pescador: string;
  especie: string;
  local: string;
  medida: number;
  fotoUrl?: string;
}

export interface RankingPescador {
  posicao: number;
  pescador: string;
  capturas: number;
  diasNaAgua: number;
}

type CategoriaRanking = 'COMPRIMENTO' | 'PESO' | 'CAPTURAS';

@Component({
  selector: 'app-ranking',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="h-full w-full flex flex-col max-w-6xl mx-auto overflow-hidden animate-fade-in px-4 pb-12 pt-6">

      <div class="text-center mb-10">
        <h2 class="text-5xl font-serif font-black text-neo-ink tracking-tighter uppercase">Ranking de<span class="text-neo-lime" style="text-shadow: 2px 2px 0px #1D2B1F;"> Peixes</span></h2>
        <p class="text-neo-ink font-bold text-sm mt-3 uppercase tracking-widest">As lendas oficiais da pescaria</p>
      </div>

      <div class="flex justify-center mb-12">
        <div class="flex flex-wrap justify-center gap-4">
          <button (click)="mudarCategoria('COMPRIMENTO')"
                  [ngClass]="categoriaAtual === 'COMPRIMENTO' ? 'neo-btn' : 'neo-btn neo-btn-outline bg-white hover:-translate-y-1'">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"></path></svg>
            Maior Peixe
          </button>

          <button (click)="mudarCategoria('PESO')"
                  [ngClass]="categoriaAtual === 'PESO' ? 'neo-btn' : 'neo-btn neo-btn-outline bg-white hover:-translate-y-1'">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3"></path></svg>
            Pesos Pesados
          </button>

          <button (click)="mudarCategoria('CAPTURAS')"
                  [ngClass]="categoriaAtual === 'CAPTURAS' ? 'neo-btn' : 'neo-btn neo-btn-outline bg-white hover:-translate-y-1'">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"></path></svg>
            Mestres da Pesca
          </button>
        </div>
      </div>

      <div *ngIf="carregando" class="flex-1 flex flex-col items-center justify-center min-h-[300px]">
        <div class="w-12 h-12 border-[4px] border-neo-paper border-t-neo-ink rounded-full animate-spin mb-4"></div>
        <p class="text-neo-ink font-black uppercase tracking-widest text-sm">Calculando...</p>
      </div>

      <div *ngIf="!carregando && (top3Peixes.length === 0 && rankPescadores.length === 0)" class="flex-1 flex flex-col items-center justify-center neo-card bg-white p-12 text-center my-4">
        <span class="text-6xl mb-4 font-serif">🏆</span>
        <h3 class="text-2xl font-black text-neo-ink mb-2 uppercase">Nenhum registro</h3>
        <p class="text-neo-ink font-bold">A história ainda será escrita neste clube.</p>
      </div>

      <div class="flex-1 animate-scale-up" *ngIf="!carregando && (categoriaAtual === 'COMPRIMENTO' || categoriaAtual === 'PESO') && top3Peixes.length > 0">
        <div class="flex flex-col md:flex-row justify-center items-end gap-6 md:gap-4 mb-16 mt-8">

          <div *ngIf="top3Peixes[1]" class="flex flex-col items-center order-2 md:order-1 w-full md:w-56 z-10">
            <div class="neo-card bg-white w-full pt-10 pb-6 px-4 text-center relative border-t-[8px] border-t-slate-400">
              <div class="absolute -top-6 left-1/2 -translate-x-1/2 w-12 h-12 bg-slate-300 rounded-full border-[3px] border-neo-ink flex items-center justify-center shadow-[4px_4px_0px_0px_#1D2B1F]">
                <span class="text-neo-ink font-black text-xl">2</span>
              </div>
              <p class="font-black text-neo-ink text-xl truncate uppercase" [title]="top3Peixes[1].pescador">{{ top3Peixes[1].pescador }}</p>
              <p class="text-xs text-neo-muted font-bold truncate mt-1">{{ top3Peixes[1].especie }}</p>
              <div class="mt-4 bg-neo-paper border-2 border-neo-ink py-2 px-3 inline-block shadow-[2px_2px_0px_0px_#1D2B1F]">
                <p class="text-xl font-black font-mono tracking-tighter">{{ top3Peixes[1].medida }} <span class="text-[10px] font-sans font-bold uppercase">{{ unidadeAtual }}</span></p>
              </div>
            </div>
          </div>

          <div *ngIf="top3Peixes[0]" class="flex flex-col items-center order-1 md:order-2 w-full md:w-64 z-20 md:-translate-y-8">
            <div class="neo-card bg-neo-lime w-full pt-12 pb-8 px-4 text-center relative border-t-[8px] border-t-yellow-400">
              <div class="absolute -top-8 left-1/2 -translate-x-1/2 w-16 h-16 bg-yellow-400 rounded-full border-[3px] border-neo-ink flex items-center justify-center shadow-[4px_4px_0px_0px_#1D2B1F]">
                <span class="text-neo-ink font-black text-3xl">1</span>
              </div>
              <p class="font-black text-neo-ink text-2xl truncate uppercase" [title]="top3Peixes[0].pescador">{{ top3Peixes[0].pescador }}</p>
              <p class="text-xs text-neo-ink font-bold truncate mt-1 tracking-widest uppercase">{{ top3Peixes[0].especie }}</p>
              <div class="mt-5 bg-white border-[3px] border-neo-ink py-2 px-4 inline-block shadow-[4px_4px_0px_0px_#1D2B1F]">
                <p class="text-3xl font-black font-mono tracking-tighter">{{ top3Peixes[0].medida }} <span class="text-xs font-sans font-bold uppercase">{{ unidadeAtual }}</span></p>
              </div>
            </div>
          </div>

          <div *ngIf="top3Peixes[2]" class="flex flex-col items-center order-3 w-full md:w-56 z-10">
            <div class="neo-card bg-white w-full pt-10 pb-6 px-4 text-center relative border-t-[8px] border-t-neo-rust">
              <div class="absolute -top-6 left-1/2 -translate-x-1/2 w-12 h-12 bg-neo-rust rounded-full border-[3px] border-neo-ink flex items-center justify-center shadow-[4px_4px_0px_0px_#1D2B1F]">
                <span class="text-white font-black text-xl">3</span>
              </div>
              <p class="font-black text-neo-ink text-xl truncate uppercase" [title]="top3Peixes[2].pescador">{{ top3Peixes[2].pescador }}</p>
              <p class="text-xs text-neo-muted font-bold truncate mt-1">{{ top3Peixes[2].especie }}</p>
              <div class="mt-4 bg-neo-paper border-2 border-neo-ink py-2 px-3 inline-block shadow-[2px_2px_0px_0px_#1D2B1F]">
                <p class="text-xl font-black font-mono tracking-tighter">{{ top3Peixes[2].medida }} <span class="text-[10px] font-sans font-bold uppercase">{{ unidadeAtual }}</span></p>
              </div>
            </div>
          </div>

        </div>

        <div *ngIf="restoPeixes.length > 0" class="max-w-3xl mx-auto neo-table-container">
          <table class="w-full text-left border-collapse neo-table">
            <thead>
            <tr>
              <th class="text-center w-16">Pos</th>
              <th>Pescador</th>
              <th>Espécie</th>
              <th class="text-right">Troféu</th>
            </tr>
            </thead>
            <tbody>
            <tr *ngFor="let item of restoPeixes">
              <td class="text-center font-black font-mono text-lg text-neo-ink">#{{ item.posicao }}</td>
              <td class="font-bold text-neo-ink uppercase">{{ item.pescador }}</td>
              <td class="font-bold text-neo-muted">{{ item.especie }}</td>
              <td class="text-right font-black font-mono text-xl text-neo-ink">
                {{ item.medida }} <span class="text-xs font-sans text-neo-muted uppercase">{{ unidadeAtual }}</span>
              </td>
            </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div class="max-w-3xl mx-auto w-full animate-scale-up mt-8" *ngIf="!carregando && categoriaAtual === 'CAPTURAS' && rankPescadores.length > 0">
        <div class="neo-table-container">
          <table class="w-full text-left border-collapse neo-table">
            <thead>
            <tr>
              <th class="text-center w-16">Rank</th>
              <th>Pescador Experiente</th>
              <th class="text-center">Dias na Água</th>
              <th class="text-right">Total Capturado</th>
            </tr>
            </thead>
            <tbody>
            <tr *ngFor="let mestre of rankPescadores" [ngClass]="{'bg-neo-lime/20': mestre.posicao === 1}">
              <td class="text-center font-black font-mono text-xl text-neo-ink">
                <span *ngIf="mestre.posicao === 1">🥇</span>
                <span *ngIf="mestre.posicao === 2">🥈</span>
                <span *ngIf="mestre.posicao === 3">🥉</span>
                <span *ngIf="mestre.posicao > 3">#{{ mestre.posicao }}</span>
              </td>
              <td class="font-black text-neo-ink uppercase tracking-wide">{{ mestre.pescador }}</td>
              <td class="text-center font-bold text-neo-muted">{{ mestre.diasNaAgua }} exped.</td>
              <td class="text-right font-black font-mono text-2xl text-neo-ink">
                {{ mestre.capturas }} <span class="text-xs font-sans text-neo-muted uppercase">peixes</span>
              </td>
            </tr>
            </tbody>
          </table>
        </div>
      </div>

    </div>
  `,
  styles: [`
    @keyframes slideUp { 0% { opacity: 0; transform: translateY(20px); } 100% { opacity: 1; transform: translateY(0); } }
    @keyframes scaleUp { 0% { opacity: 0; transform: scale(0.98); } 100% { opacity: 1; transform: scale(1); } }
    .animate-slide-up { animation: slideUp 0.5s ease-out forwards; opacity: 0; }
    .animate-scale-up { animation: scaleUp 0.3s ease-out forwards; }
  `]
})
export class RankingComponent implements OnInit {
  categoriaAtual: CategoriaRanking = 'COMPRIMENTO';
  unidadeAtual: string = 'CM';
  carregando: boolean = true;

  top3Peixes: RankingPeixe[] = [];
  restoPeixes: RankingPeixe[] = [];
  rankPescadores: RankingPescador[] = [];

  constructor(
    private catchRecordService: CatchRecordService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.carregarDadosCategoria();
  }

  mudarCategoria(novaCategoria: CategoriaRanking): void {
    if (this.categoriaAtual === novaCategoria) return;
    this.categoriaAtual = novaCategoria;
    this.unidadeAtual = novaCategoria === 'COMPRIMENTO' ? 'CM' : 'KG';
    this.carregarDadosCategoria();
  }

  private carregarDadosCategoria(): void {
    this.carregando = true;
    this.top3Peixes = [];
    this.restoPeixes = [];
    this.rankPescadores = [];

    if (this.categoriaAtual === 'COMPRIMENTO') {
      this.catchRecordService.getRankingPorComprimento().subscribe({
        next: (dados) => {
          this.processarRankingPeixes(dados);
          this.finalizarCarregamento();
        },
        error: (err) => {
          console.error('Erro ao buscar ranking de comprimento', err);
          this.finalizarCarregamento();
        }
      });
    }
    else if (this.categoriaAtual === 'PESO') {
      this.catchRecordService.getRankingPorPeso().subscribe({
        next: (dados) => {
          this.processarRankingPeixes(dados);
          this.finalizarCarregamento();
        },
        error: (err) => {
          console.error('Erro ao buscar ranking de peso', err);
          this.finalizarCarregamento();
        }
      });
    }
    else if (this.categoriaAtual === 'CAPTURAS') {
      this.catchRecordService.getRankingDePescadores().subscribe({
        next: (dados) => {
          this.rankPescadores = dados;
          this.finalizarCarregamento();
        },
        error: (err) => {
          console.error('Erro ao buscar ranking de pescadores', err);
          this.finalizarCarregamento();
        }
      });
    }
  }

  private processarRankingPeixes(dados: RankingPeixe[]): void {
    if (dados && dados.length > 0) {
      this.top3Peixes = dados.slice(0, 3);
      this.restoPeixes = dados.slice(3);
    }
  }

  private finalizarCarregamento(): void {
    this.carregando = false;
    this.cdr.detectChanges();
  }
}
