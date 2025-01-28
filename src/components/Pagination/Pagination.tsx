import React from 'react';
import { observer } from 'mobx-react-lite';
import styles from './Pagination.module.scss';

interface PaginationProps {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
}

const Pagination: React.FC<PaginationProps> = observer(({ currentPage, totalPages, onPageChange }) => {
    const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

    return (
        <div className={styles.pagination}>
            <button 
                disabled={currentPage === 1}
                onClick={() => onPageChange(currentPage - 1)}
                className={styles.arrow}
            >
                ←
            </button>
            
            {pages.map(page => (
                <button
                    key={page}
                    onClick={() => onPageChange(page)}
                    className={`${styles.page} ${currentPage === page ? styles.active : ''}`}
                >
                    {page}
                </button>
            ))}
            
            <button 
                disabled={currentPage === totalPages}
                onClick={() => onPageChange(currentPage + 1)}
                className={styles.arrow}
            >
                →
            </button>
        </div>
    );
});

export default Pagination; 