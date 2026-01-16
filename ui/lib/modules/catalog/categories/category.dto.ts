// src/modules/catalog/categories/category.dto.ts
export type CategoryDTO = {
  id: string;
  name: string;
  slug: string;
  parentId: string | null;
  imageUrl: string | null;
  slugPath: string | null;
  createdAt: string;
  updatedAt: string;
};

export type ListCategoriesResponse = { categories: CategoryDTO[] };
export type GetCategoryResponse = { category: CategoryDTO };

export type CreateCategoryInput = {
  name: string;
  slug: string;
  parentId?: string | null;
  imageUrl?: string | null;
};

export type CreateCategoryResponse = { categoryId: string };

export type UpdateCategoryInput = {
  name?: string;
  slug?: string;
  parentId?: string | null;
  imageUrl?: string | null;
  slugPath?: string | null;
};

export type UpdateCategoryResponse = { category: { id: string } };

export type DeleteCategoryResponse = { id: string };


// src/modules/catalog/categories/ui/tree/categoryTree.types.ts

export type Breadcrumb = {
  id: string | null;   // null = raíz
  label: string;       // "Raíz" o nombre
};

export type CategoryTreeState = {
  parentId: string | null;        // null = raíz
  breadcrumbs: Breadcrumb[];       // ["Raíz", "Bebidas", ...]
  rows: CategoryDTO[];
  loading: boolean;
  error: string | null;
  hasMore: boolean;

  setSearch: (v: string) => void;
  search: string;

  openRoot: () => void;
  openChild: (c: CategoryDTO) => void;
  goToCrumb: (crumbIndex: number) => void;
  goUp: () => void;
  refresh: () => Promise<void>;
  loadMore: () => Promise<void>;
  setError: (v: string | null) => void;
};
