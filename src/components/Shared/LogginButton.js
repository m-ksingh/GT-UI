import React from 'react';

const LogginButton = ({setLoginModel}) => {
    return <div>
    <div class="top-menu">
        <div class="top-box1">
            <nav>
                <div class="navbar-right">
                    {/* <a id="cart"> Cart</a> */}
                    <span class="">
                        <span>
                            <button class="login-btn" onClick={() => setLoginModel(true)}>
                                Login
                            </button>
                        </span>
                    </span>
                </div>
            </nav>
        </div>
    </div>
</div>;
}
 
export default LogginButton;