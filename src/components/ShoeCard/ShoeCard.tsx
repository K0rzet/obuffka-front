import React, { useRef, useEffect, useState } from 'react';
import styles from './ShoeCard.module.scss';
import { Shoe } from '../../types/shoe';
import { getImageUrl } from '../../utils/imageUtils';

interface ShoeCardProps {
    shoe: Shoe;
}

const ShoeCard: React.FC<ShoeCardProps> = ({ shoe }) => {
    const scrollRef = useRef<HTMLDivElement>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [startX, setStartX] = useState(0);
    const [scrollLeft, setScrollLeft] = useState(0);

    useEffect(() => {
        const scrollContainer = scrollRef.current;
        if (!scrollContainer) return;

        const handleWheel = (e: WheelEvent) => {
            if (e.deltaX !== 0) {
                e.preventDefault();
                scrollContainer.scrollLeft += e.deltaX;
            }
        };

        const handleMouseDown = (e: MouseEvent) => {
            setIsDragging(true);
            setStartX(e.pageX - scrollContainer.offsetLeft);
            setScrollLeft(scrollContainer.scrollLeft);
        };

        const handleMouseUp = () => {
            setIsDragging(false);
        };

        const handleMouseMove = (e: MouseEvent) => {
            if (!isDragging) return;
            e.preventDefault();
            const x = e.pageX - scrollContainer.offsetLeft;
            const walk = (x - startX) * 2;
            scrollContainer.scrollLeft = scrollLeft - walk;
        };

        scrollContainer.addEventListener('wheel', handleWheel);
        scrollContainer.addEventListener('mousedown', handleMouseDown);
        window.addEventListener('mouseup', handleMouseUp);
        window.addEventListener('mousemove', handleMouseMove);

        return () => {
            scrollContainer.removeEventListener('wheel', handleWheel);
            scrollContainer.removeEventListener('mousedown', handleMouseDown);
            window.removeEventListener('mouseup', handleMouseUp);
            window.removeEventListener('mousemove', handleMouseMove);
        };
    }, [isDragging, startX, scrollLeft]);

    return (
        <div className={styles.card}>
            {shoe.images && shoe.images.length > 0 && (
                <div 
                    className={`${styles.imageScroller} ${isDragging ? styles.grabbing : styles.grab}`} 
                    ref={scrollRef}
                >
                    {shoe.images.map((image, index) => (
                        <img 
                            key={index}
                            src={getImageUrl(image)}
                            alt={`${shoe.name} ${index + 1}`}
                            className={styles.image}
                            draggable={false}
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