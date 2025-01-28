import React, { useEffect, useState } from 'react';
import { observer } from 'mobx-react-lite';
import { shoesStore } from '../../store/ShoesStore';

import ShoeCard from '../../components/ShoeCard/ShoeCard';
import Pagination from '../../components/Pagination/Pagination';
import FiltersModal from '../../components/FiltersModal/FiltersModal';
import styles from './HomePage.module.scss';

const HomePage: React.FC = observer(() => {
    const [isFiltersOpen, setIsFiltersOpen] = useState(false);

    useEffect(() => {
        shoesStore.fetchShoes();
    }, []);

    if (shoesStore.isLoading) {
        return <div>Загрузка...</div>;
    }

    return (
        <div className={styles.container}>
            <button 
                className={styles.filterButton}
                onClick={() => setIsFiltersOpen(true)}
            >
                Фильтры
            </button>
            
            {isFiltersOpen && (
                <FiltersModal onClose={() => setIsFiltersOpen(false)} />
            )}

            <div className={styles.grid}>
                {shoesStore.shoes.map(shoe => (
                    <ShoeCard key={shoe.id} shoe={shoe} />
                ))}
            </div>
            <Pagination 
                currentPage={shoesStore.page}
                totalPages={shoesStore.totalPages}
                onPageChange={(page) => shoesStore.setPage(page)}
            />
        </div>
    );
});

export default HomePage; 