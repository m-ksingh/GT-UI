const Modal = ({ 
    show = false, 
    setShow, 
    children, 
    hide, 
    className="", 
    hideCloseIcon = false,
    onClickCloseIcon = () => {} 
}) => {
    return (<>
        {show && <div class="cd-signin-modal js-signin-modal">
            <div class={`cd-signin-modal__container ${className}`}>
                {children}
                {!hideCloseIcon
                    && <div
                        class="cd-signin-modal__close js-close m-location-close pointer"
                        onClick={() => {
                            setShow(false);
                            onClickCloseIcon();
                        }}
                    >Close</div>}
            </div>
        </div>}
    </>)
}

export default Modal