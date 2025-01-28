import { makeAutoObservable, runInAction } from 'mobx';
import axiosInstance from '../api/axiosInstance';
import { Shoe, ShoeFilters, ShoesResponse, Gender, SortOrder } from '../types/shoe';

class ShoesStore {
    shoes: Shoe[] = [];
    isLoading: boolean = false;
    error: string | null = null;
    filters: ShoeFilters = {
        gender: Gender.MALE,
        priceSort: SortOrder.ASC
    };
    page: number = 1;
    totalPages: number = 1;

    constructor() {
        makeAutoObservable(this);
    }

    setFilter<K extends keyof ShoeFilters>(key: K, value: ShoeFilters[K]) {
        this.filters[key] = value;
        this.page = 1;
        this.fetchShoes();
    }

    setPage(page: number) {
        this.page = page;
        this.fetchShoes();
    }

    async fetchShoes() {
        this.isLoading = true;
        this.error = null;

        try {
            const queryParams = new URLSearchParams();
            Object.entries(this.filters).forEach(([key, value]) => {
                if (value !== undefined) {
                    if (Array.isArray(value)) {
                        queryParams.append(key, value.join(','));
                    } else {
                        queryParams.append(key, String(value));
                    }
                }
            });
            queryParams.append('page', String(this.page));

            const response = await axiosInstance.get<ShoesResponse>(`/shoes?${queryParams}`);
            
            runInAction(() => {
                this.shoes = response.data.data;
                this.totalPages = response.data.meta.lastPage;
            });
        } catch (error) {
            runInAction(() => {
                this.error = 'Ошибка при загрузке товаров';
                console.error(error);
            });
        } finally {
            runInAction(() => {
                this.isLoading = false;
            });
        }
    }
}

export const shoesStore = new ShoesStore(); 