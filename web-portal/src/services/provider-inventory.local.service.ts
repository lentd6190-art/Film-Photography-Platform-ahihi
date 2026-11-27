import type {
  Consumable,
  ConsumableFormData,
  Equipment,
  EquipmentFormData,
} from "@/types/provider-inventory";

const EQUIPMENT_STORAGE_KEY = "fpp70-provider-equipment";
const CONSUMABLE_STORAGE_KEY = "fpp70-provider-consumables";

const now = new Date().toISOString();

const initialEquipment: Equipment[] = [
  {
    id: "equipment-demo-001",
    name: "Máy ảnh film Canon AE-1",
    category: "FILM_CAMERA",
    description: "Máy ảnh film phục vụ chụp ảnh analog.",
    brand: "Canon",
    model: "AE-1",
    condition: "GOOD",
    status: "AVAILABLE",
    rentalPrice: 150000,
    maintenanceStatus: "NOT_REQUIRED",
    maintenanceNote: "",
    lastMaintenanceDate: "",
    nextMaintenanceDate: "",
    relatedCreativeSpaceId: "space-001",
    images: [],
    packageCompatibility: [],
    createdAt: now,
    updatedAt: now,
  },
  {
    id: "equipment-demo-002",
    name: "Chân máy tripod",
    category: "TRIPOD",
    description: "Chân máy hỗ trợ chụp ảnh trong studio.",
    brand: "Generic",
    model: "",
    condition: "EXCELLENT",
    status: "AVAILABLE",
    rentalPrice: 50000,
    maintenanceStatus: "NOT_REQUIRED",
    maintenanceNote: "",
    lastMaintenanceDate: "",
    nextMaintenanceDate: "",
    relatedCreativeSpaceId: "space-002",
    images: [],
    packageCompatibility: [],
    createdAt: now,
    updatedAt: now,
  },
];

const initialConsumables: Consumable[] = [
  {
    id: "consumable-demo-001",
    name: "Film Kodak ColorPlus 200",
    description: "Cuộn film màu 35mm.",
    stockQuantity: 12,
    reorderLevel: 5,
    unitPrice: 180000,
    unit: "cuộn",
    expiryDate: "",
    status: "ACTIVE",
    createdAt: now,
    updatedAt: now,
  },
  {
    id: "consumable-demo-002",
    name: "Giấy in ảnh",
    description: "Giấy in ảnh dùng trong phòng tối.",
    stockQuantity: 3,
    reorderLevel: 5,
    unitPrice: 25000,
    unit: "tờ",
    expiryDate: "",
    status: "ACTIVE",
    createdAt: now,
    updatedAt: now,
  },
];

const delay = (ms = 200): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, ms));

function readList<T>(key: string, initial: T[]): T[] {
  if (typeof window === "undefined") {
    return initial;
  }

  const stored = localStorage.getItem(key);

  if (!stored) {
    localStorage.setItem(key, JSON.stringify(initial));
    return [...initial];
  }

  try {
    const parsed: unknown = JSON.parse(stored);

    if (!Array.isArray(parsed)) {
      throw new Error("Invalid inventory data.");
    }

    return parsed as T[];
  } catch {
    localStorage.setItem(key, JSON.stringify(initial));
    return [...initial];
  }
}

function saveList<T>(key: string, items: T[]): void {
  if (typeof window !== "undefined") {
    localStorage.setItem(key, JSON.stringify(items));
  }
}

function createId(): string {
  return crypto.randomUUID();
}

export const providerInventoryLocalService = {
  async getEquipment(): Promise<Equipment[]> {
    await delay();
    return readList(EQUIPMENT_STORAGE_KEY, initialEquipment);
  },

  async getEquipmentById(id: string): Promise<Equipment | null> {
    await delay();
    return (
      readList<Equipment>(EQUIPMENT_STORAGE_KEY, initialEquipment)
        .find((item) => item.id === id) ?? null
    );
  },

  async createEquipment(data: EquipmentFormData): Promise<Equipment> {
    await delay();

    const items = readList<Equipment>(
      EQUIPMENT_STORAGE_KEY,
      initialEquipment,
    );

    const timestamp = new Date().toISOString();

    const created: Equipment = {
      ...data,
      id: createId(),
      createdAt: timestamp,
      updatedAt: timestamp,
    };

    saveList(EQUIPMENT_STORAGE_KEY, [...items, created]);
    return created;
  },

  async updateEquipment(
    id: string,
    data: EquipmentFormData,
  ): Promise<Equipment> {
    await delay();

    const items = readList<Equipment>(
      EQUIPMENT_STORAGE_KEY,
      initialEquipment,
    );

    const index = items.findIndex((item) => item.id === id);

    if (index < 0) {
      throw new Error("Không tìm thấy thiết bị.");
    }

    const updated: Equipment = {
      ...items[index],
      ...data,
      updatedAt: new Date().toISOString(),
    };

    items[index] = updated;
    saveList(EQUIPMENT_STORAGE_KEY, items);
    return updated;
  },

  async getConsumables(): Promise<Consumable[]> {
    await delay();
    return readList(CONSUMABLE_STORAGE_KEY, initialConsumables);
  },

  async getConsumableById(id: string): Promise<Consumable | null> {
    await delay();

    return (
      readList<Consumable>(CONSUMABLE_STORAGE_KEY, initialConsumables)
        .find((item) => item.id === id) ?? null
    );
  },

  async createConsumable(data: ConsumableFormData): Promise<Consumable> {
    await delay();

    const items = readList<Consumable>(
      CONSUMABLE_STORAGE_KEY,
      initialConsumables,
    );

    const timestamp = new Date().toISOString();

    const created: Consumable = {
      ...data,
      id: createId(),
      createdAt: timestamp,
      updatedAt: timestamp,
    };

    saveList(CONSUMABLE_STORAGE_KEY, [...items, created]);
    return created;
  },

  async updateConsumable(
    id: string,
    data: ConsumableFormData,
  ): Promise<Consumable> {
    await delay();

    const items = readList<Consumable>(
      CONSUMABLE_STORAGE_KEY,
      initialConsumables,
    );

    const index = items.findIndex((item) => item.id === id);

    if (index < 0) {
      throw new Error("Không tìm thấy vật tư tiêu hao.");
    }

    const updated: Consumable = {
      ...items[index],
      ...data,
      updatedAt: new Date().toISOString(),
    };

    items[index] = updated;
    saveList(CONSUMABLE_STORAGE_KEY, items);
    return updated;
  },
};
