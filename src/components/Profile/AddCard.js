import React from 'react';

const AddCard = ({open, setOpen}) => {
    return <div className="cd-signin-modal js-signin-modal">
        {/* <!-- this is the entire modal form, including the background --> */}
        <div className="cd-signin-modal__container card-popup">
            {/* <!-- this is the container wrapper --> */}
            <div className="cd-signin-modal__switcher js-signin-modal-switcher js-signin-modal-trigger"></div>
            <div className="row">
                <div className="col-lg-12 card-popup-box">
                    <div className="js-signin-modal-block" data-type="addcard">
                        {/* <!-- log in form --> */}
                        <div className="add-card-head">
                            <h2>Add a new card</h2>
                        </div>
                        <div className="add-card-body">
                            <h3>Add Card</h3>
                            <p>Position your card in the frame.</p>
                        </div>
                        <div className="add-card-scan"></div>
                        <div className="add-card-detail">
                            <p>Or Enter Manually Below</p>
                            <form role="form" action="" method="post" id="">
                                <div className="controls">
                                    <div className="row">
                                        <div className="col-lg-12">
                                            <div className="form-group">
                                                <label>Card Number</label>
                                                <input type="text" required="required" placeholder="Card Number"
                                                    className="form-control" name="Card-Number" id="Card-Number" />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="row">
                                        <div className="col-lg-12">
                                            <div className="form-group">
                                                <label>Name as on card</label>
                                                <input type="text" required="required" placeholder="Name as on card"
                                                    className="form-control" name="card_name" id="card_name" />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="row">
                                        <div className="col-lg-6">
                                            <div className="form-group">
                                                <label>Expiry</label>
                                                <div className="card-dateArea card-datediv">
                                                    <span className="card-date card-datediv">
                                                        <select>
                                                            <option>1</option>
                                                            <option>2</option>
                                                            <option>3</option>
                                                        </select>
                                                    </span>
                                                    <span className="card-date card-datediv">
                                                        <select>
                                                            <option>1</option>
                                                            <option>2</option>
                                                            <option>3</option>
                                                        </select>
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="col-lg-6">
                                            <div className="form-group">
                                                <label>Security code</label>
                                                <input type="text" required="required" placeholder="Security code"
                                                    className="form-control" name="Security-code" id="Security-code" />
                                            </div>
                                        </div>
                                    </div>


                                    <div className="row">
                                        <div className="col-lg-12 text-right">
                                            <ul className="profile-btnList">
                                                {/* <!--<li><input type="submit" value="Cancel" className="submt-btn submt-btn-lignt"></li>--> */}
                                                <li><button type="button"
                                                    className="submt-btn submt-btn-dark">Update &amp; Save</button></li>
                                            </ul>
                                        </div>
                                    </div>


                                </div>
                            </form>
                        </div>

                    </div>
                    {/* <!-- cd-signin-modal__block --> */}

                </div>
            </div>
            <a className="cd-signin-modal__close js-close" onClick={() => setOpen(false)}>Close</a>
        </div>
        {/* <!-- cd-signin-modal__container --> */}
    </div>;
}

export default AddCard