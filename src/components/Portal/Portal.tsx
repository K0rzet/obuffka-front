import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

interface PortalProps {
    children: React.ReactNode;
}

const Portal: React.FC<PortalProps> = ({ children }) => {
    const [container, setContainer] = useState<HTMLElement | null>(null);

    useEffect(() => {
        const portalContainer = document.createElement('div');
        portalContainer.style.position = 'fixed';
        portalContainer.style.top = '0';
        portalContainer.style.left = '0';
        portalContainer.style.width = '100%';
        portalContainer.style.height = '100%';
        portalContainer.style.zIndex = '10000';
        portalContainer.style.pointerEvents = 'auto';
        
        document.body.appendChild(portalContainer);
        setContainer(portalContainer);

        return () => {
            if (portalContainer && document.body.contains(portalContainer)) {
                document.body.removeChild(portalContainer);
            }
        };
    }, []);

    if (!container) return null;

    return createPortal(children, container);
};

export default Portal;
