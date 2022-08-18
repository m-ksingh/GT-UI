import React, {useState} from "react"; 
import { Modal, Button } from 'react-bootstrap'; 
  
function Login() { 
  const [show, setShow] = useState(false); 
  
  const handleClose = () => setShow(false); 
  const handleShow = () => setShow(true); 
  
  return ( 
    <> 
        <div class="navbar-right">
            <a onClick={handleShow} id="cart"> Cart</a>
            <span class="dropdown top-box3 ml-2 header-btn cd-main-nav__list js-signin-modal-trigger desktop-btn">
                <span><a class="header-btn-light" onClick={handleShow} data-signin="login">Login</a></span>
            </span>
        </div>
  
      <Modal 
        show={show} 
        onHide={handleClose} 
        backdrop="static"
        keyboard={false} 
      > 
        <Modal.Header closeButton> 
          <Modal.Title>Modal title</Modal.Title> 
        </Modal.Header> 
        <Modal.Body> 
            <div class="row">
                    <div class="col-lg-5 desktop-login-head">
                        <div class="login-left-area">
                            <h2>Login</h2>
                            <p>Login to manage your Wishlist, Orders, Bids, Trades, Listings, Schedules & more.</p>
                            <p class="text-center"><img src="images/login-comp.png" class="img-fluid" /></p>
                        </div>
                    </div>
                    <div class="col-lg-7 login-right-area">
                        <div class="cd-signin-modal__block js-signin-modal-block" data-type="login">
                            <h2>Welcome</h2>
                            <p class="log-cap">Please login or sign up to continue..</p>
                            <ul class="loginSocial">
                                <li class="loginT"></li>
                                <li class="loginF"></li>
                            </ul>
                            <form class="cd-signin-modal__form">
                                <p class="cd-signin-modal__fieldset">
                                    <span>Email</span>
                                    <label class="cd-signin-modal__label cd-signin-modal__label--email cd-signin-modal__label--image-replace" htmlFor="signin-email">E-mail</label>
                                    <input class="cd-signin-modal__input cd-signin-modal__input--full-width cd-signin-modal__input--has-padding cd-signin-modal__input--has-border" id="signin-email" type="email" placeholder="E-mail" />
                                    <span class="cd-signin-modal__error">Error message here!</span>
                                </p>
                                <p class="cd-signin-modal__fieldset">
                                    <span>Password</span>
                                    <label class="cd-signin-modal__label cd-signin-modal__label--password cd-signin-modal__label--image-replace" htmlFor="signin-password">Password</label>
                                    <input class="cd-signin-modal__input cd-signin-modal__input--full-width cd-signin-modal__input--has-padding cd-signin-modal__input--has-border" id="signin-password" type="text" placeholder="Password" />
                                    <a class="cd-signin-modal__hide-password js-hide-password">Hide</a>
                                    <span class="cd-signin-modal__error">Error message here!</span>
                                </p>
                                <p class="cd-signin-modal__fieldset">
                                    <input type="checkbox" id="remember-me" class="cd-signin-modal__input" />
                                    <label htmlFor="remember-me">Remember me</label>
                                </p>
                                <p class="cd-signin-modal__bottom-message js-signin-modal-trigger f-passArea"><a data-signin="reset">Forgot your password?</a></p>
                                <p class="cd-signin-modal__fieldset">
                                    <input class="cd-signin-modal__input cd-signin-modal__input--full-width" type="submit" value="Login" />
                                </p>
                            </form>
                            <p class="cd-signin-modal__bottom-message js-signin-modal-trigger">Don’t have an account? <a data-signin="signup" data-type="signup">Sign Up</a></p>
                        </div>
                        <div class="cd-signin-modal__block js-signin-modal-block" data-type="signup">
                            <h2>Sign Up</h2>
                            <p class="log-cap">Please register with your email and sign up to continue..</p>
                            <form class="cd-signin-modal__form">
                                <p class="cd-signin-modal__fieldset">
                                    <span>Name*</span>
                                    <label class="cd-signin-modal__label cd-signin-modal__label--username cd-signin-modal__label--image-replace" htmlFor="signup-username">Username</label>
                                    <input class="cd-signin-modal__input cd-signin-modal__input--full-width cd-signin-modal__input--has-padding cd-signin-modal__input--has-border" id="signup-username" type="text" placeholder="Username" />
                                    <span class="cd-signin-modal__error">Error message here!</span>
                                </p>
                                <p class="cd-signin-modal__fieldset">
                                    <span>Email*</span>
                                    <label class="cd-signin-modal__label cd-signin-modal__label--email cd-signin-modal__label--image-replace" htmlFor="signup-email">E-mail</label>
                                    <input class="cd-signin-modal__input cd-signin-modal__input--full-width cd-signin-modal__input--has-padding cd-signin-modal__input--has-border" id="signup-email" type="email" placeholder="E-mail" />
                                    <span class="cd-signin-modal__error">Error message here!</span>
                                </p>
                                <p class="cd-signin-modal__fieldset">
                                    <span>Password*</span>
                                    <label class="cd-signin-modal__label cd-signin-modal__label--password cd-signin-modal__label--image-replace" htmlFor="signup-password">Password</label>
                                    <input class="cd-signin-modal__input cd-signin-modal__input--full-width cd-signin-modal__input--has-padding cd-signin-modal__input--has-border" id="signup-password" type="text" placeholder="Password" />
                                    <a class="cd-signin-modal__hide-password js-hide-password">Hide </a>
                                    <span class="cd-signin-modal__error">Error message here!</span>
                                </p>
                                <p class="cd-signin-modal__fieldset">
                                    <span>Confirm Password*</span>
                                    <label class="cd-signin-modal__label cd-signin-modal__label--password cd-signin-modal__label--image-replace" htmlFor="signup-password">Password</label>
                                    <input class="cd-signin-modal__input cd-signin-modal__input--full-width cd-signin-modal__input--has-padding cd-signin-modal__input--has-border" id="signup-password" type="text" placeholder="Password" />
                                    <a class="cd-signin-modal__hide-password js-hide-password">Hide </a>
                                    <span class="cd-signin-modal__error">Error message here!</span>
                                </p>
                                <p class="cd-signin-modal__fieldset">
                                    <input type="checkbox" id="accept-terms" class="cd-signin-modal__input " />
                                    <label htmlFor="accept-terms">I agree to the <a>Terms</a></label>
                                </p>
                                <p class="cd-signin-modal__fieldset">
                                    <input class="cd-signin-modal__input cd-signin-modal__input--full-width cd-signin-modal__input--has-padding" type="submit" value="Create account" />
                                </p>
                                <p class="cd-signin-modal__bottom-message js-signin-modal-trigger"><a data-signin="login">Back to log-in</a></p>
                            </form>
                        </div>
                        <div class="cd-signin-modal__block js-signin-modal-block" data-type="reset">
                            <h2>Lost your password?</h2>
                            <p class="log-cap cd-signin-modal__message">Please enter your email address. You will receive a link to create a new password.</p>
                            <form class="cd-signin-modal__form">
                                <p class="cd-signin-modal__fieldset">
                                    <span>Email</span>
                                    <label class="cd-signin-modal__label cd-signin-modal__label--email cd-signin-modal__label--image-replace" htmlFor="reset-email">E-mail</label>
                                    <input class="cd-signin-modal__input cd-signin-modal__input--full-width cd-signin-modal__input--has-padding cd-signin-modal__input--has-border" id="reset-email" type="email" placeholder="E-mail" />
                                    <span class="cd-signin-modal__error">Error message here!</span>
                                </p>
                                <p class="cd-signin-modal__fieldset">
                                    <input class="cd-signin-modal__input cd-signin-modal__input--full-width cd-signin-modal__input--has-padding" type="submit" value="Reset password" />
                                </p>
                            </form>
                            <p class="cd-signin-modal__bottom-message js-signin-modal-trigger"><a data-signin="login">Back to log-in</a></p>
                        </div>
                    </div>
                </div>
        </Modal.Body> 
        <Modal.Footer> 
          <Button variant="primary" onClick={handleClose}> 
            Close 
          </Button> 
            
        </Modal.Footer> 
      </Modal> 
    </> 
  ); 
} 
  
export default Login;