import React, { useState, useRef } from 'react';
import { observer } from 'mobx-react-lite';
import { Shoe, Gender } from '../../types/shoe';
import styles from './ProductForm.module.scss';

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
    
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const form = new FormData();
        
        // Добавляем все поля в FormData
        Object.entries(formData).forEach(([key, value]) => {
            if (key !== 'images') {
                form.append(key, typeof value === 'object' ? JSON.stringify(value) : String(value));
            }
        });

        // Добавляем файлы изображений
        if (fileInputRef.current?.files) {
            Array.from(fileInputRef.current.files).forEach(file => {
                form.append('images', file);
            });
        }

        onSubmit(form);
    };

    return (
        <form className={styles.form} onSubmit={handleSubmit}>
            <input
                type="text"
                placeholder="Название"
                value={formData.name || ''}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
            />
            <textarea
                placeholder="Описание"
                value={formData.description || ''}
                onChange={e => setFormData({ ...formData, description: e.target.value })}
            />
            <input
                type="text"
                placeholder="Цвет"
                value={formData.color || ''}
                onChange={e => setFormData({ ...formData, color: e.target.value })}
            />
            <select
                value={formData.gender}
                onChange={e => setFormData({ ...formData, gender: e.target.value as Gender })}
            >
                <option value={Gender.MALE}>Мужское</option>
                <option value={Gender.FEMALE}>Женское</option>
            </select>
            <input
                type="text"
                placeholder="Размеры (через запятую)"
                value={formData.sizes?.join(',') || ''}
                onChange={e => setFormData({ ...formData, sizes: e.target.value.split(',').map(Number) })}
            />
            <input
                type="number"
                placeholder="Цена"
                value={formData.price || ''}
                onChange={e => setFormData({ ...formData, price: Number(e.target.value) })}
            />
            <div className={styles.imageUpload}>
                <label>Изображения:</label>
                <input
                    type="file"
                    multiple
                    accept="image/*"
                    ref={fileInputRef}
                />
                {shoe?.images && (
                    <div className={styles.currentImages}>
                        {shoe.images.map((image, index) => (
                            <img 
                                key={index} 
                                src={image} 
                                alt={`Product ${index + 1}`} 
                                className={styles.thumbnail}
                            />
                        ))}
                    </div>
                )}
            </div>
            <div className={styles.buttons}>
                <button type="submit">{shoe ? 'Сохранить' : 'Создать'}</button>
                <button type="button" onClick={onCancel}>Отмена</button>
            </div>
        </form>
    );
});

export default ProductForm; 