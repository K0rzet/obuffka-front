import React, { useRef, useState } from 'react';
import { IoMdCloudUpload } from 'react-icons/io';
import { IoClose } from 'react-icons/io5';
import styles from './ImageUploader.module.scss';

interface ImageUploaderProps {
    onChange: (files: File[]) => void;
    maxFiles?: number;
    theme?: 'light' | 'dark';
}

const ImageUploader: React.FC<ImageUploaderProps> = ({
    onChange,
    maxFiles = 10,
    theme = 'light'
}) => {
    const [files, setFiles] = useState<File[]>([]);
    const [previews, setPreviews] = useState<string[]>([]);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newFiles = Array.from(e.target.files || []);
        const totalFiles = files.length + newFiles.length;
        
        if (totalFiles > maxFiles) {
            alert(`Максимальное количество файлов: ${maxFiles}. Выбрано: ${totalFiles}`);
            return;
        }

        const newPreviews = newFiles.map(file => URL.createObjectURL(file));
        const updatedFiles = [...files, ...newFiles];
        const updatedPreviews = [...previews, ...newPreviews];

        setFiles(updatedFiles);
        setPreviews(updatedPreviews);
        onChange(updatedFiles);

        // Очищаем input для возможности повторного выбора тех же файлов
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleRemoveImage = (index: number) => {
        // Освобождаем URL объект
        URL.revokeObjectURL(previews[index]);
        
        // Удаляем файл и превью по индексу
        const newFiles = files.filter((_, i) => i !== index);
        const newPreviews = previews.filter((_, i) => i !== index);
        
        setFiles(newFiles);
        setPreviews(newPreviews);
        onChange(newFiles);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        const droppedFiles = Array.from(e.dataTransfer.files).filter(file => 
            file.type.startsWith('image/')
        );
        
        if (droppedFiles.length > 0) {
            const totalFiles = files.length + droppedFiles.length;
            
            if (totalFiles > maxFiles) {
                alert(`Максимальное количество файлов: ${maxFiles}. Попытка добавить: ${totalFiles}`);
                return;
            }

            const newPreviews = droppedFiles.map(file => URL.createObjectURL(file));
            const updatedFiles = [...files, ...droppedFiles];
            const updatedPreviews = [...previews, ...newPreviews];

            setFiles(updatedFiles);
            setPreviews(updatedPreviews);
            onChange(updatedFiles);
        }
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
    };

    return (
        <div className={`${styles.container} ${styles[theme]}`}>
            <div
                className={`${styles.uploadArea} ${styles[theme]} ${previews.length === 0 ? styles.isEmpty : ''}`}
                onClick={() => fileInputRef.current?.click()}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
            >
                {previews.length === 0 && (
                    <div className={styles.uploadContent}>
                        <IoMdCloudUpload size={48} />
                        <span>Нажмите для загрузки изображений</span>
                        <small>или перетащите файлы сюда (макс. {maxFiles})</small>
                    </div>
                )}

                <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleFileChange}
                    className={styles.hiddenInput}
                />
            </div>

            {previews.length > 0 && (
                <div className={styles.previewGrid}>
                    <div className={styles.previewHeader}>
                        <span>Выбрано файлов: {files.length}/{maxFiles}</span>
                        <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className={styles.addMoreButton}
                            disabled={files.length >= maxFiles}
                        >
                            Добавить еще
                        </button>
                    </div>
                    {previews.map((preview, index) => (
                        <div key={`${preview}-${index}`} className={styles.previewContainer}>
                            <img
                                src={preview}
                                alt={`Preview ${index + 1}`}
                                className={styles.previewImage}
                            />
                            <button
                                type="button"
                                onClick={() => handleRemoveImage(index)}
                                className={styles.removeButton}
                            >
                                <IoClose />
                            </button>
                            <div className={styles.fileInfo}>
                                <small>{files[index]?.name}</small>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default ImageUploader; 