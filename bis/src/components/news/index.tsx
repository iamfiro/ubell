import s from './style.module.scss';
import { useEffect, useState, useRef } from 'react';

const NEWS_ITEMS = [
    "트럼프 숙청·혁명 같은 한국 상황... 우린 사업 못 한다",
    "알바생·배달라이더까지 본사와 교섭할 판...원·하청 연계 많은 유통업, 줄파업 우려",
    "특검 박성재, 계엄 때 심우정한테 합수부에 검사 파견 지시 영장 적시"
];

const WAIT_DURATION = 3000; // 3초 대기
const ANIMATION_DURATION = 12000; // 12초 동안 슬라이드

export default function News() {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isAnimating, setIsAnimating] = useState(false);
    const [direction, setDirection] = useState<'enter' | 'exit'>('enter');
    const textRef = useRef<HTMLParagraphElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const animationTimer = useRef<NodeJS.Timeout | null>(null);

    const startNextSlide = () => {
        setDirection('exit');
        setTimeout(() => {
            setCurrentIndex((prevIndex) => (prevIndex + 1) % NEWS_ITEMS.length);
            setDirection('enter');
        }, 500);
    };

    const checkOverflow = () => {
        if (textRef.current && containerRef.current) {
            const isOverflowing = textRef.current.scrollWidth > containerRef.current.clientWidth;
            
            if (isOverflowing) {
                // 긴 텍스트의 경우 애니메이션 시작
                setIsAnimating(true);
                
                // 애니메이션이 끝나고 3초 후에 다음 슬라이드로
                if (animationTimer.current) {
                    clearTimeout(animationTimer.current);
                }
                animationTimer.current = setTimeout(() => {
                    startNextSlide();
                }, ANIMATION_DURATION + WAIT_DURATION);
            } else {
                // 짧은 텍스트의 경우 5초 후에 다음 슬라이드로
                setIsAnimating(false);
                if (animationTimer.current) {
                    clearTimeout(animationTimer.current);
                }
                animationTimer.current = setTimeout(() => {
                    startNextSlide();
                }, 5000);
            }
        }
    };

    useEffect(() => {
        checkOverflow();
        window.addEventListener('resize', checkOverflow);

        return () => {
            window.removeEventListener('resize', checkOverflow);
            if (animationTimer.current) {
                clearTimeout(animationTimer.current);
            }
        };
    }, [currentIndex]);

    useEffect(() => {
        const timer = setTimeout(checkOverflow, 100);
        return () => clearTimeout(timer);
    }, [direction]);

    return (
        <article className={s.news} ref={containerRef}>
            <div className={`${s.newsContainer} ${s[direction]}`}>
                <p 
                    ref={textRef}
                    className={`${s.newsText} ${isAnimating ? s.animate : ''}`}
                    key={currentIndex}
                >
                    {NEWS_ITEMS[currentIndex]}
                </p>
            </div>
        </article>
    );
}