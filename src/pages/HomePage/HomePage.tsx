import React, { useEffect, useState } from 'react';
import { observer } from 'mobx-react-lite';
import { shoesStore } from '../../store/ShoesStore';
import { authStore } from '../../store/AuthStore';

import ShoeCard from '../../components/ShoeCard/ShoeCard';
import Pagination from '../../components/Pagination/Pagination';
import FiltersModal from '../../components/FiltersModal/FiltersModal';
import styles from './HomePage.module.scss';
import { SortOrder } from '../../types/shoe';

const HomePage: React.FC = observer(() => {
    const [isFiltersOpen, setIsFiltersOpen] = useState(false);

    useEffect(() => {
        // Загружаем товары только если пользователь авторизован
        if (authStore.isAuthenticated) {
            shoesStore.fetchShoes();
        }
    }, [authStore.isAuthenticated]);

    // Показываем загрузку авторизации
    if (!authStore.isInitialized) {
        return (
            <div className={styles.loadingContainer}>
                <div className={styles.spinner}></div>
                <p>Инициализация...</p>
            </div>
        );
    }

    // Показываем ошибку авторизации
    if (authStore.error && !authStore.user) {
        return (
            <div className={styles.errorContainer}>
                <h2>Ошибка авторизации</h2>
                <p>{authStore.error}</p>
                <button 
                    onClick={() => {
                        authStore.clearError();
                        authStore.initAuth();
                    }}
                    className={styles.retryButton}
                >
                    Попробовать снова
                </button>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <select 
                    className={styles.select}
                    value={shoesStore.filters.priceSort}
                    onChange={(e) => shoesStore.setFilter('priceSort', e.target.value as SortOrder)}
                >
                    <option value={SortOrder.ASC}>Сначала дешевле</option>
                    <option value={SortOrder.DESC}>Сначала дороже</option>
                </select>
                <button 
                    className={styles.filterButton}
                    onClick={() => setIsFiltersOpen(true)}
                >
                    Фильтры
                </button>
            </div>
            
            {isFiltersOpen && (
                <FiltersModal onClose={() => setIsFiltersOpen(false)} />
            )}

            {/* Показываем ошибку загрузки товаров */}
            {shoesStore.error && (
                <div className={styles.errorMessage}>
                    <p>{shoesStore.error}</p>
                    <button 
                        onClick={() => shoesStore.fetchShoes()}
                        className={styles.retryButton}
                    >
                        Повторить
                    </button>
                </div>
            )}

            {/* Показываем загрузку товаров */}
            {shoesStore.isLoading && (
                <div className={styles.loadingContainer}>
                    <div className={styles.spinner}></div>
                    <p>Загрузка товаров...</p>
                </div>
            )}

            {/* Показываем товары */}
            {!shoesStore.isLoading && !shoesStore.error && (
                <>
                    {shoesStore.shoes.length > 0 ? (
                        <div className={styles.grid}>
                            {shoesStore.shoes.map(shoe => (
                                <ShoeCard key={shoe.id} shoe={shoe} />
                            ))}
                        </div>
                    ) : (
                        <div className={styles.emptyState}>
                            <h3>Товары не найдены</h3>
                            <p>Попробуйте изменить фильтры или обратитесь к администратору</p>
                        </div>
                    )}
                    
                    {shoesStore.shoes.length > 0 && (
                        <Pagination 
                            currentPage={shoesStore.page}
                            totalPages={shoesStore.totalPages}
                            onPageChange={(page) => shoesStore.setPage(page)}
                        />
                    )}
                </>
            )}
        </div>
    );
});

export default HomePage; 