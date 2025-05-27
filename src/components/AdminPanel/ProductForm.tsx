import React, { useState, useEffect } from 'react';
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

    const [existingImages, setExistingImages] = useState<string[]>(shoe?.images || []);
    const [imagesToDelete, setImagesToDelete] = useState<string[]>([]);
    const [newImages, setNewImages] = useState<File[]>([]);

    useEffect(() => {
        if (shoe) {
            setFormData(shoe);
            setSelectedSizes(shoe.sizes.join(','));
            setExistingImages(shoe.images || []);
        }
    }, [shoe]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const form = new FormData();
        
        // Основные данные товара
        form.append('name', formData.name || '');
        form.append('description', formData.description || '');
        form.append('color', formData.color || '');
        form.append('gender', formData.gender || Gender.MALE);
        form.append('sizes', JSON.stringify(selectedSizes.split(',').map(Number).filter(Boolean)));
        form.append('price', String(formData.price || 0));

        // Работа с изображениями при редактировании
        if (shoe) {
            // Существующие изображения (которые остаются)
            const remainingImages = existingImages.filter(img => !imagesToDelete.includes(img));
            
            // Отправляем как JSON строки - бэкенд их парсит
            form.append('existingImages', JSON.stringify(remainingImages));
            form.append('imagesToDelete', JSON.stringify(imagesToDelete));
        }

        // Новые изображения
        newImages.forEach(file => {
            form.append('images', file);
        });

        onSubmit(form);
    };

    const handleImageDelete = (imageUrl: string) => {
        setExistingImages(prev => prev.filter(img => img !== imageUrl));
        setImagesToDelete(prev => [...prev, imageUrl]);
    };

    const handleNewImagesChange = (files: File[]) => {
        setNewImages(files);
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
                    <h2>{shoe ? 'Редактировать товар' : 'Создать товар'}</h2>
                    
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

                    {/* Существующие изображения при редактировании */}
                    {shoe && existingImages.length > 0 && (
                        <div className={styles.existingImages}>
                            <label>Текущие изображения:</label>
                            <div className={styles.imageGrid}>
                                {existingImages.map((imageUrl, index) => (
                                    <div key={index} className={styles.imageItem}>
                                        <img src={imageUrl} alt={`Изображение ${index + 1}`} />
                                        <button
                                            type="button"
                                            className={styles.deleteImageButton}
                                            onClick={() => handleImageDelete(imageUrl)}
                                        >
                                            ✕
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                    
                    {/* Загрузка новых изображений */}
                    <div className={styles.newImages}>
                        <label>{shoe ? 'Добавить новые изображения:' : 'Изображения:'}</label>
                        <ImageUploader
                            onChange={handleNewImagesChange}
                            maxFiles={10}
                            theme={window.Telegram?.WebApp?.colorScheme || 'light'}
                        />
                    </div>

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