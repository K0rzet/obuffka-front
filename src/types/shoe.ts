export enum Gender {
    MALE = 'MALE',
    FEMALE = 'FEMALE'
}

export enum SortOrder {
    ASC = 'asc',
    DESC = 'desc'
}

export interface Shoe {
    id: number;
    name: string;
    description: string;
    color: string;
    gender: Gender;
    sizes: number[];
    price: number;
    images: string[];
}

export interface ShoeFilters {
    name?: string;
    description?: string;
    colors?: string[];
    gender?: Gender;
    sizes?: number[];
    minPrice?: number;
    maxPrice?: number;
    priceSort?: SortOrder;
}

export interface PaginationMeta {
    total: number;
    page: number;
    lastPage: number;
}

export interface ShoesResponse {
    data: Shoe[];
    meta: PaginationMeta;
} 