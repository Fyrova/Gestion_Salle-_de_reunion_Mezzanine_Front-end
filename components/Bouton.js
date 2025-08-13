import React from 'react';
import styles from './Bouton.module.css';

const Bouton = ({ texte }) => {
    return (
        <button className={`${styles.bouton}`}>{texte}</button>
    );
}

export default Bouton;
