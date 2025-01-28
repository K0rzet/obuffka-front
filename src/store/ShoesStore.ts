import { makeAutoObservable, runInAction } from 'mobx';
import axiosInstance from '../api/axiosInstance';
import { Shoe, ShoeFilters, ShoesResponse, Gender, SortOrder } from '../types/shoe';

class ShoesStore {
    shoes: Shoe[] = [];
    isLoading: boolean = false;
    error: string | null = null;
    filters: ShoeFilters = {
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
            
            // Добавляем только установленные фильтры
            Object.entries(this.filters).forEach(([key, value]) => {
                if (value !== undefined && key !== 'priceSort') {
                    if (Array.isArray(value)) {
                        if (value.length > 0) {
                            queryParams.append(key, value.join(','));
                        }
                    } else {
                        queryParams.append(key, String(value));
                    }
                }
            });

            // Всегда добавляем сортировку и пагинацию
            queryParams.append('priceSort', this.filters.priceSort || SortOrder.ASC);
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

    async createShoe(data: FormData) {
        try {
            const response = await axiosInstance.post<Shoe>('/shoes', data, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            runInAction(() => {
                this.shoes.push(response.data);
            });
        } catch (error) {
            console.error('Ошибка при создании товара:', error);
            throw error;
        }
    }

    async updateShoe(id: number, data: FormData) {
        try {
            const response = await axiosInstance.put<Shoe>(`/shoes/${id}`, data, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            runInAction(() => {
                const index = this.shoes.findIndex(shoe => shoe.id === id);
                if (index !== -1) {
                    this.shoes[index] = response.data;
                }
            });
        } catch (error) {
            console.error('Ошибка при обновлении товара:', error);
            throw error;
        }
    }

    async deleteShoe(id: number) {
        try {
            await axiosInstance.delete(`/shoes/${id}`);
            runInAction(() => {
                this.shoes = this.shoes.filter(shoe => shoe.id !== id);
            });
        } catch (error) {
            console.error('Ошибка при удалении товара:', error);
            throw error;
        }
    }

    resetFilters() {
        this.filters = {
            priceSort: SortOrder.ASC
        };
        this.page = 1;
        this.fetchShoes();
    }
}

export const shoesStore = new ShoesStore(); 