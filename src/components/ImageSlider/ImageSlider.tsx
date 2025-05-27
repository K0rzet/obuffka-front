import React, { useState } from 'react';
import { RiArrowLeftSLine, RiArrowRightSLine } from 'react-icons/ri';
import styles from './ImageSlider.module.scss';
import { getImageUrl } from '../../utils/imageUtils';

interface ImageSliderProps {
    images: string[];
    alt: string;
}

const ImageSlider: React.FC<ImageSliderProps> = ({ images, alt }) => {
    const [currentIndex, setCurrentIndex] = useState(0);

    if (!images || images.length === 0) {
        return (
            <div className={styles.noImage}>
                <span>Нет фото</span>
            </div>
        );
    }

    const goToPrevious = (e: React.MouseEvent) => {
        e.stopPropagation();
        setCurrentIndex(prev => prev === 0 ? images.length - 1 : prev - 1);
    };

    const goToNext = (e: React.MouseEvent) => {
        e.stopPropagation();
        setCurrentIndex(prev => prev === images.length - 1 ? 0 : prev + 1);
    };

    const goToSlide = (index: number, e: React.MouseEvent) => {
        e.stopPropagation();
        setCurrentIndex(index);
    };

    return (
        <div className={styles.slider}>
            <div className={styles.imageContainer}>
                <img 
                    src={getImageUrl(images[currentIndex])}
                    alt={`${alt} - изображение ${currentIndex + 1}`}
                    className={styles.image}
                />
                
                {images.length > 1 && (
                    <>
                        <button 
                            className={`${styles.navButton} ${styles.prevButton}`}
                            onClick={goToPrevious}
                            aria-label="Предыдущее изображение"
                        >
                            <RiArrowLeftSLine size={20} />
                        </button>
                        
                        <button 
                            className={`${styles.navButton} ${styles.nextButton}`}
                            onClick={goToNext}
                            aria-label="Следующее изображение"
                        >
                            <RiArrowRightSLine size={20} />
                        </button>
                    </>
                )}
            </div>

            {images.length > 1 && (
                <div className={styles.indicators}>
                    {images.map((_, index) => (
                        <button
                            key={index}
                            className={`${styles.indicator} ${index === currentIndex ? styles.active : ''}`}
                            onClick={(e) => goToSlide(index, e)}
                            aria-label={`Перейти к изображению ${index + 1}`}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

export default ImageSlider; 