import React, { useRef, useEffect } from 'react';
import styles from './ShoeCard.module.scss';
import { Shoe } from '../../types/shoe';
import { getImageUrl } from '../../utils/imageUtils';

interface ShoeCardProps {
    shoe: Shoe;
}

const ShoeCard: React.FC<ShoeCardProps> = ({ shoe }) => {
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const scrollContainer = scrollRef.current;
        if (!scrollContainer) return;

        const handleWheel = (e: WheelEvent) => {
            // Если зажат Shift или это горизонтальный скролл, позволяем браузеру обработать событие
            if (e.shiftKey || Math.abs(e.deltaX) > Math.abs(e.deltaY)) {
                return;
            }

            // Проверяем, есть ли возможность горизонтальной прокрутки
            const canScrollLeft = scrollContainer.scrollLeft > 0;
            const canScrollRight = scrollContainer.scrollLeft < scrollContainer.scrollWidth - scrollContainer.clientWidth;

            // Если есть возможность прокрутки в направлении скролла
            if ((e.deltaY < 0 && canScrollLeft) || (e.deltaY > 0 && canScrollRight)) {
                e.preventDefault();
                scrollContainer.scrollLeft += e.deltaY;
            }
        };

        scrollContainer.addEventListener('wheel', handleWheel);
        return () => scrollContainer.removeEventListener('wheel', handleWheel);
    }, []);

    return (
        <div className={styles.card}>
            {shoe.images && shoe.images.length > 0 && (
                <div className={styles.imageScroller} ref={scrollRef}>
                    {shoe.images.map((image, index) => (
                        <img 
                            key={index}
                            src={getImageUrl(image)}
                            alt={`${shoe.name} ${index + 1}`}
                            className={styles.image}
                        />
                    ))}
                </div>
            )}
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