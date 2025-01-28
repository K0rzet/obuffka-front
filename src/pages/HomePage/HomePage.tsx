import React, { useEffect } from 'react';
import { observer } from 'mobx-react-lite';
import { shoesStore } from '../../store/ShoesStore';
import ShoeFilters from '../../components/ShoeFilters/ShoeFilters';
import ShoeCard from '../../components/ShoeCard/ShoeCard';
import Pagination from '../../components/Pagination/Pagination';
import styles from './HomePage.module.scss';

const HomePage: React.FC = observer(() => {
    useEffect(() => {
        shoesStore.fetchShoes();
    }, []);

    if (shoesStore.isLoading) {
        return <div>Загрузка...</div>;
    }

    return (
        <div className={styles.container}>
            <ShoeFilters />
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