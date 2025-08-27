import s from './style.module.scss';
import { useEffect, useState, useRef } from 'react';

const NEWS_ITEMS = [
    "김정은 덕에 친해진 이재명·트럼프… 유대감 형성 큰 성과 [美 전문가 평가]",
    "‘내란 방조’ 한덕수 전 총리, 오늘 구속 기로",
    "[미니 다큐]죽음의 '손배 폭탄' 막을 노란봉투법...20년 만에 국회 통과"
];

const WAIT_DURATION = 2000; // 2초 대기 (짧은 텍스트)
const ANIMATION_DURATION = 8000; // 8초 동안 마키 (긴 텍스트)
const ANIMATION_DELAY = 500; // 0.5초 지연

export default function News() {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isAnimating, setIsAnimating] = useState(false);
    const [direction, setDirection] = useState<'enter' | 'exit'>('enter');
    const textRef = useRef<HTMLParagraphElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const animationTimer = useRef<number | null>(null);

    const startNextSlide = () => {
        setDirection('exit');
        setTimeout(() => {
            setCurrentIndex((prevIndex) => (prevIndex + 1) % NEWS_ITEMS.length);
            setDirection('enter');
        }, 500);
    };

    const checkOverflow = () => {
        if (textRef.current && containerRef.current) {
            const textWidth = textRef.current.scrollWidth;
            const containerWidth = containerRef.current.clientWidth;
            const isOverflowing = textWidth > containerWidth;
            
            if (isOverflowing) {
                // CSS 변수로 정확한 이동 거리 설정
                const moveDistance = textWidth - containerWidth + 50; // 50px 여백
                textRef.current.style.setProperty('--move-distance', `-${moveDistance}px`);
                
                // 긴 텍스트의 경우 마키 애니메이션 시작
                setIsAnimating(true);
                
                // 애니메이션 시작 후 전체 시간 후에 다음 슬라이드로
                if (animationTimer.current) {
                    clearTimeout(animationTimer.current);
                }
                animationTimer.current = window.setTimeout(() => {
                    startNextSlide();
                }, ANIMATION_DELAY + ANIMATION_DURATION + WAIT_DURATION);
            } else {
                // 짧은 텍스트의 경우 정적 표시 후 다음 슬라이드로
                setIsAnimating(false);
                if (animationTimer.current) {
                    clearTimeout(animationTimer.current);
                }
                animationTimer.current = window.setTimeout(() => {
                    startNextSlide();
                }, WAIT_DURATION * 2); // 4초간 표시
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