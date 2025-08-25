import { Cloud } from '@mui/icons-material';
import s from './style.module.scss';
import { useState, useEffect } from 'react';

export default function Header() {
    const [time, setTime] = useState(new Date());

    useEffect(() => {
        const interval = setInterval(() => {
            setTime(new Date());
        }, 1000);

        return () => clearInterval(interval);
    }, []);

    const hours = time.getHours().toString().padStart(2, '0');
    const minutes = time.getMinutes().toString().padStart(2, '0');
    const seconds = time.getSeconds().toString().padStart(2, '0');  
    return (
        <header className={s.header}>
            <div className={s.left}>
                <h1 className={s.title}>숙명여자대학교</h1>
                <p className={s.subtitle}>BIS 버스 정보 시스템</p>
            </div>
            <div className={s.center}>
                <div className={s.weatherContainer}>
                    <Cloud />
                    <p className={s.weather}>맑음</p>
                </div>
                <p className={s.temperature}>20°C</p>
            </div>
            <div className={s.right}>
                <p className={s.date}>2025년 08월 25일</p>
                <p className={s.time}>{hours}시 {minutes}분 {seconds}초</p>
            </div>
        </header>
    )
}