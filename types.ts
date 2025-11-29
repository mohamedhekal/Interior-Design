export interface RoomSpecs {
  totalArea: number;
  features: string[];
  style: string;
  constraints: string;
}

export interface AreaBreakdown {
  zone: string;
  area: string;
  description: string;
}

export interface DesignResponse {
  conceptName: string;
  designPhilosophy: string;
  spatialArrangement: string;
  areaBreakdown: AreaBreakdown[];
  materials: string[];
  lighting: string;
  furnitureRecommendations: string[];
}

export interface FloorItem {
  id: string;
  type: 'stairs' | 'kitchen' | 'sofa' | 'desk' | 'bath' | 'door' | 'outdoor_seating' | 'bed' | 'plant';
  label: string;
  x: number; // Percentage 0-100
  y: number; // Percentage 0-100
  w: number; // Width Percentage
  h: number; // Height Percentage
  rotation: number; // Degrees 0, 90, 180, 270
  connectivity: 'open' | 'partition' | 'enclosed'; // Spatial connection type
  zone: 'indoor' | 'outdoor';
  color: string;
  icon: string;
}

export interface AppState {
  specs: RoomSpecs;
  mode: 'auto' | 'manual';
  floorPlanItems: FloorItem[];
  isLoadingText: boolean;
  isLoadingImage: boolean;
  designResult: DesignResponse | null;
  generatedImageUrl: string | null;
  error: string | null;
}