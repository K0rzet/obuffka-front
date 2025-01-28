import React, { useEffect } from 'react';
import { observer } from 'mobx-react-lite';
import { shoesStore } from '../../store/ShoesStore';
import ShoeFilters from '../../components/ShoeFilters/ShoeFilters';
import ShoeCard from '../../components/ShoeCard/ShoeCard';
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
        </div>
    );
});

export default HomePage; 