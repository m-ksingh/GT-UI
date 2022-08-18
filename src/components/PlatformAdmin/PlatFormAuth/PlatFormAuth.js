import { useState } from 'react'
import { Formik, ErrorMessage, Field } from 'formik'
import { InputGroup, Form } from 'react-bootstrap'
import { SubmitField } from '../../Shared/InputType'
import '../platform.css'

const PlatFormAuth = () => {

    const PasswordEye = ({ id }) => {
        const [eyeIcon, setEyeIcon] = useState('fa fa-eye-slash')
        const [mouseLeave, setMouseLeave] = useState(false)

        const showPassword = () => {
            const password = document.getElementById(id);
            if (password.type === 'password') {
                password.type = 'text'
                setEyeIcon('fa fa-eye')
                setMouseLeave(true)
            } else {
                setMouseLeave(false)
                password.type = 'password'
                setEyeIcon('fa fa-eye-slash')
            }
        }
        return <span onClick={() => showPassword()} className="text-muted show-password"><i onMouseLeave={() => mouseLeave && showPassword()} className={eyeIcon}></i></span>
    }

    return (<div className="platform-login-container">
        <div className="login-container">
            <div className="login-img"><img src="images/logo.svg" class="img-fluid" alt="Gun Traderz" /></div>
            <div className="text-center mt-2">Platform Admin</div>
            <Formik
                initialValues={{
                    email: '',
                    password: '',
                    rememberMe: false
                }}
                onSubmit={() => { }}>
                {({ handleSubmit, isSubmitting, handleChange, touched, errors, values, isValid, dirty, handleReset }) => (
                    <form onSubmit={handleSubmit}>
                        <Form.Group>
                            <Form.Label><span>Email</span></Form.Label>
                            <InputGroup>
                                <Field
                                    name="email"
                                    className="form-control "
                                    placeholder="Enter your email"
                                />
                            </InputGroup>
                            <ErrorMessage component="span" name="email" className="text-danger mb-2 small-text" />
                        </Form.Group>
                        <Form.Group>
                            <Form.Label><span>Password</span></Form.Label>
                            <InputGroup>
                                <Field
                                    name="password"
                                    className="form-control "
                                    placeholder="Enter your password"
                                    type="password"
                                    id="login-password"
                                />
                                <InputGroup.Append>
                                    <InputGroup.Text id="basic-addon2"> <PasswordEye id="login-password" /></InputGroup.Text>
                                </InputGroup.Append>
                            </InputGroup>
                            <ErrorMessage component="span" name="password" className="text-danger mb-2 small-text" />
                        </Form.Group>

                        <SubmitField label="Login" disabled={!isValid || !dirty} onClick={() => { }} />
                    </form>
                )}
            </Formik>

        </div>
    </div>)
}

export default PlatFormAuth