import React, { useState } from 'react';
import { observer } from 'mobx-react-lite';
import { Shoe, Gender } from '../../types/shoe';
import styles from './ProductForm.module.scss';

interface ProductFormProps {
    shoe?: Shoe;
    onSubmit: (data: Partial<Shoe>) => void;
    onCancel: () => void;
}

const ProductForm: React.FC<ProductFormProps> = observer(({ shoe, onSubmit, onCancel }) => {
    const [formData, setFormData] = useState<Partial<Shoe>>(shoe || {
        name: '',
        description: '',
        color: '',
        gender: Gender.MALE,
        sizes: [],
        price: 0
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit(formData);
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
            <div className={styles.buttons}>
                <button type="submit">{shoe ? 'Сохранить' : 'Создать'}</button>
                <button type="button" onClick={onCancel}>Отмена</button>
            </div>
        </form>
    );
});

export default ProductForm; 