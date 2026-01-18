// src/lib/modules/catalog/brands/brand.dto.ts
export type BrandDTO = {
  id: string;
  name: string;
  slug: string;
  imageUrl: string | null;
  createdAt: string;
  updatedAt: string;
};

export type ListBrandsResponse = { brands: BrandDTO[] };
export type GetBrandResponse = { brand: BrandDTO };

export type CreateBrandInput = { name: string; slug: string; imageUrl?: string | null };
export type CreateBrandResponse = { id: string };

export type UpdateBrandInput = { name?: string; slug?: string; imageUrl?: string | null };
export type UpdateBrandResponse = { brand: { id: string } };

export type DeleteBrandResponse = { id: string };
