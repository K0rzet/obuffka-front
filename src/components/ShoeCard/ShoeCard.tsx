import React from 'react';
import styles from './ShoeCard.module.scss';
import { Shoe } from '../../types/shoe';

interface ShoeCardProps {
    shoe: Shoe;
}

const ShoeCard: React.FC<ShoeCardProps> = ({ shoe }) => {
    return (
        <div className={styles.card}>
            <h3 className={styles.title}>{shoe.name}</h3>
            <p className={styles.description}>{shoe.description}</p>
            <div className={styles.info}>
                <span className={styles.price}>{shoe.price.toLocaleString('ru-RU')} ₽</span>
                <span className={styles.color}>{shoe.color}</span>
            </div>
            <div className={styles.sizes}>
                {shoe.sizes.map((size) => (
                    <span key={size}>{size}</span>
                ))}
            </div>
        </div>
    );
};

export default ShoeCard; 