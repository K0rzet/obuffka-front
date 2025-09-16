import React, { useState } from 'react';
import { observer } from 'mobx-react-lite';
import { shoesStore } from '../../store/ShoesStore';
import { Gender, ShoeFilters } from '../../types/shoe';
import Slider from 'rc-slider';
import 'rc-slider/assets/index.css';
import styles from './FiltersModal.module.scss';

interface FiltersModalProps {
    onClose: () => void;
}

const COLORS = [
    { name: 'Белый', hex: '#FFFFFF' },
    { name: 'Черный', hex: '#000000' },
    { name: 'Красный', hex: '#FF0000' },
    { name: 'Синий', hex: '#0000FF' },
    { name: 'Зеленый', hex: '#008000' },
    { name: 'Желтый', hex: '#FFFF00' },
    { name: 'Розовый', hex: '#FFC0CB' },
    { name: 'Серый', hex: '#808080' },
    { name: 'Коричневый', hex: '#8B4513' },
    { name: 'Бежевый', hex: '#F5F5DC' }
];

const SIZES = [35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45];
const MAX_PRICE = 50000;

const FiltersModal: React.FC<FiltersModalProps> = observer(({ onClose }) => {
    const [localFilters, setLocalFilters] = useState<ShoeFilters>({ ...shoesStore.filters });
    const [priceRange, setPriceRange] = useState<[number, number]>([
        localFilters.minPrice || 0,
        localFilters.maxPrice || MAX_PRICE
    ]);

    const handleApply = () => {
        Object.entries(localFilters).forEach(([key, value]) => {
            shoesStore.setFilter(key as keyof ShoeFilters, value);
        });
        onClose();
    };

    const handleReset = () => {
        shoesStore.resetFilters();
        onClose();
    };

    return (
        <div className={styles.modal}>
            <div className={styles.header}>
                <h2>Фильтры</h2>
                <button className={styles.closeButton} onClick={onClose}>×</button>
            </div>
            <div className={styles.overlay} onClick={onClose}>
                <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
                    <div className={styles.header}>
                        <h2>Фильтры</h2>
                        <button className={styles.closeButton} onClick={onClose}>×</button>
                    </div>

                    <div className={styles.section}>
                        <h3>Пол</h3>
                        <div className={styles.genderButtons}>
                            <button
                                className={localFilters.gender === Gender.MALE ? styles.active : ''}
                                onClick={() => setLocalFilters({ ...localFilters, gender: Gender.MALE })}
                            >
                                Мужское
                            </button>
                            <button
                                className={localFilters.gender === Gender.FEMALE ? styles.active : ''}
                                onClick={() => setLocalFilters({ ...localFilters, gender: Gender.FEMALE })}
                            >
                                Женское
                            </button>
                        </div>
                    </div>

                    <div className={styles.section}>
                        <h3>Цвета</h3>
                        <div className={styles.colorGrid}>
                            {COLORS.map(color => (
                                <div
                                    key={color.name}
                                    className={`${styles.colorOption} ${localFilters.colors?.includes(color.name) ? styles.active : ''}`}
                                    onClick={() => {
                                        const newColors = localFilters.colors?.includes(color.name)
                                            ? (localFilters.colors || []).filter(c => c !== color.name)
                                            : [...(localFilters.colors || []), color.name];
                                        setLocalFilters({ ...localFilters, colors: newColors });
                                    }}
                                >
                                    <input
                                        type="checkbox"
                                        checked={localFilters.colors?.includes(color.name)}
                                        onChange={() => { }}
                                    />
                                    <span className={styles.colorSwatch} style={{ backgroundColor: color.hex }} />
                                    <span className={styles.colorName}>{color.name}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className={styles.section}>
                        <h3>Размеры</h3>
                        <div className={styles.sizes}>
                            {SIZES.map(size => (
                                <div
                                    key={size}
                                    className={`${styles.sizeLabel} ${localFilters.sizes?.includes(size) ? styles.active : ''}`}
                                    onClick={() => {
                                        const newSizes = localFilters.sizes?.includes(size)
                                            ? (localFilters.sizes || []).filter(s => s !== size)
                                            : [...(localFilters.sizes || []), size];
                                        setLocalFilters({ ...localFilters, sizes: newSizes });
                                    }}
                                >
                                    <input
                                        type="checkbox"
                                        checked={localFilters.sizes?.includes(size)}
                                        onChange={() => { }}
                                    />
                                    {size}
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className={styles.section}>
                        <h3>Цена</h3>
                        <div className={styles.priceInputs}>
                            <input
                                type="number"
                                value={priceRange[0]}
                                onChange={(e) => setPriceRange([Number(e.target.value), priceRange[1]])}
                                placeholder="От"
                            />
                            <input
                                type="number"
                                value={priceRange[1]}
                                onChange={(e) => setPriceRange([priceRange[0], Number(e.target.value)])}
                                placeholder="До"
                            />
                        </div>
                        <Slider
                            range
                            min={0}
                            max={MAX_PRICE}
                            value={priceRange}
                            onChange={(value: number | number[]) => {
                                if (Array.isArray(value) && value.length === 2) {
                                    setPriceRange([value[0], value[1]]);
                                    setLocalFilters({
                                        ...localFilters,
                                        minPrice: value[0],
                                        maxPrice: value[1]
                                    });
                                }
                            }}
                        />
                    </div>

                    <div className={styles.buttons}>
                        <button className={styles.reset} onClick={handleReset}>Сбросить</button>
                        <button className={styles.apply} onClick={handleApply}>Применить</button>
                    </div>
                </div>
            </div>
            );
});

            export default FiltersModal; 