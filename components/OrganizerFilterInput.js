import React, { useEffect, useRef } from 'react';

export default function OrganizerFilterInput({ value, onChange }) {
  const inputRef = useRef(null);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, [value]);

  return (
    <input
      ref={inputRef}
      type="text"
      value={value}
      onChange={onChange}
      placeholder="Tapez le nom de l'organisateur"
      style={{ marginLeft: '0.5rem' }}
    />
  );
}
