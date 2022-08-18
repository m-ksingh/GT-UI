import React from 'react';
import NonAppLayout from '../components/NonAppLayout';
import ResetPassword from '../components/Shared/ResetPassword';

const ResetPasswordScreen = () => {
    return (
        <NonAppLayout title="Reset Password" description="This is the reset password page" >
            <div >
                <ResetPassword />
            </div>
        </NonAppLayout>
    );
}

export default ResetPasswordScreen;