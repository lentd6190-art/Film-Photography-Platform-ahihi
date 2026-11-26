export type EquipmentCondition =
  | "NEW"
  | "EXCELLENT"
  | "GOOD"
  | "FAIR"
  | "POOR"
  | "DAMAGED";

export type EquipmentStatus =
  | "AVAILABLE"
  | "RENTED"
  | "MAINTENANCE"
  | "INACTIVE";

export type MaintenanceStatus =
  | "NOT_REQUIRED"
  | "SCHEDULED"
  | "IN_PROGRESS"
  | "OVERDUE";

export interface Equipment {
  id: string;
  name: string;
  category: string;
  description: string;
  brand: string;
  model: string;
  condition: EquipmentCondition;
  status: EquipmentStatus;
  rentalPrice: number;
  maintenanceStatus: MaintenanceStatus;
  maintenanceNote: string;
  lastMaintenanceDate: string;
  nextMaintenanceDate: string;
  relatedCreativeSpaceId: string;
  images: string[];
  packageCompatibility: string[];
  createdAt: string;
  updatedAt: string;
}

export type EquipmentFormData = Omit<
  Equipment,
  "id" | "createdAt" | "updatedAt"
>;

export type ConsumableStatus = "ACTIVE" | "INACTIVE";

export interface Consumable {
  id: string;
  name: string;
  description: string;
  stockQuantity: number;
  reorderLevel: number;
  unitPrice: number;
  unit: string;
  expiryDate: string;
  status: ConsumableStatus;
  createdAt: string;
  updatedAt: string;
}

export type ConsumableFormData = Omit<
  Consumable,
  "id" | "createdAt" | "updatedAt"
>;
