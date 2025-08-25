import AccessibleIcon from '@mui/icons-material/Accessible';
import s from './style.module.scss';

interface BusInfoProps {
    busNumber: string;
    disablePeople: boolean;
    time: number;
    station: number;
}

export default function BusInfo({ busNumber, disablePeople = false, time, station }: BusInfoProps) {
    return (
        <article className={s.busInfo}>
            <div className={s.left}>
                {disablePeople && <AccessibleIcon />}
                <p>{busNumber}</p>
            </div>
            <div className={s.center}>
                <p className={s.time}>{time}분</p>
                <p className={s.station}>{station}정거장 전</p>
            </div>
            <button className={s.button}>
                <p>버스<br/>호출</p>
            </button>
        </article>
    )
}