import { useEffect, useRef, useState } from 'react';

export function useScrollReveal({ threshold = 0.3, triggerOnce = true } = {}) {
    const ref = useRef(null);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const currentRef = ref.current;
        const observer = new IntersectionObserver(([entry]) => {
            if (entry.isIntersecting) {
                setIsVisible(true);
                if (triggerOnce && currentRef) {
                    observer.unobserve(currentRef);
                }
            } else if (!triggerOnce) {
                setIsVisible(false);
            }
        }, { threshold });

        if (currentRef) {
            observer.observe(currentRef);
        }

        return () => {
            if (currentRef) {
                observer.unobserve(currentRef);
            }
        };
    }, [threshold, triggerOnce]);

    return { ref, isVisible };
}
