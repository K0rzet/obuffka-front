import React from 'react';
import styles from './ShoeCard.module.scss';
import { Shoe } from '../../types/shoe';
import ImageSlider from '../ImageSlider/ImageSlider';

interface ShoeCardProps {
    shoe: Shoe;
}

const ShoeCard: React.FC<ShoeCardProps> = ({ shoe }) => {
    const hasMultipleImages = shoe.images && shoe.images.length > 1;

    return (
        <div className={styles.card}>
            {hasMultipleImages && (
                <div className={styles.badge}>
                    {shoe.images!.length} фото
                </div>
            )}
            
            <div className={styles.imageContainer}>
                <ImageSlider 
                    images={shoe.images || []} 
                    alt={shoe.name} 
                />
                <div className={styles.imageOverlay}></div>
            </div>

            <div className={styles.content}>
                <div className={styles.brand}>
                    {shoe.brand || 'Обувь'}
                </div>
                
                <h3 className={styles.name}>{shoe.name}</h3>
                
                <div className={styles.details}>
                    <div className={styles.size}>
                        Размер: {shoe.sizes.join(', ')}
                    </div>
                </div>

                <div className={styles.price}>
                    {shoe.price.toLocaleString('ru-RU')} ₽
                </div>
            </div>
        </div>
    );
};

export default ShoeCard; 