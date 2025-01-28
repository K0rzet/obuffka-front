import React, { useEffect, useState } from 'react';
import { observer } from 'mobx-react-lite';
import { shoesStore } from '../../store/ShoesStore';
import { authStore } from '../../store/AuthStore';
import ProductForm from '../../components/AdminPanel/ProductForm';
import { Shoe } from '../../types/shoe';
import styles from './AdminPage.module.scss';
import Pagination from '../../components/Pagination/Pagination';

const AdminPage: React.FC = observer(() => {
    const [editingShoe, setEditingShoe] = useState<Shoe | null>(null);
    const [isCreating, setIsCreating] = useState(false);

    useEffect(() => {
        shoesStore.fetchShoes();
    }, []);

    if (authStore.isLoading) {
        return <div>Загрузка...</div>;
    }

    if (authStore.error) {
        return <div className={styles.error}>{authStore.error}</div>;
    }

    if (!authStore.user) {
        return <div className={styles.error}>Необходима авторизация</div>;
    }

    if (!authStore.user.isAdmin) {
        return <div className={styles.error}>Доступ запрещен</div>;
    }

    return (
        <div className={styles.adminPage}>
            <div className={styles.header}>
                <h1>Управление товарами</h1>
                <button onClick={() => setIsCreating(true)}>Добавить товар</button>
            </div>

            {(isCreating || editingShoe) && (
                <ProductForm
                    shoe={editingShoe || undefined}
                    onSubmit={async (data) => {
                        try {
                            if (editingShoe) {
                                await shoesStore.updateShoe(editingShoe.id, data);
                            } else {
                                await shoesStore.createShoe(data);
                            }
                            setEditingShoe(null);
                            setIsCreating(false);
                        } catch (error) {
                            console.error('Ошибка:', error);
                        }
                    }}
                    onCancel={() => {
                        setEditingShoe(null);
                        setIsCreating(false);
                    }}
                />
            )}

            <div className={styles.productList}>
                {shoesStore.shoes.map(shoe => (
                    <div key={shoe.id} className={styles.productItem}>
                        <div className={styles.productInfo}>
                            <h3>{shoe.name}</h3>
                            <p>{shoe.price} ₽</p>
                        </div>
                        <div className={styles.actions}>
                            <button onClick={() => setEditingShoe(shoe)}>Редактировать</button>
                            <button onClick={() => shoesStore.deleteShoe(shoe.id)}>Удалить</button>
                        </div>
                    </div>
                ))}
            </div>
            <Pagination 
                currentPage={shoesStore.page}
                totalPages={shoesStore.totalPages}
                onPageChange={(page) => shoesStore.setPage(page)}
            />
        </div>
    );
});

export default AdminPage; 