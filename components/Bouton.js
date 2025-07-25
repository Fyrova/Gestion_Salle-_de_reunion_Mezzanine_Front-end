import React from 'react';
import { Montserrat } from 'next/font/google';
import styles from './Bouton.module.css';

const mona = Montserrat({
  subsets: ['latin'],
});

const Bouton = ({ texte }) => {
    return (
        <button className={`${mona.className} ${styles.bouton}`}>{texte}</button>
    );
}

export default Bouton;