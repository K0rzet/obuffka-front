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
                    <input
                        type="text"
                        placeholder="Цвет"
                        value={formData.color || ''}
                        onChange={e => setFormData({ ...formData, color: e.target.value })}
                        required
                    />
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