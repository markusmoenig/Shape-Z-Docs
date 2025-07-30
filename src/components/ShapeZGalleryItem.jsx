import React, { useState } from 'react';
import ShpzPlayground from './ShpzPlayground';

export default function ShapeZGalleryItem({ image, src, caption }) {
    const [open, setOpen] = useState(false);

    return (
        <div style={{ marginBottom: 48 }}>
            <img
                src={image}
                onClick={() => setOpen(!open)}
                alt={caption}
                style={{
                    width: '100%',
                    maxWidth: 800,
                    cursor: 'pointer',
                    borderRadius: 6,
                    border: '1px solid #ccc',
                    display: 'block',
                    marginBottom: 8
                }}
            />
            {caption && <div style={{ fontSize: 14, marginBottom: 12 }}>{caption}</div>}
            {open && <ShpzPlayground src={src} height={500} caption={caption} />}
        </div>
    );
}