import { useContext } from 'react';
import Alert from 'rct-bs-alert';
export const useToast = () => {
    const [rctAlert] = useContext(Alert);
    const DEFAULT_TIME = 3000;
    const display = ({ variant = "primary", message = "", time = DEFAULT_TIME }) => rctAlert({ variant, message, time })
    const success = ({ message, time = DEFAULT_TIME }) => display({ variant: "primary", message, time });
    const word_break_success = ({ message, time = DEFAULT_TIME }) => display({ variant: "wordbreakprimary", message, time });
    const error = ({ message, time = DEFAULT_TIME }) => display({ variant: "danger", message, time });
    const warning = ({ message, time = DEFAULT_TIME }) => display({ variant: "warning", message, time });
    return { display, success, error, warning, word_break_success }
}
export default useToast;