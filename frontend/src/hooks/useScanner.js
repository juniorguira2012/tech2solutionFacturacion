import { useEffect } from 'react';

export const useScanner = (onScan, inputRef) => {
  useEffect(() => {
    let buffer = "";
    let lastKeyTime = Date.now();

    const handleKeyDown = (e) => {
      const currentTime = Date.now();
      
      // Los lectores de barras escriben muy rápido (menos de 30ms entre teclas)
      // Si pasa más tiempo, es un humano escribiendo
      if (currentTime - lastKeyTime > 50) {
        buffer = "";
      }

      lastKeyTime = currentTime;

      // Si es la tecla Enter, el escáner terminó de leer
      if (e.key === 'Enter') {
        if (buffer.length > 2) {
          onScan(buffer);
          buffer = "";
        }
      } else {
        // Vamos guardando los caracteres (evitamos teclas de control como Shift)
        if (e.key.length === 1) {
          buffer += e.key;
        }
      }

      // Si el usuario hace clic en otro lado, devolvemos el foco al input
      // después de una breve pausa para no interrumpir otras acciones
      if (document.activeElement.tagName !== 'INPUT' && inputRef.current) {
        inputRef.current.focus();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onScan, inputRef]);
};