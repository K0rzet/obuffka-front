import React from 'react';
import { observer } from 'mobx-react-lite';
import { shoesStore } from '../../store/ShoesStore';
import { Gender, SortOrder } from '../../types/shoe';
import styles from './ShoeFilters.module.scss';

const ShoeFilters: React.FC = observer(() => {
    return (
        <div className={styles.filters}>
            <div className={styles.genderLinks}>
                <a 
                    className={`${styles.link} ${shoesStore.filters.gender === Gender.MALE ? styles.active : ''}`}
                    onClick={() => shoesStore.setFilter('gender', Gender.MALE)}
                >
                    Мужское
                </a>
                <a 
                    className={`${styles.link} ${shoesStore.filters.gender === Gender.FEMALE ? styles.active : ''}`}
                    onClick={() => shoesStore.setFilter('gender', Gender.FEMALE)}
                >
                    Женское
                </a>
            </div>

            <select 
                value={shoesStore.filters.priceSort}
                onChange={(e) => shoesStore.setFilter('priceSort', e.target.value as SortOrder)}
                className={styles.select}
            >
                <option value={SortOrder.ASC}>Сначала дешевле</option>
                <option value={SortOrder.DESC}>Сначала дороже</option>
            </select>

            <div className={styles.colors}>
                {['Белый', 'Черный', 'Красный'].map(color => (
                    <label key={color} className={styles.colorLabel}>
                        <input
                            type="checkbox"
                            checked={shoesStore.filters.color === color}
                            onChange={() => shoesStore.setFilter('color', color)}
                        />
                        {color}
                    </label>
                ))}
            </div>
        </div>
    );
});

export default ShoeFilters; 