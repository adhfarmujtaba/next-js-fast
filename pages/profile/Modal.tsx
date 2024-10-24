import React, { useEffect } from 'react';
import styles from './Modal.module.css';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children }) => {
  useEffect(() => {
    const profileContainer = document.getElementById("main");
    const htmlElement = document.documentElement;

    
    if (isOpen) {
      // Disable scroll on the main profile container and the entire HTML document
      profileContainer && (profileContainer.style.overflow = 'hidden');
    } else {
      profileContainer && (profileContainer.style.overflow = 'unset');
      htmlElement.style.overflow = 'unset';
    }

    return () => {
      // Cleanup: Reset scroll settings when the component is unmounted
      profileContainer && (profileContainer.style.overflow = 'unset');
      htmlElement.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <h2 className={styles.modalTitle}>{title}</h2>
        <div className={styles.modelListDiv}>
          {children}
        </div>
        <button className={styles.closeButton} onClick={onClose}>Close</button>
      </div>
    </div>
  );
};

export default Modal;
