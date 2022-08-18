import { useField, ErrorMessage} from 'formik';
import { Form } from 'react-bootstrap';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import  './InputType.css';
import { IcnCalender1, IcnClock, ICN_CLOSE_RED } from '../icons';


// login modal input field
export const TextField = ({ label, labelIcon = "", ...props }) => {
    const [field, meta, isInvalid, error] = useField(props);
    return (
        <> <p className="cd-signin-modal__fieldset">
            <span>{label}</span>
            {labelIcon === "user" && <label className="cd-signin-modal__label cd-signin-modal__label--username cd-signin-modal__label--image-replace" htmlFor="signup-username">Username</label>}
            {labelIcon === "password" && <label className="cd-signin-modal__label cd-signin-modal__label--password cd-signin-modal__label--image-replace" htmlFor="signin-password">Password</label>}
            {labelIcon === 'email' && <label className="cd-signin-modal__label cd-signin-modal__label--email cd-signin-modal__label--image-replace" htmlFor="signin-email">E-mail</label>}
            <input  {...field} {...props} className="cd-signin-modal__input cd-signin-modal__input--full-width cd-signin-modal__input--has-padding cd-signin-modal__input--has-border" />
            {labelIcon === 'password' && <a href="#0" className="cd-signin-modal__hide-password js-hide-password">Hide </a>}
            {meta.touched && meta.error ? (
                <span className="cd-signin-modal__error">{meta.error}</span>
            ) : null}
            {isInvalid && <span className="cd-signin-modal__error">{error}</span>}
        </p>
        </>
    );
};

// input field type submit
export const SubmitField = ({ onClick, label = "Submit", id = "", disabled = false, className = "" }) => {
    return (<p className="cd-signin-modal__fieldset">
        <input id={id} className={`cd-signin-modal__input cd-signin-modal__input--full-width ${disabled ? 'disabled' : ''} ${className}`} onClick={onClick} type="submit" value={label} />
    </p>)
}



// form input Field
export const SelectField = ({label, options=[], defaultOptions=""})=> {
     return(<div class="form-group">
     <h5 class="label-head">{label}<sup>*</sup></h5>
     <div class="formarrow">
         <select>
             <option>{defaultOptions}</option>
             {options.map(res=> <option>{res}</option>)}
         </select>
     </div>
 </div>)
 }

  // input type RadioBox
export const Checkbox = (props) => {
    const [field, meta, helpers] = useField(props);
    const { setValue } = helpers;
    const { value } = meta;
    return (<>
        <Form.Check
            custom
            label={props.label}
            id={props.id}
            inline
            checked={value}
            type="checkbox"
            onChange={(e) => setValue( e.target.value ? true : false)}
        />
        <ErrorMessage component="div" name={props.name} className="text-danger mb-2 small-text" />
    </>)
};

 // input type RadioBox
export const RadioBox = (props) => {
    const [field, meta, helpers] = useField(props);
    const { setValue } = helpers;
    const { value } = meta;
    return (<>
        { props.options.map((option, i) => <Form.Check
            key={i}
            custom
            label={option}
            id={option}
            inline
            checked={value === option ? true : false}
            type="radio"
            onChange={(e) => setValue(option)}
        />)}
        <ErrorMessage component="div" name={props.name} className="text-danger mb-2 small-text" />
    </>)
};

// input type RadioBox 
export const RadioBoxKey = (props) => {
    const [field, meta, helpers] = useField(props);
    const { setValue } = helpers;
    const { value } = meta;
    return (<>
        { props.options.map((option, i) => <Form.Check
            key={i}
            label={<div className="pt2">{option.label}</div>}
            id={option.label}
            inline
            disabled={option?.disabled}
            checked={value === option.value ? true : false}
            type="radio"
            onChange={(e) => {
                try {
                    setValue(option.value);
                    typeof props?.onChange === 'function' && props.onChange(option, i)
                } catch(err) {
                    console.error("Exception occurred in onChange -- ", err);
                }
            }}
        />)}
        <ErrorMessage component="div" name={props.name} className="text-danger mb-2 small-text" />
    </>)
};

// date input field
export const DateInput = (props) => {
    const [field, meta, helpers, isInvalid] = useField(props);
    const { setValue } = helpers;
    return (<>
        <div className="aic p-rel">
            <span>{props.label ? props.label : ""}</span>
            <DatePicker
                autoComplete={false}
                id={`date-picker${props.name}`}
                name={props.name}
                selected={meta.value}
                placeholderText={props.placeholder ? props.placeholder : "Select Date"}
                {...field}
                minDate={props.minDate}
                maxDate={props.maxDate}
                excludeDates={props.excludeDates}
                dateFormat={props.dateFormat ? props.dateFormat : "MM/dd/yyyy"}
                value={meta.value}
                onChange={e => {
                    setValue(e.getTime()); 
                    if(typeof props?.onChange === "function") props?.onChange(e);
                }}
                disabled={props.disabled || false}
                className="cd-signin-modal__input cd-signin-modal__input--full-width cd-signin-modal__input--has-padding cd-signin-modal__input--has-border date-input"
            />
            <div className="date-input-icn pointer" onClick={() => document.getElementById(`date-picker${props.name}`).click()}><IcnCalender1 /></div>
            {meta.touched && meta.error ? (
                <span className="cd-signin-modal__error">{meta.error}</span>
            ) : null}
            {isInvalid && <span className="cd-signin-modal__error">{meta.error}</span>}
        </div>
    </>)
}

// time input field
export const TimeInput = (props) => {
    const [field, meta, helpers] = useField(props);
    const { setValue } = helpers;
    return (<>
            <p className="cd-signin-modal__fieldset">
             <span>{props.label}</span>
                <DatePicker
                    name={props.name}
                    selected={meta.value}
                    placeholderText={props.placeholder ? props.placeholder : "Select Time"}
                    {...field}
                    dateFormat="hh:mm aa"
                    timeFormat="hh:mm aa"
                    showTimeSelect
                    showTimeSelectOnly
                    use12Hours={true}
                    timeCaption="Time"
                    value={meta.value}
                    onChange={e => setValue(e.getTime())}
                    className="cd-signin-modal__input cd-signin-modal__input--full-width cd-signin-modal__input--has-padding cd-signin-modal__input--has-border" 
                />
                {/* {ICN_CLOSE_RED} */}
                </p>
     
    </>)
}

// time input field
export const TimeBetween = (props) => {
    const [field, meta, helpers] = useField(props);
    const { setValue } = helpers;
    return (<>
            <div className="cd-signin-modal__fieldset aic">
             <span>{props.label}</span>
                <DatePicker
                    name={props.name}
                    selected={meta.value}
                    placeholderText={props.placeholder ? props.placeholder : "Select Time"}
                    {...field}
                    dateFormat="hh:mm aa"
                    timeFormat="hh:mm aa"
                    showTimeSelect
                    showTimeSelectOnly
                    use12Hours={true}
                    timeCaption="Time"
                    value={meta.value}
                    minTime={props.minTime}
                    maxTime={props.maxTime}
                    onChange={e => setValue(e.getTime())}
                    className="" 
                    excludeTimes={props.excludeTimes || []}
                />
                {props.showIcon && <IcnClock />}
                </div>
     
    </>)
}
