
import type {
  CreativeSpace,
  CreativeSpaceFormData,
} from "@/types/creative-space";

const STORAGE_KEY = "provider-creative-spaces";
const DEMO_PROVIDER_ID = "demo-provider";

const initialSpaces: CreativeSpace[] = [
  {
    id: "space-001",
    ownerId: DEMO_PROVIDER_ID,
    name: "Darkroom Studio",
    type: "DARKROOM",
    description: "Không gian tráng phim dành cho nhiếp ảnh analog.",
    dimensions: "30m2",
    capacity: 5,
    artisticStyle: "Analog",
    lighting: "Red safety light",
    ventilation: "Standard ventilation",
    acoustics: "Standard",
    facilities: ["Film developing station"],
    amenities: ["Wi-Fi"],
    operatingHours: "08:00 - 18:00",
    policies: "Đặt lịch trước khi sử dụng.",
    priceAmount: 200000,
    currency: "VND",
    pricingUnit: "HOUR",
    images: [],
    location: "Ho Chi Minh City",
    status: "ACTIVE",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "space-002",
    ownerId: DEMO_PROVIDER_ID,
    name: "Natural Light Studio",
    type: "STUDIO",
    description: "Studio chụp ảnh với ánh sáng tự nhiên.",
    dimensions: "50m2",
    capacity: 10,
    artisticStyle: "Minimalist",
    lighting: "Natural light",
    ventilation: "Air conditioning",
    acoustics: "Standard",
    facilities: ["Backdrop", "Changing room"],
    amenities: ["Wi-Fi", "Parking"],
    operatingHours: "09:00 - 20:00",
    policies: "Giữ gìn thiết bị và vệ sinh không gian.",
    priceAmount: 350000,
    currency: "VND",
    pricingUnit: "HOUR",
    images: [],
    location: "Ho Chi Minh City",
    status: "ACTIVE",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

const delay = (ms = 300): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, ms));

function readSpaces(): CreativeSpace[] {
  if (typeof window === "undefined") {
    return initialSpaces;
  }

  const stored = localStorage.getItem(STORAGE_KEY);

  if (!stored) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(initialSpaces));
    return [...initialSpaces];
  }

  try {
    const parsed: unknown = JSON.parse(stored);

    if (!Array.isArray(parsed)) {
      throw new Error("Invalid creative spaces data.");
    }

    return parsed as CreativeSpace[];
  } catch {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(initialSpaces));
    return [...initialSpaces];
  }
}

function saveSpaces(spaces: CreativeSpace[]): void {
  if (typeof window === "undefined") {
    return;
  }

  localStorage.setItem(STORAGE_KEY, JSON.stringify(spaces));
}

function findOwnedSpaceIndex(
  spaces: CreativeSpace[],
  id: string,
): number {
  return spaces.findIndex(
    (space) =>
      space.id === id && space.ownerId === DEMO_PROVIDER_ID,
  );
}

export const creativeSpaceService = {
  // Lấy danh sách Creative Space của Provider.
  async getAll(): Promise<CreativeSpace[]> {
    await delay();

    return readSpaces().filter(
      (space) => space.ownerId === DEMO_PROVIDER_ID,
    );
  },

  // Lấy chi tiết Creative Space theo ID.
  async getById(id: string): Promise<CreativeSpace | null> {
    await delay();

    const spaces = readSpaces();
    const index = findOwnedSpaceIndex(spaces, id);

    return index === -1 ? null : spaces[index];
  },

  // Tạo Creative Space mới.
  async create(
    data: CreativeSpaceFormData,
  ): Promise<CreativeSpace> {
    await delay();

    const now = new Date().toISOString();

    const newSpace: CreativeSpace = {
      ...data,
      id: crypto.randomUUID(),
      ownerId: DEMO_PROVIDER_ID,
      status: "ACTIVE",
      createdAt: now,
      updatedAt: now,
    };

    const spaces = readSpaces();
    saveSpaces([...spaces, newSpace]);

    return newSpace;
  },

  // Cập nhật thông tin Creative Space.
  async update(
    id: string,
    data: CreativeSpaceFormData,
  ): Promise<CreativeSpace> {
    await delay();

    const spaces = readSpaces();
    const index = findOwnedSpaceIndex(spaces, id);

    if (index === -1) {
      throw new Error("Không tìm thấy Creative Space.");
    }

    const updatedSpace: CreativeSpace = {
      ...spaces[index],
      ...data,
      updatedAt: new Date().toISOString(),
    };

    spaces[index] = updatedSpace;
    saveSpaces(spaces);

    return updatedSpace;
  },

  // Deactivate Creative Space, không xóa dữ liệu.
  async deactivate(id: string): Promise<CreativeSpace> {
    await delay();

    const spaces = readSpaces();
    const index = findOwnedSpaceIndex(spaces, id);

    if (index === -1) {
      throw new Error("Không tìm thấy Creative Space.");
    }

    const updatedSpace: CreativeSpace = {
      ...spaces[index],
      status: "INACTIVE",
      updatedAt: new Date().toISOString(),
    };

    spaces[index] = updatedSpace;
    saveSpaces(spaces);

    return updatedSpace;
  },
};
