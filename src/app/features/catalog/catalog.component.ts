import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FishService } from '../../core/services/fish.service';
import { Fish } from '../../core/models/api-models';

@Component({
  selector: 'app-catalog',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="h-full w-full flex flex-col gap-8 animate-fade-in p-4 md:p-8 relative">

      <div class="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 shrink-0">
        <div>
          <h2 class="text-4xl font-serif font-black text-neo-ink tracking-tight uppercase">Fisgadas</h2>
          <p class="text-neo-ink font-bold text-sm mt-2 uppercase tracking-widest">Catálogo Oficial de Espécies</p>
        </div>

        <div class="w-full md:w-80">
          <input type="text" (keyup)="filtrarLista($event)" placeholder="Buscar peixe..." class="neo-input">
        </div>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 pb-8">

        <div *ngFor="let fish of peixesFiltrados" class="neo-card bg-white flex flex-col overflow-hidden transition-transform duration-200 hover:-translate-y-2">

          <div class="w-full aspect-[4/3] relative bg-neo-paper border-b-[3px] border-neo-ink">
            <img [src]="fish.imageUrl || 'assets/default-fish.png'"
                 [alt]="fish.commonName"
                 class="absolute inset-0 w-full h-full p-6 object-contain filter drop-shadow-[4px_4px_0px_rgba(29,43,31,0.5)]">

            <span *ngIf="fish.conservationStatus" class="absolute top-4 right-4 px-2 py-1 bg-white border-[3px] border-neo-ink text-[10px] font-black uppercase tracking-widest shadow-[2px_2px_0px_0px_#1D2B1F] z-10">
              {{ fish.conservationStatus }}
            </span>
          </div>

          <div class="p-6 flex flex-col flex-1">
            <h3 class="text-2xl font-black text-neo-ink uppercase truncate" [title]="fish.commonName">{{ fish.commonName }}</h3>

            <p class="text-xs font-bold text-neo-muted italic mb-4 mt-1 border-b-[3px] border-neo-ink pb-3 truncate" [title]="fish.scientificName">{{ fish.scientificName || 'Não registrado' }}</p>

            <p class="text-sm font-medium text-neo-ink mb-6 line-clamp-3" [title]="fish.description">
              {{ fish.description || 'Descrição técnica indisponível.' }}
            </p>

            <button (click)="abrirDetalhes(fish.id)" class="neo-btn w-full mt-auto text-xs !py-3">
              {{ carregandoDetalhesId === fish.id ? 'Buscando...' : 'Ver Detalhes' }}
            </button>
          </div>
        </div>

      </div>

      <div *ngIf="carregando" class="text-center py-12 font-black text-neo-ink uppercase tracking-widest">
        Carregando catálogo de espécies...
      </div>
      <div *ngIf="!carregando && peixesFiltrados.length === 0" class="neo-card bg-white text-center p-12 my-8 font-black text-neo-ink uppercase tracking-widest">
        Nenhuma espécie encontrada.
      </div>

    </div>

    <div *ngIf="peixeSelecionado" class="fixed inset-0 z-[999] flex items-center justify-center p-4 md:p-8 bg-neo-ink/90 backdrop-blur-sm animate-fade-in">

      <div class="neo-card bg-white w-full max-w-5xl max-h-[95vh] overflow-hidden flex flex-col md:flex-row relative animate-scale-up">

        <button (click)="fecharDetalhes()" class="absolute top-4 right-4 z-50 bg-neo-rust text-white border-[3px] border-neo-ink rounded-full w-10 h-10 flex items-center justify-center font-black text-xl hover:scale-110 transition-transform shadow-[2px_2px_0px_0px_#1D2B1F]">
          X
        </button>

        <div class="w-full md:w-5/12 min-h-[250px] bg-neo-paper border-b-[3px] md:border-b-0 md:border-r-[3px] border-neo-ink relative flex items-center justify-center p-8 shrink-0">
          <img [src]="peixeSelecionado.imageUrl || 'assets/default-fish.png'"
               [alt]="peixeSelecionado.commonName"
               class="max-w-full max-h-full object-contain filter drop-shadow-[6px_6px_0px_rgba(29,43,31,0.6)]">
        </div>

        <div class="w-full md:w-7/12 p-6 md:p-10 flex flex-col overflow-y-auto">

          <div class="mb-6">
            <span *ngIf="peixeSelecionado.conservationStatus" class="inline-block px-2 py-1 mb-3 bg-neo-lime border-[2px] border-neo-ink text-[10px] font-black uppercase tracking-widest shadow-[2px_2px_0px_0px_#1D2B1F]">
              {{ peixeSelecionado.conservationStatus }}
            </span>
            <h2 class="text-4xl md:text-5xl font-serif font-black text-neo-ink uppercase tracking-tight leading-none mb-1">
              {{ peixeSelecionado.commonName }}
            </h2>
            <p class="text-sm font-bold text-neo-muted italic inline-block border-b-[3px] border-neo-ink pb-1">
              {{ peixeSelecionado.scientificName || 'Não registrado' }}
            </p>
          </div>

          <div class="mb-8">
            <h4 class="text-xs font-black text-neo-ink uppercase tracking-widest mb-3 flex items-center gap-2">
              <span class="w-2 h-2 bg-neo-rust rounded-full"></span>
              Comportamento e Biologia
            </h4>
            <p class="text-sm text-neo-ink font-medium leading-relaxed whitespace-pre-wrap">
              {{ peixeSelecionado.description || 'Descrição não informada.' }}
            </p>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-auto pt-6 border-t-[3px] border-neo-ink">

            <div>
              <h4 class="text-[10px] font-black text-neo-muted uppercase tracking-widest mb-3">Iscas Recomendadas</h4>
              <ul class="flex flex-col gap-2">
                <li *ngFor="let isca of peixeSelecionado.recommendedBaits" class="text-xs font-bold text-neo-ink bg-neo-paper border-[2px] border-neo-ink p-2 shadow-[2px_2px_0px_0px_#1D2B1F]">
                  🎣 {{ isca.name }}
                </li>
                <li *ngIf="!peixeSelecionado.recommendedBaits?.length" class="text-xs font-medium text-neo-muted italic">Nenhuma isca cadastrada.</li>
              </ul>
            </div>

            <div>
              <h4 class="text-[10px] font-black text-neo-muted uppercase tracking-widest mb-3">Equipamentos</h4>
              <ul class="flex flex-col gap-2">
                <li *ngFor="let eq of peixeSelecionado.recommendedEquipments" class="text-xs font-bold text-neo-ink bg-neo-paper border-[2px] border-neo-ink p-2 shadow-[2px_2px_0px_0px_#1D2B1F]">
                  ⚙️ {{ eq.type }} ({{ eq.action }})
                </li>
                <li *ngIf="!peixeSelecionado.recommendedEquipments?.length" class="text-xs font-medium text-neo-muted italic">Nenhum equipamento cadastrado.</li>
              </ul>
            </div>

          </div>

        </div>
      </div>
    </div>
  `,
  styles: [`
    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
    @keyframes scaleUp { from { transform: scale(0.95); opacity: 0; } to { transform: scale(1); opacity: 1; } }
    .animate-fade-in { animation: fadeIn 0.2s ease-out forwards; }
    .animate-scale-up { animation: scaleUp 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards; }

    .line-clamp-1 { display: -webkit-box; -webkit-line-clamp: 1; -webkit-box-orient: vertical; overflow: hidden; }
    .line-clamp-3 { display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden; }
  `]
})
export class CatalogComponent implements OnInit {
  peixesOriginais: Fish[] = [];
  peixesFiltrados: Fish[] = [];
  carregando = true;
  peixeSelecionado: Fish | null = null;
  carregandoDetalhesId: number | null = null;

  constructor(
    private fishService: FishService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.carregarEspecies();
  }

  carregarEspecies(): void {
    this.fishService.listarPeixes(0, 100).subscribe({
      next: (pagina) => {
        this.peixesOriginais = pagina.content;
        this.peixesFiltrados = pagina.content;
        this.carregando = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Erro ao buscar peixes:', err);
        this.carregando = false;
        this.cdr.detectChanges();
      }
    });
  }

  filtrarLista(event: any): void {
    const textoDigitado = event.target.value.toLowerCase();

    if (!textoDigitado) {
      this.peixesFiltrados = this.peixesOriginais;
    } else {
      this.peixesFiltrados = this.peixesOriginais.filter(fish =>
        fish.commonName.toLowerCase().includes(textoDigitado) ||
        (fish.scientificName && fish.scientificName.toLowerCase().includes(textoDigitado))
      );
    }
    this.cdr.detectChanges();
  }

  abrirDetalhes(id: number): void {
    this.carregandoDetalhesId = id;

    this.fishService.buscarPorId(id).subscribe({
      next: (dadosCompletos) => {
        this.peixeSelecionado = dadosCompletos;
        this.carregandoDetalhesId = null;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Erro ao buscar detalhes do peixe:', err);
        this.carregandoDetalhesId = null;
        this.cdr.detectChanges();
      }
    });
  }

  fecharDetalhes(): void {
    this.peixeSelecionado = null;
    this.cdr.detectChanges();
  }
}
