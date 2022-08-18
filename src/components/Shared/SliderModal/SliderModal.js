import React, { useEffect, useState } from 'react';
import './slider.css'

/* 
Props
    sliderStyle: set the style of the component
    direction: set direction (top,right,left,bottom)
    speed: set the speed to slider
    header: optional to set the slider header
*/
const Slider = ({
    className = "",
    children,
    sliderStyle,
    id = Math.random().toString(36).substring(7),
    direction = "right",
    speed = "faster",
    render,
    shadow = true,
    closeIcon,
    toggle = null,
    closeModal,
    size = 'medium',
    animation = "slide"
}) => {
    const [clName, setClName] = useState(null)
    const [toggleMain, setToggleMain] = useState(false)
    /* 
 set slider class show the slider class
 @prams: true or false
*/
    const sliderClass = (e) => {
        let dire = ''
        switch (direction) {
            case 'right':
                dire = e ? `${animation}InRight right-0 top-0` : `${animation}OutRight right-0 top-0`
                break;
            case 'top':
                dire = e ? `${animation}InDown top-0` : `${animation}OutUp top-0`
                break;
            case 'top-right':
                dire = e ? `${animation}InDown top-right` : `${animation}OutUp top-right`
                break;
            case 'left':
                dire = e ? `${animation}InLeft left-0 top-0` : `${animation}OutLeft left-0 top-0`
                break;
            case 'bottom':
                dire = e ? `${animation}InUp bottom-0` : `${animation}OutDown bottom-0`
                break;
            case 'bottom-right':
                dire = e ? `${animation}InUp bottom-right` : `${animation}OutDown bottom-right`
                break;
            default:
        }

        setClName((className + ` esc-slider-container animated ` + dire + ` ${speed}`))
    }
    useEffect(() => {
        sliderClass(toggleMain)
        if(toggleMain){
             document.getElementById(id).style.display = "block";
            }
    }, [toggleMain])


    useEffect(() => {
        document.getElementById(id).style.display = "none";
    }, [])

    useEffect(() => {
        setToggleMain(toggle)
    }, [toggle])

    const handleClick = () => {
        setToggleMain(false)
        closeModal && closeModal(false)
    }

    return (
        <>
            <div className="Slider-modal">
                <div onClick={() => handleClick()} id={id + 'new'} className={toggleMain ? (shadow ? "sliderContainer" : "noShadow") : "sliderOut"}> </div>
                <div id={id} style={sliderStyle && sliderStyle} className={clName + " " + size }>
                    {closeIcon && <div className="closeBtn" onClick={() => { closeIcon(false) }}><svg fill="#111" xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 10 10"><path className="a" d="M6.9,10.625,9.738,7.782a.894.894,0,0,0,0-1.264l-.632-.632a.894.894,0,0,0-1.264,0L5,8.73,2.157,5.887a.894.894,0,0,0-1.264,0l-.632.632a.894.894,0,0,0,0,1.264L3.1,10.625.262,13.468a.894.894,0,0,0,0,1.264l.632.632a.894.894,0,0,0,1.264,0L5,12.52l2.843,2.843a.894.894,0,0,0,1.264,0l.632-.632a.894.894,0,0,0,0-1.264Z" transform="translate(0 -5.625)"/></svg></div>}
                    {toggle && typeof (render) === 'function' ? render() : render}
                    {toggle && !render && typeof (children) === 'function' ? children() : children}
                </div>
            </div>
        </>
    )
}
export default Slider;
