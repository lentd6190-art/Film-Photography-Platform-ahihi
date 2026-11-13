export type CreativeSpaceType = "DARKROOM" | "STUDIO";

export type CreativeSpaceStatus = "ACTIVE" | "INACTIVE";

export interface CreativeSpace {
  id: string;
  ownerId: string;
  name: string;
  type: CreativeSpaceType;
  description: string;
  dimensions: string;
  capacity: number;
  artisticStyle: string;
  lighting: string;
  ventilation: string;
  acoustics: string;
  facilities: string[];
  amenities: string[];
  operatingHours: string;
  policies: string;
  priceAmount: number;
  currency: string;
  pricingUnit: string;
  images: string[];
  location: string;
  status: CreativeSpaceStatus;
  createdAt: string;
  updatedAt: string;
}

export type CreativeSpaceFormData = Omit<
  CreativeSpace,
  "id" | "ownerId" | "status" | "createdAt" | "updatedAt"
>;

