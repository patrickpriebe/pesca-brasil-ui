export interface SpringPage<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}

export interface CatchRecord {
  id: number;
  fishId: number;
  fishName: string;
  fishingSpotId: number;
  fishingSpotName: string;
  baitId: number;
  baitName: string;
  weightInKg: number;
  lengthInCm: number;
  catchDate: string;
  outcome: 'RELEASED' | 'KEPT';
  photoUrl: string;
  userName?: string;
}

export interface CatchRecordPayload {
  fishId: number;
  fishingSpotId: number;
  baitId?: number;
  equipmentId?: number;
  weightInKg?: number;
  lengthInCm?: number;
  catchDate: string;
  weatherCondition?: string;
  moonPhase?: string;
  outcome: 'RELEASED' | 'KEPT';
  photoUrl?: string;
  notes?: string;
  spotName?: string;
}

export interface River {
  id: number;
  name: string;
  hydrographicBasin: string;
  description: string;
}

export interface RiverPayload {
  name: string;
  hydrographicBasin: string;
  description?: string;
}

export interface FishingSpotPayload {
  riverId: number;
  name: string;
  latitude: number;
  longitude: number;
  accessType?: string;
  description?: string;
}

export interface FishingSpot {
  id: number;
  riverId: number;
  riverName: string;
  name: string;
  latitude: number;
  longitude: number;
  accessType?: string;
}

export interface Bait {
  id: number;
  name: string;
  type: 'ARTIFICIAL' | 'NATURAL';
  description?: string;
}

export interface BaitPayload {
  name: string;
  type: 'ARTIFICIAL' | 'NATURAL';
  description?: string;
}

export interface Fish {
  id: number;
  commonName: string;
  scientificName?: string;
  conservationStatus?: string;
  description?: string;
  imageUrl?: string;
  recommendedBaits?: Bait[];
  recommendedEquipments?: Equipment[];
}

export interface FishPayload {
  commonName: string;
  scientificName?: string;
  conservationStatus?: string;
  description?: string;
  imageUrl?: string;
  recommendedBaitIds?: number[];
  recommendedEquipmentIds?: number[];
}

export interface Equipment {
  id: number;
  type: 'MOLINETE' | 'CARRETILHA';
  recommendedLineWeight: string;
  action: string;
}

export interface EquipmentPayload {
  type: 'MOLINETE' | 'CARRETILHA';
  recommendedLineWeight: string;
  action: string;
}

export interface FishingRegulation {
  id: number;
  hydrographicBasin: string;
  startDate: string;
  endDate: string;
  notes?: string;
}

export interface FishingRegulationPayload {
  hydrographicBasin: string;
  startDate: string;
  endDate: string;
  notes?: string;
}

export interface RiverSpecies {
  id: number;
  riverId: number;
  riverName?: string;
  fishId: number;
  fishName?: string;
  abundance: 'ALTA' | 'MEDIA' | 'BAIXA' | 'RARA' | string;
  bestSeason: string;
}

export interface RiverSpeciesPayload {
  riverId: number;
  fishId: number;
  abundance: string;
  bestSeason: string;
}

export interface LoginRequest {
  email: string;
  password?: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password?: string;
}

export interface AuthResponse {
  token: string;
  name: string;
  email: string;
  role: string;
}

export interface VerifyRequest {
  email: string;
  code: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  email: string;
  code: string;
  newPassword: string;
}

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
