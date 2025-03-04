import { createContext, useRef, useState, useEffect } from "react";
import { songsData } from '../../assets/assets';

export const PlayerContext = createContext();

const PlayerContextProvider = (props) => {
    const audioRef = useRef();
    const seekBg = useRef();
    const seekBar = useRef();

    const [track, setTrack] = useState(songsData[0]);
    const [playStatus, setPlayStatus] = useState(false);
    const [time, setTime] = useState({
        currentTime: {
            second: 0,
            minute: 0
        },
        totalTime: {
            second: 0,
            minute: 0
        }
    });

    const play = () => {
        audioRef.current.play().catch(error => console.error("Error playing audio:", error));
        setPlayStatus(true);
        console.log("Playing");
    };

    const pause = () => {
        audioRef.current.pause();
        setPlayStatus(false);
        console.log("Paused");
    };

    const playWithId = async (id) => {
        try {
            await setTrack(songsData[id]);
            await audioRef.current.play();
            setPlayStatus(true);
        } catch (error) {
            console.error("Error playing track with ID:", id, error);
        }
    };

    const previous = async () => {
        if (track.id > 0) {
            try {
                await setTrack(songsData[track.id - 1]);
                await audioRef.current.play();
                setPlayStatus(true);
                console.log("Playing previous track:", songsData[track.id - 1]);
            } catch (error) {
                console.error("Error playing previous track:", error);
            }
        }
    };

    const seekSong = (e) => {
        if (seekBg.current && audioRef.current) {
            const seekBgWidth = seekBg.current.offsetWidth;
            const clickPositionX = e.nativeEvent.offsetX;
            const duration = audioRef.current.duration;

            const newTime = (clickPositionX / seekBgWidth) * duration;
            audioRef.current.currentTime = newTime;

            console.log(`SeekBar Width: ${seekBgWidth}, Click Position: ${clickPositionX}, New Time: ${newTime}`);
        } else {
            console.error("seekBg or audioRef is not defined");
        }
    };

    const next = async () => {
        if (track.id < songsData.length - 1) {
            try {
                await setTrack(songsData[track.id + 1]);
                await audioRef.current.play();
                setPlayStatus(true);
                console.log("Playing next track:", songsData[track.id + 1]);
            } catch (error) {
                console.error("Error playing next track:", error);
            }
        }
    };

    useEffect(() => {
        const updateTime = () => {
            seekBar.current.style.width = (Math.floor(audioRef.current.currentTime / audioRef.current.duration * 100)) + "%";
            setTime({
                currentTime: {
                    second: Math.floor(audioRef.current.currentTime % 60),
                    minute: Math.floor(audioRef.current.currentTime / 60)
                },
                totalTime: {
                    second: Math.floor(audioRef.current.duration % 60),
                    minute: Math.floor(audioRef.current.duration / 60)
                }
            });
        };

        const debouncedUpdateTime = debounce(updateTime, 100);

        audioRef.current.ontimeupdate = debouncedUpdateTime;

        return () => {
            audioRef.current.ontimeupdate = null;
        };
    }, [audioRef]);

    const contextValue = {
        audioRef,
        seekBar,
        seekBg,
        track, setTrack,
        playStatus, setPlayStatus,
        time, setTime,
        play, pause,
        playWithId,
        previous, next,
        seekSong
    };

    return (
        <PlayerContext.Provider value={contextValue}>
            {props.children}
        </PlayerContext.Provider>
    );
};

export default PlayerContextProvider;

function debounce(func, wait) {
    let timeout;
    return function (...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(this, args), wait);
    };
}
