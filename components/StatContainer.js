import React from 'react';
import styles from './StatContainer.module.css';
import { Montserrat } from 'next/font/google';

const mona = Montserrat({
  subsets: ['latin'],
});

const StatContainer = ({ stats, titre, colorClass }) => {
    return (
        <div className={`${styles.container} ${mona.className}`}>
            <h2 className={styles.title}>{titre}</h2>
            <div className={`${styles.valeur} ${colorClass ? styles[colorClass] : ''}`}>
                <h2>{stats}</h2>
            </div>
        </div>
    );
}

export default StatContainer;
