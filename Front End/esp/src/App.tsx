import { Redirect, Route, Switch } from 'react-router-dom';
import {
  IonApp,
  IonIcon,
  IonLabel,
  IonRouterOutlet,
  IonTabBar,
  IonTabButton,
  IonTabs,
  setupIonicReact
} from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';
import { ellipse, square, triangle } from 'ionicons/icons';
import UserManual from './pages/UserManual';
import SetupDeviceManual from './pages/SetupDeviceManual';
import Home from './pages/Home';
import AssignButton from './pages/AssignButton';

/* Core CSS required for Ionic components to work properly */
import '@ionic/react/css/core.css';

/* Basic CSS for apps built with Ionic */
import '@ionic/react/css/normalize.css';
import '@ionic/react/css/structure.css';
import '@ionic/react/css/typography.css';

/* Optional CSS utils that can be commented out */
import '@ionic/react/css/padding.css';
import '@ionic/react/css/float-elements.css';
import '@ionic/react/css/text-alignment.css';
import '@ionic/react/css/text-transformation.css';
import '@ionic/react/css/flex-utils.css';
import '@ionic/react/css/display.css';

/* Theme variables */
import './theme/variables.css';
import React from 'react';
import Chart from './components/Chart';


setupIonicReact();
const baseUrl = 'http://tax.com/api/';

const App: React.FC = () => (
  
  <React.Fragment>
  <IonApp>
    <IonReactRouter>
        <IonRouterOutlet>
          <Switch>
          <Route exact path="/" >
            <Home />
          </Route>
          <Route exact path="/tab1"  >
            <UserManual />
          </Route>
          <Route exact path="/tab2" >
            <SetupDeviceManual />
          </Route>
          <Route exact path="/AssignButton" >
            <AssignButton />
          </Route>
          <Route exact path="/chart" >
            <Chart />
          </Route>
          </Switch>
        </IonRouterOutlet>
    </IonReactRouter>
  </IonApp>
  </React.Fragment>
);

export default App;
