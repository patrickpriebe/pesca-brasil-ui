import { Component, OnInit, ChangeDetectorRef, AfterViewInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import * as L from 'leaflet';
import { CatchRecordService } from '../core/services/catch-record.service';
import { FishService } from '../core/services/fish.service';
import { RiverService } from '../core/services/river.service';
import { BaitService } from '../core/services/bait.service';
import { EquipmentService } from '../core/services/equipment.service';
import { Fish, Bait, CatchRecordPayload, Equipment, River } from '../core/models/api-models';
import { ImageService } from '../core/services/image/image.service';

type ModalType = 'FISH' | 'RIVER' | 'BAIT' | 'EQUIPMENT' | '';

@Component({
  selector: 'app-catch-record-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  template: `
    <div class="h-full w-full max-w-4xl mx-auto p-4 md:p-8 animate-fade-in relative">
      <div class="mb-8 shrink-0">
        <h2 class="text-4xl md:text-5xl font-serif font-black text-neo-ink tracking-tighter uppercase">Registrar Captura</h2>
        <p class="text-neo-ink font-bold text-sm mt-2 uppercase tracking-widest">Eternize o seu troféu</p>
      </div>

      <div class="neo-card p-6 md:p-10 bg-white">
        <form [formGroup]="catchForm" (ngSubmit)="salvar()" class="flex flex-col gap-8">

          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label class="block text-sm font-black text-neo-ink uppercase tracking-wider mb-2">Espécie do Peixe *</label>
              <div class="flex gap-2">
                <select formControlName="fishId" class="neo-input cursor-pointer">
                  <option value="" disabled selected>Selecione a espécie...</option>
                  <option *ngFor="let f of peixes" [value]="f.id">{{ f.commonName }}</option>
                </select>
                <button type="button" (click)="abrirModal('FISH')" class="neo-btn !p-0 w-12 shrink-0 flex justify-center text-2xl">+</button>
              </div>
            </div>

            <div>
              <label class="block text-sm font-black text-neo-ink uppercase tracking-wider mb-2">Em qual Rio/Lago? *</label>
              <div class="flex gap-2">
                <select formControlName="riverId" class="neo-input cursor-pointer">
                  <option value="" disabled selected>Selecione o rio...</option>
                  <option *ngFor="let r of rios" [value]="r.id">{{ r.name }}</option>
                </select>
                <button type="button" (click)="abrirModal('RIVER')" class="neo-btn !p-0 w-12 shrink-0 flex justify-center text-2xl">+</button>
              </div>
            </div>
          </div>

          <div class="p-4 border-[4px] border-neo-ink bg-neo-paper shadow-[8px_8px_0px_0px_#1D2B1F] relative">
            <label class="block text-lg font-black text-neo-ink uppercase tracking-wider mb-1">Ponto Exato da Captura *</label>
            <p class="text-sm font-bold text-neo-muted mb-4 uppercase tracking-widest">Clique no mapa para marcar a isca</p>

            <div class="h-64 w-full border-[3px] border-neo-ink relative bg-white">
              <div id="formMap" class="h-full w-full z-0 cursor-crosshair"></div>
            </div>

            <div *ngIf="catchForm.get('latitude')?.value" class="flex gap-4 mt-4 text-xs font-black font-mono bg-white p-3 border-[3px] border-neo-ink shadow-[4px_4px_0px_0px_#1D2B1F] w-fit">
              <span>LAT: {{ catchForm.get('latitude')?.value | number:'1.6-6' }}</span>
              <span>LNG: {{ catchForm.get('longitude')?.value | number:'1.6-6' }}</span>
            </div>

            <div class="mt-6">
              <label class="block text-sm font-black text-neo-ink uppercase tracking-wider mb-2">Apelido do Local (Opcional)</label>
              <input type="text" formControlName="spotName" placeholder="Ex: Pesqueiro do João..." class="neo-input">
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label class="block text-sm font-black text-neo-ink uppercase tracking-wider mb-2">Isca</label>
              <div class="flex gap-2">
                <select formControlName="baitId" class="neo-input cursor-pointer">
                  <option value="">Sem isca</option>
                  <option *ngFor="let i of iscas" [value]="i.id">{{ i.name }}</option>
                </select>
                <button type="button" (click)="abrirModal('BAIT')" class="neo-btn !p-0 w-12 shrink-0 flex justify-center text-2xl">+</button>
              </div>
            </div>

            <div>
              <label class="block text-sm font-black text-neo-ink uppercase tracking-wider mb-2">Equipamento</label>
              <div class="flex gap-2">
                <select formControlName="equipmentId" class="neo-input cursor-pointer">
                  <option value="">Não informar</option>
                  <option *ngFor="let eq of equipamentos" [value]="eq.id">{{ eq.type }} - Ação {{ eq.action }}</option>
                </select>
                <button type="button" (click)="abrirModal('EQUIPMENT')" class="neo-btn !p-0 w-12 shrink-0 flex justify-center text-2xl">+</button>
              </div>
            </div>

            <div>
              <label class="block text-sm font-black text-neo-ink uppercase tracking-wider mb-2">Data e Hora *</label>
              <input type="datetime-local" formControlName="catchDate" class="neo-input uppercase text-xs tracking-wider">
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label class="block text-sm font-black text-neo-ink uppercase tracking-wider mb-2">Peso (kg)</label>
              <input type="number" step="0.01" formControlName="weightInKg" placeholder="Ex: 4.50" class="neo-input font-mono">
            </div>

            <div>
              <label class="block text-sm font-black text-neo-ink uppercase tracking-wider mb-2">Comprimento (cm)</label>
              <input type="number" step="0.1" formControlName="lengthInCm" placeholder="Ex: 65" class="neo-input font-mono">
            </div>

            <div>
              <label class="block text-sm font-black text-neo-ink uppercase tracking-wider mb-2">Destino do Peixe *</label>
              <select formControlName="outcome" class="neo-input cursor-pointer">
                <option value="RELEASED">Pesque & Solte</option>
                <option value="KEPT">Abatido</option>
              </select>
            </div>
          </div>

          <div>
            <label class="block text-sm font-black text-neo-ink uppercase tracking-wider mb-2">A História da Pescaria (Opcional)</label>
            <textarea formControlName="notes" rows="4" placeholder="Como foi a briga com o peixe? Algum perrengue ou detalhe engraçado?" class="neo-input resize-none"></textarea>
          </div>

          <div class="border-[4px] border-dashed border-neo-ink hover:bg-neo-lime/10 p-8 text-center relative cursor-pointer min-h-[200px] flex flex-col items-center justify-center transition-colors bg-neo-paper shadow-inner mt-2">
            <input type="file" accept="image/*" (change)="onFileSelected($event)" class="absolute inset-0 opacity-0 cursor-pointer z-50 w-full h-full">

            <div *ngIf="!imagemPreview" class="flex flex-col items-center gap-3 pointer-events-none">
              <svg class="w-12 h-12 text-neo-ink" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
              <p class="font-black text-lg text-neo-ink uppercase tracking-widest">Foto do Peixe</p>
              <p class="text-xs font-bold text-neo-muted uppercase">Clique ou arraste a imagem aqui</p>
            </div>

            <div *ngIf="imagemPreview" class="w-full relative pointer-events-none flex flex-col items-center">
              <img [src]="imagemPreview" class="max-h-64 object-cover border-[4px] border-neo-ink shadow-[6px_6px_0px_0px_#1D2B1F]">
              <p class="text-xs text-neo-ink font-black mt-4 uppercase bg-white border-[3px] border-neo-ink px-4 py-2 shadow-[2px_2px_0px_0px_#1D2B1F]">Trocar Foto</p>
            </div>
          </div>

          <div class="flex justify-end gap-4 mt-8 pt-8 border-t-[3px] border-neo-ink">
            <button type="button" (click)="cancelar()" class="neo-btn neo-btn-outline">
              Cancelar
            </button>
            <button type="submit" [disabled]="catchForm.invalid || salvando" class="neo-btn px-8">
              {{ salvando ? (fazendoUploadFoto ? 'Enviando Foto...' : 'Gravando...') : 'Salvar no Diário' }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <div *ngIf="modalAberto" class="fixed inset-0 z-[500] bg-neo-ink/80 flex items-center justify-center p-4">
      <div class="neo-card w-full max-w-sm p-8 bg-white text-center">
        <h3 class="text-2xl font-serif font-black text-neo-ink mb-6 uppercase tracking-tight">
          Adicionar
          {{ tipoModalCadastro === 'FISH' ? 'Espécie' : tipoModalCadastro === 'RIVER' ? 'Rio' : tipoModalCadastro === 'BAIT' ? 'Isca' : 'Equipamento' }}
        </h3>

        <input *ngIf="tipoModalCadastro !== 'EQUIPMENT'" type="text" [(ngModel)]="novoItemNome" placeholder="Nome..." class="neo-input mb-6 text-center">

        <div *ngIf="tipoModalCadastro === 'EQUIPMENT'" class="flex flex-col gap-4 mb-6">
          <select [(ngModel)]="novoEquipamentoTipo" class="neo-input text-center cursor-pointer">
            <option value="" disabled selected>Selecione o Tipo...</option>
            <option value="MOLINETE">Molinete</option>
            <option value="CARRETILHA">Carretilha</option>
          </select>
          <input type="text" [(ngModel)]="novoItemNome" placeholder="Ação / Marca..." class="neo-input text-center">
        </div>

        <div class="flex gap-4">
          <button type="button" (click)="fecharModal()" class="neo-btn neo-btn-outline flex-1">Voltar</button>
          <button type="button" (click)="salvarItemRapido()" class="neo-btn flex-1" [disabled]="!novoItemNome.trim() || (tipoModalCadastro === 'EQUIPMENT' && !novoEquipamentoTipo) || carregandoModal">
            {{ carregandoModal ? '...' : 'Salvar' }}
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    @keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
    @keyframes scaleUp { from { transform: scale(0.95); opacity: 0; } to { transform: scale(1); opacity: 1; } }
    .animate-fade-in { animation: fadeIn 0.3s ease-out forwards; }
    .animate-scale-up { animation: scaleUp 0.2s ease-out forwards; }
  `]
})
export class CatchRecordFormComponent implements OnInit, AfterViewInit, OnDestroy {
  catchForm: FormGroup;
  peixes: Fish[] = [];
  rios: River[] = [];
  iscas: Bait[] = [];
  equipamentos: Equipment[] = [];
  salvando = false;

  private formMap: L.Map | undefined;
  private currentMarker: L.Marker | undefined;

  arquivoSelecionado: File | null = null;
  imagemPreview: string | null = null;
  fazendoUploadFoto = false;
  modalAberto = false;
  tipoModalCadastro: ModalType = '';
  novoItemNome = '';
  novoEquipamentoTipo = '';
  carregandoModal = false;

  constructor(
    private fb: FormBuilder,
    private catchRecordService: CatchRecordService,
    private fishService: FishService,
    private riverService: RiverService,
    private baitService: BaitService,
    private equipmentService: EquipmentService,
    private router: Router,
    private cdr: ChangeDetectorRef,
    private imageService: ImageService
  ) {
    this.catchForm = this.fb.group({
      fishId: ['', Validators.required],
      riverId: ['', Validators.required],
      spotName: [''],
      latitude: ['', Validators.required],
      longitude: ['', Validators.required],
      baitId: [''],
      equipmentId: [''],
      catchDate: [this.dataAtualFormatada(), Validators.required],
      weightInKg: [''],
      lengthInCm: [''],
      outcome: ['RELEASED', Validators.required],
      notes: [''],
      photoUrl: ['']
    });
  }

  ngOnInit(): void {
    this.carregarDadosIniciais();
  }

  ngAfterViewInit(): void {
    this.initFormMap();
  }

  carregarDadosIniciais(): void {
    this.fishService.listarPeixes(0, 100).subscribe(p => { this.peixes = p.content; this.cdr.detectChanges(); });
    this.riverService.listarRios(0, 100).subscribe(r => { this.rios = r.content; this.cdr.detectChanges(); });
    this.baitService.listarIscas(0, 100).subscribe(i => { this.iscas = i.content; this.cdr.detectChanges(); });
    this.equipmentService.listarEquipamentos(0, 100).subscribe(e => { this.equipamentos = e.content; this.cdr.detectChanges(); });
  }

  private initFormMap(): void {
    this.formMap = L.map('formMap', {
      center: [-29.7171, -52.4253],
      zoom: 10,
      minZoom: 6
    });

    L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}', {
      maxZoom: 19,
      attribution: 'Tiles © Esri'
    }).addTo(this.formMap);

    this.formMap.on('click', (e: L.LeafletMouseEvent) => {
      const { lat, lng } = e.latlng;

      this.catchForm.patchValue({
        latitude: lat,
        longitude: lng
      });

      if (this.currentMarker) {
        this.formMap?.removeLayer(this.currentMarker);
      }

      const targetIcon = L.divIcon({
        className: 'bg-transparent',
        html: `<div class="w-5 h-5 bg-neo-rust border-[3px] border-neo-ink rounded-full shadow-[4px_4px_0px_0px_#1D2B1F] animate-pulse"></div>`,
        iconSize: [20, 20],
        iconAnchor: [10, 10]
      });

      this.currentMarker = L.marker([lat, lng], { icon: targetIcon }).addTo(this.formMap!);

      this.cdr.detectChanges();
    });
  }

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.arquivoSelecionado = file;
      const reader = new FileReader();
      reader.onload = () => {
        this.imagemPreview = reader.result as string;
        this.cdr.detectChanges();
      };
      reader.readAsDataURL(file);
    }
  }

  abrirModal(tipo: ModalType): void {
    this.tipoModalCadastro = tipo;
    this.novoItemNome = '';
    this.novoEquipamentoTipo = '';
    this.modalAberto = true;
    this.carregandoModal = false;
  }

  fecharModal(): void {
    this.modalAberto = false;
  }

  salvarItemRapido(): void {
    if (!this.novoItemNome.trim()) return;
    this.carregandoModal = true;

    if (this.tipoModalCadastro === 'FISH') {
      this.fishService.criar({ commonName: this.novoItemNome, scientificName: 'Não informado' }).subscribe({
        next: (novoPeixe) => {
          this.peixes.push(novoPeixe);
          this.catchForm.patchValue({ fishId: novoPeixe.id });
          this.finalizarModalSucesso();
        },
        error: () => this.erroModal()
      });
    } else if (this.tipoModalCadastro === 'RIVER') {
      this.riverService.criar({ name: this.novoItemNome, basin: 'Desconhecida' }).subscribe({
        next: (novoRio) => {
          this.rios.push(novoRio);
          this.catchForm.patchValue({ riverId: novoRio.id });
          this.finalizarModalSucesso();
        },
        error: () => this.erroModal()
      });
    } else if (this.tipoModalCadastro === 'BAIT') {
      this.baitService.criar({ name: this.novoItemNome }).subscribe({
        next: (novaIsca) => {
          this.iscas.push(novaIsca);
          this.catchForm.patchValue({ baitId: novaIsca.id });
          this.finalizarModalSucesso();
        },
        error: () => this.erroModal()
      });
    } else if (this.tipoModalCadastro === 'EQUIPMENT') {
      const payload = {
        type: this.novoEquipamentoTipo,
        action: this.novoItemNome,
        recommendedLineWeight: 'Não informado'
      };

      this.equipmentService.criar(payload).subscribe({
        next: (novoEq) => {
          this.equipamentos.push(novoEq);
          this.catchForm.patchValue({ equipmentId: novoEq.id });
          this.finalizarModalSucesso();
        },
        error: () => this.erroModal()
      });
    }
  }

  private finalizarModalSucesso(): void {
    this.carregandoModal = false;
    this.fecharModal();
    this.cdr.detectChanges();
  }

  private erroModal(): void {
    alert('Erro ao salvar item rápido no servidor.');
    this.carregandoModal = false;
    this.cdr.detectChanges();
  }

  salvar(): void {
    if (this.catchForm.invalid) return;
    this.salvando = true;

    if (this.arquivoSelecionado) {
      this.fazendoUploadFoto = true;
      this.imageService.uploadImage(this.arquivoSelecionado).subscribe({
        next: (resposta) => {
          this.fazendoUploadFoto = false;
          this.catchForm.patchValue({ photoUrl: resposta.url });
          this.enviarParaOBanco();
        },
        error: (err) => {
          console.error('Erro no upload da imagem', err);
          alert('Erro ao fazer upload da imagem para o Cloudinary.');
          this.fazendoUploadFoto = false;
          this.salvando = false;
          this.cdr.detectChanges();
        }
      });
    } else {
      this.enviarParaOBanco();
    }
  }

  private enviarParaOBanco(): void {
    const formValue = this.catchForm.value;

    const payload: CatchRecordPayload = {
      ...formValue,
      spotName: formValue.spotName,
      fishId: Number(formValue.fishId),
      riverId: Number(formValue.riverId),
      latitude: Number(formValue.latitude),
      longitude: Number(formValue.longitude),
      baitId: formValue.baitId ? Number(formValue.baitId) : undefined,
      equipmentId: formValue.equipmentId ? Number(formValue.equipmentId) : undefined,
      weightInKg: formValue.weightInKg ? Number(formValue.weightInKg) : undefined,
      lengthInCm: formValue.lengthInCm ? Number(formValue.lengthInCm) : undefined,
      notes: formValue.notes
    };

    this.catchRecordService.salvarCaptura(payload).subscribe({
      next: () => {
        this.salvando = false;
        this.router.navigate(['/diario']);
      },
      error: (err) => {
        console.error('Erro ao salvar captura:', err);
        alert('O Java recusou o salvamento:\n' + (err.error?.message || err.message || 'Erro desconhecido. Verifique o F12.'));
        this.salvando = false;
        this.cdr.detectChanges();
      }
    });
  }

  cancelar(): void {
    this.router.navigate(['/diario']);
  }

  private dataAtualFormatada(): string {
    const agora = new Date();
    agora.setMinutes(agora.getMinutes() - agora.getTimezoneOffset());
    return agora.toISOString().slice(0, 16);
  }

  ngOnDestroy(): void {
    if (this.formMap) {
      this.formMap.remove();
    }
  }
}
