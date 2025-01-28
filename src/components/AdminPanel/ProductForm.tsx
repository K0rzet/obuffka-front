import React, { useState } from 'react';
import { observer } from 'mobx-react-lite';
import { Shoe, Gender } from '../../types/shoe';

import styles from './ProductForm.module.scss';
import { ImageUploader } from '../ImageUploader';

interface ProductFormProps {
    shoe?: Shoe;
    onSubmit: (data: FormData) => void;
    onCancel: () => void;
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

const ProductForm: React.FC<ProductFormProps> = observer(({ shoe, onSubmit, onCancel }) => {
    const [formData, setFormData] = useState<Partial<Shoe>>(shoe || {
        name: '',
        description: '',
        color: '',
        gender: Gender.MALE,
        sizes: [],
        price: 0,
        images: []
    });
    
    const [selectedSizes, setSelectedSizes] = useState<string>(
        shoe?.sizes ? shoe.sizes.join(',') : ''
    );

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const form = new FormData();
        
        form.append('name', formData.name || '');
        form.append('description', formData.description || '');
        form.append('color', formData.color || '');
        form.append('gender', formData.gender || Gender.MALE);
        form.append('sizes', JSON.stringify(selectedSizes.split(',').map(Number).filter(Boolean)));
        form.append('price', String(formData.price || 0));

        // Если есть существующие изображения, добавляем их
        if (shoe?.images) {
            form.append('existingImages', JSON.stringify(shoe.images));
        }

        onSubmit(form);
    };

    const handleImagesChange = (files: File[]) => {
        // Добавляем новые файлы в FormData
        const form = new FormData();
        files.forEach(file => {
            form.append('images', file);
        });

        // Добавляем остальные данные формы
        form.append('name', formData.name || '');
        form.append('description', formData.description || '');
        form.append('color', formData.color || '');
        form.append('gender', formData.gender || Gender.MALE);
        form.append('sizes', JSON.stringify(selectedSizes.split(',').map(Number).filter(Boolean)));
        form.append('price', String(formData.price || 0));

        // Если есть существующие изображения, добавляем их
        if (shoe?.images) {
            form.append('existingImages', JSON.stringify(shoe.images));
        }

        onSubmit(form);
    };

    const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
        if (e.target === e.currentTarget) {
            onCancel();
        }
    };

    return (
        <div className={styles.modalOverlay} onClick={handleOverlayClick}>
            <div className={styles.modalContent}>
                <form className={styles.form} onSubmit={handleSubmit}>
                    <input
                        type="text"
                        placeholder="Название"
                        value={formData.name || ''}
                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                        required
                    />
                    <textarea
                        placeholder="Описание"
                        value={formData.description || ''}
                        onChange={e => setFormData({ ...formData, description: e.target.value })}
                        required
                    />
                    <div className={styles.colorSection}>
                        <label>Цвет:</label>
                        <div className={styles.colorGrid}>
                            {COLORS.map(color => (
                                <div
                                    key={color.name}
                                    className={`${styles.colorOption} ${formData.color === color.name ? styles.active : ''}`}
                                    onClick={() => setFormData({ ...formData, color: color.name })}
                                >
                                    <span 
                                        className={styles.colorSwatch} 
                                        style={{ backgroundColor: color.hex }}
                                    />
                                    <span className={styles.colorName}>{color.name}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                    <select
                        value={formData.gender}
                        onChange={e => setFormData({ ...formData, gender: e.target.value as Gender })}
                        required
                    >
                        <option value={Gender.MALE}>Мужское</option>
                        <option value={Gender.FEMALE}>Женское</option>
                    </select>
                    <input
                        type="text"
                        placeholder="Размеры (через запятую)"
                        value={selectedSizes}
                        onChange={e => setSelectedSizes(e.target.value)}
                        required
                    />
                    <input
                        type="number"
                        placeholder="Цена"
                        value={formData.price || ''}
                        onChange={e => setFormData({ ...formData, price: Number(e.target.value) })}
                        required
                    />
                    
                    <ImageUploader
                        onChange={handleImagesChange}
                        maxFiles={10}
                        theme={window.Telegram?.WebApp?.colorScheme || 'light'}
                    />

                    <div className={styles.buttons}>
                        <button type="submit">{shoe ? 'Сохранить' : 'Создать'}</button>
                        <button type="button" onClick={onCancel}>Отмена</button>
                    </div>
                </form>
            </div>
        </div>
    );
});

export default ProductForm; 