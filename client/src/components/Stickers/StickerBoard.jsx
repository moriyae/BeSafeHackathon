import { useState, useEffect } from 'react';
import styles from './StickerBoard.module.css';

const STICKER_OPTIONS = [
  { id: 'lion', src: 'https://cdn-icons-png.flaticon.com/128/616/616408.png' },
  { id: 'star', src: 'https://cdn-icons-png.flaticon.com/128/616/616490.png' },
  { id: 'heart', src: 'https://cdn-icons-png.flaticon.com/128/2589/2589175.png' },
  { id: 'cool', src: 'https://cdn-icons-png.flaticon.com/128/742/742751.png' },
  { id: 'sun', src: 'https://cdn-icons-png.flaticon.com/128/869/869869.png' },
  { id: 'rocket', src: 'https://cdn-icons-png.flaticon.com/128/1356/1356479.png' },
  { id: 'cat', src: 'https://cdn-icons-png.flaticon.com/128/616/616430.png' },
  { id: 'rainbow', src: 'https://cdn-icons-png.flaticon.com/128/2530/2530939.png' },
  { id: 'flower', src: 'https://cdn-icons-png.flaticon.com/128/869/869869.png' },
  { id: 'pizza', src: 'https://cdn-icons-png.flaticon.com/128/1404/1404945.png' },
  { id: 'dog', src: 'https://cdn-icons-png.flaticon.com/128/616/616449.png' },
];

const createNewSticker = (src) => ({
    id: Date.now(),
    src: src,
    x: (window.innerWidth / 2) - 40, 
    y: window.scrollY + 200, 
});

const StickerBoard = () => {
  const [stickers, setStickers] = useState([]);
  const [draggingId, setDraggingId] = useState(null);
  const [offset, setOffset] = useState({ x: 0, y: 0 });

  const addSticker = (src) => {
    const newSticker = createNewSticker(src);
    setStickers([...stickers, newSticker]);
  };

  // 2. START DRAGGING (Mouse & Touch)
  const handleStartDragging = (e, id, currentX, currentY) => {
    // Only prevent default on mouse to stop the "ghost" image drag
    if (e.type === 'mousedown') e.preventDefault(); 
    
    setDraggingId(id);
    
    // Use coordinates based on event type
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;

    setOffset({
        x: clientX - currentX,
        y: (clientY + window.scrollY) - currentY
    });
  };

  // 3. MOVE STICKER (Global Events)
  useEffect(() => {
    const handleMove = (e) => {
        if (!draggingId) return;

        // You must calculate coordinates INSIDE the move handler
        const moveX = e.touches ? e.touches[0].clientX : e.clientX;
        const moveY = e.touches ? e.touches[0].clientY : e.clientY;

        const newX = moveX - offset.x;
        const newY = (moveY + window.scrollY) - offset.y;

        setStickers((prev) => prev.map((s) => 
            s.id === draggingId ? { ...s, x: newX, y: newY } : s
        ));
    };

    const handleEnd = () => {
        setDraggingId(null);
    };

    if (draggingId) {
        // Desktop listeners
        window.addEventListener('mousemove', handleMove);
        window.addEventListener('mouseup', handleEnd);
        // Mobile listeners
        window.addEventListener('touchmove', handleMove, { passive: false });
        window.addEventListener('touchend', handleEnd);
    }

    return () => {
        window.removeEventListener('mousemove', handleMove);
        window.removeEventListener('mouseup', handleEnd);
        window.removeEventListener('touchmove', handleMove);
        window.removeEventListener('touchend', handleEnd);
    };
  }, [draggingId, offset]);

  return (
    <>
      <div className={styles.boardLayer}>
        {stickers.map((sticker) => (
          <img
            key={sticker.id}
            src={sticker.src}
            alt="sticker"
            draggable="false" // Stops browser file-drag behavior
            className={styles.draggableSticker}
            style={{ 
                left: sticker.x, 
                top: sticker.y,
                cursor: draggingId === sticker.id ? 'grabbing' : 'grab',
                zIndex: draggingId === sticker.id ? 1000 : 1,
                position: 'absolute'
            }}
            onMouseDown={(e) => handleStartDragging(e, sticker.id, sticker.x, sticker.y)}
            onTouchStart={(e) => handleStartDragging(e, sticker.id, sticker.x, sticker.y)}
          />
        ))}
      </div>

      <div className={styles.stickerToolbar}>
        <div className={styles.scrollContainer}>
          {STICKER_OPTIONS.map((opt) => (
            <button 
              key={opt.id} 
              className={styles.stickerBtn} 
              onClick={() => addSticker(opt.src)}
            >
              <img src={opt.src} alt={opt.id} draggable="false" />
            </button>
          ))}
        </div>
      </div>
    </>
  );
};

export default StickerBoard;