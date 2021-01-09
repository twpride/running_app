/**
 * @format
 */

import {AppRegistry} from 'react-native';
import App from './js/App';
// import Tracker from './js/Tracker';
import {name as appName} from './app.json';

AppRegistry.registerComponent(appName, () => App);
// AppRegistry.registerComponent(appName, () => Tracker);

AppRegistry.registerHeadlessTask('TrackerTask', () =>
  require('./js/util/trackerService')
);