import React, { useEffect, useRef } from 'react';
import { Montserrat } from 'next/font/google';

const mona = Montserrat({
  subsets: ['latin'],
});

export default function OrganizerFilterInput({ value, onChange }) {
  const inputRef = useRef(null);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, [value]);

  return (
    <input className={mona.className}
      ref={inputRef}
      type="text"
      value={value}
      onChange={onChange}
      placeholder="Tapez le nom de l'organisateur"
      style={{ marginLeft: '0.5rem' }}
    />
  );
}
