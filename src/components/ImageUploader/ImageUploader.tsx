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
    const [previews, setPreviews] = useState<string[]>([]);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        if (files.length > maxFiles) {
            alert(`Максимальное количество файлов: ${maxFiles}`);
            return;
        }

        const newPreviews = files.map(file => URL.createObjectURL(file));
        setPreviews(prev => {
            prev.forEach(URL.revokeObjectURL);
            return newPreviews;
        });

        onChange(files);
    };

    const handleRemoveImage = (index: number) => {
        setPreviews(prev => {
            URL.revokeObjectURL(prev[index]);
            const newPreviews = [...prev];
            newPreviews.splice(index, 1);
            return newPreviews;
        });

        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    return (
        <div className={`${styles.container} ${styles[theme]}`}>
            <div
                className={`${styles.uploadArea} ${styles[theme]} ${previews.length === 0 ? styles.isEmpty : ''}`}
                onClick={() => fileInputRef.current?.click()}
            >
                {previews.length === 0 && (
                    <div className={styles.uploadContent}>
                        <IoMdCloudUpload size={48} />
                        <span>Нажмите для загрузки изображений</span>
                        <small>или перетащите файлы сюда</small>
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
                    {previews.map((preview, index) => (
                        <div key={preview} className={styles.previewContainer}>
                            <img
                                src={preview}
                                alt={`Preview ${index + 1}`}
                                className={styles.previewImage}
                            />
                            <button
                                onClick={() => handleRemoveImage(index)}
                                className={styles.removeButton}
                            >
                                <IoClose />
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default ImageUploader; 