import {
  Component,
  AfterViewInit,
  ElementRef,
  ViewChild,
  OnDestroy,
  ChangeDetectorRef,
  HostListener,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import * as L from 'leaflet';
import { FishingSpotService } from '../../core/services/fishing-spot.service';

@Component({
  selector: 'app-map',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="h-full w-full flex flex-col relative animate-fade-in">
      <div class="mb-6 shrink-0">
        <h2
          class="text-4xl md:text-5xl font-serif font-black text-neo-ink tracking-tighter uppercase"
        >
          Mapa da Pesca
        </h2>
        <p class="text-neo-ink font-bold text-sm mt-2 uppercase tracking-widest">
          Pontos estratégicos
        </p>
      </div>

      <div
        class="flex-1 w-full border-[4px] border-neo-ink bg-neo-paper shadow-[8px_8px_0px_0px_#1D2B1F] relative mb-3 mr-3 min-h-[400px] overflow-hidden"
      >
        <div #mapElement class="h-full w-full z-0 cursor-crosshair"></div>

        <div
          class="absolute top-4 right-4 z-[400] bg-neo-lime border-[3px] border-neo-ink px-4 py-2 text-neo-ink text-xs font-black uppercase tracking-widest shadow-[4px_4px_0px_0px_#1D2B1F] flex items-center gap-2"
        >
          <span class="w-3 h-3 rounded-full bg-neo-ink animate-pulse"></span>
          Conectado
        </div>

        <button
          *ngIf="!widgetAberto"
          (click)="abrirWidget()"
          class="absolute top-16 right-4 z-[1000] bg-white border-[3px] border-neo-ink px-3 py-2 shadow-[4px_4px_0px_0px_#1D2B1F] flex items-center gap-2 hover:bg-neo-paper transition-colors hover:-translate-y-1 hover:-translate-x-1 cursor-pointer animate-fade-in"
          title="Abrir Clima"
        >
          <span class="text-xl">{{
            climaAtual ? obterIconeClima(climaAtual.weathercode) : '⛅'
          }}</span>
          <span class="text-neo-ink font-black text-xs uppercase tracking-widest">Clima</span>
        </button>

        <div
          #climaWidget
          class="absolute z-[1000] bg-white border-[4px] border-neo-ink pb-6 px-4 md:px-6 shadow-[6px_6px_0px_0px_#1D2B1F] w-72 max-w-[calc(100vw-2rem)] text-neo-ink font-sans"
          [style.left.px]="posX"
          [style.top.px]="posY"
          [class.hidden]="!widgetAberto"
          [class.transition-all]="!arrastando"
          [class.duration-300]="!arrastando"
          [ngClass]="carregandoClima ? 'opacity-90 scale-95' : 'opacity-100 scale-100'"
        >
          <button
            (click)="fecharWidget()"
            class="absolute top-3 right-3 text-neo-ink hover:text-neo-rust transition-colors"
            title="Minimizar Clima"
          >
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="3"
                d="M19 9l-7 7-7-7"
              ></path>
            </svg>
          </button>

          <div
            class="w-full pt-4 pb-3 cursor-grab active:cursor-grabbing flex justify-center items-center hover:bg-neo-paper transition-colors group"
            (mousedown)="iniciarArrasto($event)"
            (touchstart)="iniciarArrasto($event)"
            title="Arraste para mover"
          >
            <div
              class="w-16 h-2 bg-neo-ink/20 group-hover:bg-neo-ink transition-colors rounded-full pointer-events-none"
            ></div>
          </div>

          <div class="flex justify-between items-start mb-4 border-b-[3px] border-neo-ink pb-4">
            <div class="w-[80%] mt-1">
              <p class="text-[10px] text-neo-muted uppercase tracking-widest font-black mb-1">
                Coordenada Atual
              </p>
              <h3
                class="text-sm font-black text-neo-ink truncate pr-2 uppercase"
                [title]="localAtualNome"
              >
                {{ localAtualNome }}
              </h3>
            </div>

            <button
              (click)="obterLocalizacaoNavegador()"
              class="p-2 border-[2px] border-neo-ink bg-neo-paper hover:bg-neo-lime transition-colors shrink-0 shadow-[2px_2px_0px_0px_#1D2B1F] hover:-translate-y-[1px] hover:-translate-x-[1px]"
              title="Minha localização"
            >
              <svg
                class="w-4 h-4 text-neo-ink"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="3"
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                ></path>
              </svg>
            </button>
          </div>

          <div *ngIf="carregandoClima" class="flex justify-center py-6">
            <div
              class="w-8 h-8 border-[4px] border-neo-paper border-t-neo-ink rounded-full animate-spin"
            ></div>
          </div>

          <div *ngIf="!carregandoClima && climaAtual">
            <div class="flex justify-between items-center w-full">
              <div class="flex items-center gap-2 flex-1 min-w-0 pr-2">
                <span class="text-4xl drop-shadow-[2px_2px_0px_#1D2B1F] shrink-0">
                  {{ obterIconeClima(climaAtual.weathercode) }}
                </span>
                <div class="min-w-0">
                  <p class="text-2xl font-black font-mono tracking-tighter truncate">
                    {{ climaAtual.temperature
                    }}<span class="text-base text-neo-muted font-bold font-sans">°C</span>
                  </p>
                  <p
                    class="text-[9px] text-neo-ink font-bold uppercase tracking-widest mt-1 truncate"
                    title="Vento: {{ climaAtual.windspeed }} KM/H"
                  >
                    Vento: {{ climaAtual.windspeed }} KM/H
                  </p>
                </div>
              </div>

              <div class="text-center border-l-[3px] border-neo-ink pl-3 shrink-0">
                <span class="text-3xl drop-shadow-[2px_2px_0px_#1D2B1F]">
                  {{ faseLuaAtual.icone }}
                </span>
                <p class="text-[8px] font-black uppercase tracking-widest text-neo-ink mt-2">
                  {{ faseLuaAtual.nome }}
                </p>
              </div>
            </div>

            <div
              *ngIf="expandido && previsaoFutura.length > 0"
              class="mt-5 pt-5 border-t-[3px] border-neo-ink flex flex-col gap-3 animate-fade-in"
            >
              <p class="text-[10px] text-neo-muted uppercase tracking-widest font-black mb-1">
                Visão Meteorológica
              </p>

              <div
                *ngFor="let prev of previsaoFutura"
                class="flex justify-between items-center font-bold bg-neo-paper border-2 border-neo-ink px-3 py-2"
              >
                <span class="w-10 uppercase text-xs">{{ prev.diaSemana }}</span>
                <span class="text-xl drop-shadow-[1px_1px_0px_#1D2B1F]">{{ prev.icone }}</span>
                <div class="flex gap-2 text-xs font-mono">
                  <span class="text-neo-muted" title="Mínima">{{ prev.min }}°</span>
                  <span class="text-neo-ink font-black" title="Máxima">{{ prev.max }}°</span>
                </div>
              </div>
            </div>

            <button
              (click)="toggleExpandir()"
              class="w-full mt-5 neo-btn neo-btn-outline !py-2 text-[10px]"
            >
              {{ expandido ? 'Ver Menos' : 'Ver Previsão' }}
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
          transform: translateY(-5px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }
      .animate-fade-in {
        animation: fadeIn 0.2s ease-out forwards;
      }
    `,
  ],
})
export class MapComponent implements AfterViewInit, OnDestroy {
  @ViewChild('mapElement') mapElement!: ElementRef;
  @ViewChild('climaWidget') climaWidget!: ElementRef;

  private map: L.Map | undefined;
  private pinoSelecionado: L.Marker | undefined;
  private peixesLocais: string[] = ['dourado.png', 'jundia.png', 'traira.png'];

  climaAtual: any = null;
  previsaoFutura: any[] = [];
  carregandoClima: boolean = true;
  localAtualNome: string = 'Detectando localização...';
  faseLuaAtual: { icone: string; nome: string } = { icone: '🌑', nome: 'Nova' };

  expandido: boolean = false;
  widgetAberto: boolean = true;

  posX: number = 5000;
  posY: number = 24;
  arrastando: boolean = false;
  offsetX: number = 0;
  offsetY: number = 0;
  limiteMaxX: number = 0;
  limiteMaxY: number = 0;

  constructor(
    private fishingSpotService: FishingSpotService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngAfterViewInit(): void {
    this.initMap();
    this.calcularFaseLua();

    this.applyStateMask().then(() => {
      this.carregarPontosReaisDoBanco();
    });

    this.obterLocalizacaoNavegador();

    setTimeout(() => this.ajustarLimites(), 100);
  }

  abrirWidget(): void {
    this.widgetAberto = true;
    setTimeout(() => this.ajustarLimites(), 50);
  }

  fecharWidget(): void {
    this.widgetAberto = false;
  }

  iniciarArrasto(e: MouseEvent | TouchEvent): void {
    this.arrastando = true;
    const evt = e instanceof MouseEvent ? e : e.touches[0];
    this.offsetX = evt.clientX - this.posX;
    this.offsetY = evt.clientY - this.posY;

    if (this.mapElement && this.climaWidget) {
      const container = this.mapElement.nativeElement.parentElement;
      const widget = this.climaWidget.nativeElement;
      this.limiteMaxX = container.clientWidth - widget.offsetWidth - 16;
      this.limiteMaxY = container.clientHeight - widget.offsetHeight - 16;
    }

    e.preventDefault();
  }

  @HostListener('document:mousemove', ['$event'])
  @HostListener('document:touchmove', ['$event'])
  aoArrastar(e: MouseEvent | TouchEvent): void {
    if (!this.arrastando) return;

    const evt = e instanceof MouseEvent ? e : e.touches[0];
    const newX = evt.clientX - this.offsetX;
    const newY = evt.clientY - this.offsetY;

    this.posX = Math.max(16, Math.min(newX, this.limiteMaxX));
    this.posY = Math.max(16, Math.min(newY, this.limiteMaxY));
  }

  @HostListener('window:resize', ['$event'])
  onWindowResize(event?: Event): void {
    if (this.map) {
      this.map.invalidateSize();
    }

    requestAnimationFrame(() => {
      if (this.widgetAberto) {
        this.ajustarLimites();
      }
      this.cdr.detectChanges();
    });
  }

  @HostListener('document:mouseup')
  @HostListener('document:touchend')
  pararArrasto(): void {
    this.arrastando = false;
  }

  ajustarLimites(): void {
    if (!this.mapElement || !this.climaWidget || !this.widgetAberto) return;

    const container = this.mapElement.nativeElement.parentElement;
    const widget = this.climaWidget.nativeElement;

    this.limiteMaxX = container.clientWidth - widget.offsetWidth - 16;
    this.limiteMaxY = container.clientHeight - widget.offsetHeight - 16;

    if (this.posX > this.limiteMaxX) {
      this.posX = Math.max(16, this.limiteMaxX);
    }
    if (this.posY > this.limiteMaxY) {
      this.posY = Math.max(16, this.limiteMaxY);
    }

    if (this.posX < 16) this.posX = 16;
    if (this.posY < 16) this.posY = 16;
  }

  toggleExpandir(): void {
    const alturaAntiga = this.climaWidget.nativeElement.offsetHeight;

    this.expandido = !this.expandido;
    this.cdr.detectChanges();

    const alturaNova = this.climaWidget.nativeElement.offsetHeight;
    const diferenca = alturaAntiga - alturaNova;

    this.posY += diferenca;
    this.ajustarLimites();
  }

  private initMap(): void {
    const rsBounds = L.latLngBounds([
      [-34.0, -58.0],
      [-27.0, -49.0],
    ]);

    this.map = L.map(this.mapElement.nativeElement, {
      center: [-29.7171, -52.4253],
      zoom: 7,
      minZoom: 6,
      maxBounds: rsBounds,
      maxBoundsViscosity: 1.0,
    });

    L.tileLayer(
      'https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}',
      {
        maxZoom: 19,
        attribution: 'Tiles © Esri',
      },
    ).addTo(this.map);

    this.map.on('click', (e: L.LeafletMouseEvent) => {
      this.atualizarClimaPorCoordenada(e.latlng.lat, e.latlng.lng, 'Ponto Selecionado Manualmente');
      this.marcarPinoTemporario(e.latlng.lat, e.latlng.lng);
    });
  }

  private marcarPinoTemporario(lat: number, lng: number): void {
    if (this.pinoSelecionado) this.map?.removeLayer(this.pinoSelecionado);

    const targetIcon = L.divIcon({
      className: 'bg-transparent',
      html: `<div class="w-5 h-5 bg-neo-rust border-[3px] border-neo-ink rounded-full shadow-[4px_4px_0px_0px_#1D2B1F] animate-pulse"></div>`,
      iconSize: [20, 20],
      iconAnchor: [10, 10],
    });

    this.pinoSelecionado = L.marker([lat, lng], { icon: targetIcon }).addTo(this.map!);
  }

  obterLocalizacaoNavegador(): void {
    this.carregandoClima = true;
    this.localAtualNome = 'Buscando GPS...';

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          this.map?.flyTo([lat, lng], 10, { animate: true, duration: 1.5 });
          this.atualizarClimaPorCoordenada(lat, lng, 'Sua Localização');
          this.marcarPinoTemporario(lat, lng);
        },
        (error) => {
          this.atualizarClimaPorCoordenada(-29.7171, -52.4253, 'Região Central - RS (Padrão)');
        },
      );
    } else {
      this.atualizarClimaPorCoordenada(-29.7171, -52.4253, 'Região Central - RS (Padrão)');
    }
  }

  private async atualizarClimaPorCoordenada(
    lat: number,
    lng: number,
    nomeLocal: string,
  ): Promise<void> {
    this.carregandoClima = true;
    this.localAtualNome = nomeLocal;
    this.cdr.detectChanges();

    try {
      const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current_weather=true&daily=weathercode,temperature_2m_max,temperature_2m_min&timezone=America%2FSao_Paulo`;
      const response = await fetch(url);
      const data = await response.json();

      if (data && data.current_weather) {
        this.climaAtual = data.current_weather;

        if (data.daily) {
          this.previsaoFutura = [];
          for (let i = 1; i <= 3; i++) {
            const dataPrev = new Date(data.daily.time[i] + 'T12:00:00');
            this.previsaoFutura.push({
              diaSemana: dataPrev
                .toLocaleDateString('pt-BR', { weekday: 'short' })
                .replace('.', ''),
              max: Math.round(data.daily.temperature_2m_max[i]),
              min: Math.round(data.daily.temperature_2m_min[i]),
              icone: this.obterIconeClima(data.daily.weathercode[i]),
            });
          }
        }

        if (nomeLocal === 'Ponto Selecionado Manualmente') {
          this.buscarNomeDaCidade(lat, lng);
        }
      }
    } catch (error) {
      console.error('Erro ao buscar o clima:', error);
      this.localAtualNome = 'Falha no satélite';
    } finally {
      this.carregandoClima = false;
      this.cdr.detectChanges();
      if (this.widgetAberto) {
        setTimeout(() => this.ajustarLimites(), 50);
      }
    }
  }

  private async buscarNomeDaCidade(lat: number, lng: number): Promise<void> {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=10`,
      );
      const data = await response.json();
      if (data && data.address) {
        this.localAtualNome =
          data.address.city || data.address.town || data.address.municipality || 'Região Remota';
        this.cdr.detectChanges();
      }
    } catch (e) {}
  }

  obterIconeClima(codigoMeteo: number): string {
    if (codigoMeteo === 0) return '☀️';
    if (codigoMeteo >= 1 && codigoMeteo <= 3) return '⛅';
    if (codigoMeteo >= 45 && codigoMeteo <= 48) return '🌫️';
    if (codigoMeteo >= 51 && codigoMeteo <= 67) return '🌧️';
    if (codigoMeteo >= 71 && codigoMeteo <= 77) return '❄️';
    if (codigoMeteo >= 80 && codigoMeteo <= 82) return '🌦️';
    if (codigoMeteo >= 95) return '⛈️';
    return '☁️';
  }

  private calcularFaseLua(): void {
    const data = new Date();
    const ano = data.getFullYear();
    let mes = data.getMonth() + 1;
    let dia = data.getDate();

    if (mes < 3) {
      ano - 1;
      mes += 12;
    }
    ++mes;
    let c = 365.25 * ano;
    let e = 30.6 * mes;
    let jd = c + e + dia - 694039.09;
    jd /= 29.5305882;
    const b = parseInt(jd.toString());
    jd -= b;
    const fase = Math.round(jd * 8);

    const fases = [
      { icone: '🌑', nome: 'Nova' },
      { icone: '🌒', nome: 'Crescente' },
      { icone: '🌓', nome: 'Quarto Crescente' },
      { icone: '🌔', nome: 'Gibosa' },
      { icone: '🌕', nome: 'Cheia' },
      { icone: '🌖', nome: 'Minguante Gibosa' },
      { icone: '🌗', nome: 'Quarto Minguante' },
      { icone: '🌘', nome: 'Minguante' },
      { icone: '🌑', nome: 'Nova' },
    ];

    this.faseLuaAtual = fases[fase];
  }

  private async applyStateMask(): Promise<void> {
    try {
      const response = await fetch(
        'https://servicodados.ibge.gov.br/api/v3/malhas/estados/RS?formato=application/vnd.geo+json',
      );
      const geoJson = await response.json();

      const worldCoords = [
        [90, -180],
        [90, 180],
        [-90, 180],
        [-90, -180],
      ];
      const rsGeometry = geoJson.features[0].geometry;
      let rsHoles: any[] = [];

      if (rsGeometry.type === 'Polygon') {
        rsHoles = rsGeometry.coordinates.map((ring: any[]) =>
          ring.map((coord) => [coord[1], coord[0]]),
        );
      } else if (rsGeometry.type === 'MultiPolygon') {
        rsHoles = rsGeometry.coordinates
          .flat(1)
          .map((ring: any[]) => ring.map((coord) => [coord[1], coord[0]]));
      }

      L.polygon([worldCoords, ...rsHoles] as any, {
        color: 'transparent',
        fillColor: '#1e293b',
        fillOpacity: 0.8,
        interactive: false,
      }).addTo(this.map!);
    } catch (error) {}
  }

  private sortearPeixe(): string {
    return this.peixesLocais[Math.floor(Math.random() * this.peixesLocais.length)];
  }

  private carregarPontosReaisDoBanco(): void {
    this.fishingSpotService.listarLocais(0, 500).subscribe({
      next: (pagina) => {
        pagina.content.forEach((local) => {
          if (local.latitude && local.longitude) {
            this.createCustomMarker(
              local.latitude,
              local.longitude,
              local.name,
              local.riverName || 'Água Desconhecida',
              this.sortearPeixe(),
              local.id,
            );
          }
        });
      },
    });
  }

  private createCustomMarker(
    lat: number,
    lng: number,
    title: string,
    riverName: string,
    pngName: string,
    id: number,
  ): void {
    if (!this.map) return;

    const customIcon = L.divIcon({
      className: 'bg-transparent',
      html: `
        <div class="group relative cursor-pointer" style="width: 40px; height: 40px;"
             onmouseenter="this.classList.add('fish-escaped')">

          <div class="absolute inset-0 m-auto w-3 h-3 bg-neo-rust border-[2px] border-neo-ink rounded-full shadow-[1.5px_1.5px_0px_0px_#1D2B1F] z-10 transition-transform group-hover:scale-125"></div>

          <div class="water-ripple absolute inset-0 m-auto w-8 h-8 rounded-full opacity-0 pointer-events-none z-10"></div>

          <div class="fish-body absolute inset-0 m-auto w-[32px] h-[32px] z-20 origin-center flex items-center justify-center text-2xl select-none"
               style="filter: drop-shadow(2px 2px 0px #1D2B1F);">
             <span style="display: inline-block; transform: scaleX(-1);">🐟</span>
          </div>

          <div class="absolute bottom-[100%] left-1/2 -translate-x-1/2 mb-2 bg-white text-neo-ink text-[10px] font-black uppercase tracking-widest px-2 py-1.5 border-[2px] border-neo-ink shadow-[3px_3px_0px_0px_#1D2B1F] opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap pointer-events-none z-50">
            ${title}
          </div>
        </div>
      `,
      iconSize: [40, 40],
      iconAnchor: [20, 20],
    });

    const marker = L.marker([lat, lng], { icon: customIcon }).addTo(this.map);

    marker.on('click', () => {
      this.atualizarClimaPorCoordenada(lat, lng, title);
    });

    const popupContent = `
      <div style="font-family: 'Inter', sans-serif; padding: 4px; width: 190px;">
        <div style="font-weight: 900; color: #1D2B1F; font-size: 16px; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 4px; line-height: 1.1;">${title}</div>
        <div style="color: #6B7A6D; font-size: 11px; margin-bottom: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px;">⚓ ${riverName}</div>

        <a href="/diario" style="
           display: block;
           text-align: center;
           background-color: #BFEA4B;
           color: #1D2B1F;
           padding: 10px;
           border: 3px solid #1D2B1F;
           text-decoration: none;
           font-weight: 900;
           font-size: 11px;
           text-transform: uppercase;
           letter-spacing: 1px;
           box-shadow: 2px 2px 0px 0px #1D2B1F;
           transition: all 0.1s;
           "
           onmouseover="this.style.transform='translate(2px, 2px)'; this.style.boxShadow='0px 0px 0px 0px #1D2B1F';"
           onmouseout="this.style.transform='translate(0px, 0px)'; this.style.boxShadow='2px 2px 0px 0px #1D2B1F';">
           Ver no Diário
        </a>
      </div>
    `;

    marker.bindPopup(popupContent);
  }

  ngOnDestroy(): void {
    if (this.map) this.map.remove();
  }
}
