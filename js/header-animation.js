document.addEventListener('DOMContentLoaded', () => {
    const headers = document.querySelectorAll('.reactive-header');
    
    headers.forEach(header => {
        // Create document fragment for better performance
        const fragment = document.createDocumentFragment();
        const text = header.textContent;
        header.textContent = '';
        
        // Create spans in a fragment instead of directly in DOM
        [...text].forEach(letter => {
            const span = document.createElement('span');
            span.className = 'letter';
            span.textContent = letter;
            fragment.appendChild(span);
        });
        header.appendChild(fragment);
        
        const letters = Array.from(header.querySelectorAll('.letter'));
        let animationFrameId;
        let isHovering = false;
        
        // Debounced mousemove handler using requestAnimationFrame
        const updateLetters = (e) => {
            if (!isHovering) return;
            
            cancelAnimationFrame(animationFrameId);
            animationFrameId = requestAnimationFrame(() => {
                const maxDistance = 100;
                const maxDistanceSquared = maxDistance * maxDistance;
                
                letters.forEach(letter => {
                    const rect = letter.getBoundingClientRect();
                    const letterCenterX = rect.left + (rect.width / 2);
                    const letterCenterY = rect.top + (rect.height / 2);
                    
                    const deltaX = e.clientX - letterCenterX;
                    const deltaY = e.clientY - letterCenterY;
                    
                    // Use squared distance to avoid expensive sqrt operation
                    const distanceSquared = deltaX * deltaX + deltaY * deltaY;
                    
                    if (distanceSquared < maxDistanceSquared) {
                        // Calculate movement (closer = more movement)
                        const distance = Math.sqrt(distanceSquared);
                        const factor = (maxDistance - distance) / maxDistance;
                        const moveX = (deltaX / distance) * -15 * factor;
                        const moveY = (deltaY / distance) * -15 * factor;
                        
                        letter.style.transform = `translate(${moveX}px, ${moveY}px)`;
                    } else {
                        letter.style.transform = 'translate(0, 0)';
                    }
                });
            });
        };
        
        header.addEventListener('mouseenter', () => {
            isHovering = true;
        });
        
        header.addEventListener('mousemove', updateLetters);
        
        header.addEventListener('mouseleave', () => {
            isHovering = false;
            cancelAnimationFrame(animationFrameId);
            letters.forEach(letter => {
                letter.style.transform = 'translate(0, 0)';
            });
        });
    });
});