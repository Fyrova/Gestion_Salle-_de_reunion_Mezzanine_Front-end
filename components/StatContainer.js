import React from 'react';
import dynamic from 'next/dynamic';
import styles from './StatContainer.module.css';
import { Montserrat } from 'next/font/google';

const mona = Montserrat({
  subsets: ['latin'],
});

const StatContainer = dynamic(() => import('./StatContainer'), { ssr: false });

const Container = ({ stats, titre }) => {
    return (
        <div className={`${styles.container} ${mona.className}`}>
            <h2 className="styles.title">{titre}</h2>
            <div className="styles.valeur">
                <h2 style={{ fontSize: '30px' }}>{stats}</h2>
            </div>
        </div>
    );
    
}

export default Container;