import React from 'react';
import styles from './ShoeCard.module.scss';
import { Shoe } from '../../types/shoe';
import { getImageUrl } from '../../utils/imageUtils';

interface ShoeCardProps {
    shoe: Shoe;
}

const ShoeCard: React.FC<ShoeCardProps> = ({ shoe }) => {
    const mainImage = shoe.images && shoe.images.length > 0 ? shoe.images[0] : null;
    const hasMultipleImages = shoe.images && shoe.images.length > 1;

    return (
        <div className={styles.card}>
            {hasMultipleImages && (
                <div className={styles.badge}>
                    {shoe.images!.length} фото
                </div>
            )}
            
            <div className={styles.imageContainer}>
                {mainImage ? (
                    <img 
                        src={getImageUrl(mainImage)}
                        alt={shoe.name}
                        className={styles.image}
                    />
                ) : (
                    <div className={styles.noImage}>
                        <span>Нет фото</span>
                    </div>
                )}
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
                    <div className={`${styles.condition} ${styles[shoe.condition || 'used']}`}>
                        {shoe.condition === 'new' ? 'Новое' : 'Б/У'}
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