
import {
  BrowserRouter as Router,
  Switch,
  Route,
  useRouteMatch
} from "react-router-dom";
import './platform.css'
import PlatFormHeader from './PlatFormHeader/PlatFormHeader'
import Globals from './Globals/Globals';
import Disputes from './Disputes/Disputes';
import Request from './Request/Request';
import { useHistory } from 'react-router-dom';
import { useAuthState } from "../../contexts/AuthContext";
import { useEffect } from "react";

const PlatFormDashboard = () => {
  let { url } = useRouteMatch();
  const userDetails = useAuthState();
  const history = useHistory();

  useEffect(() => {
    if (!userDetails?.user?.sid) {
      history.push('/');
    }
  }, [])

  return (<div className="">
    <PlatFormHeader />
    <div className="platform-con">
      <Switch>
        <Route exact path={`${url}/request`} component={Request} />
        <Route path={`${url}/dispute`} component={Disputes} />
        <Route path={`${url}/global`} component={Globals} />
      </Switch>
    </div>
  </div>)
}

export default PlatFormDashboard