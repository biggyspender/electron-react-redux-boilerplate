import { createStore, applyMiddleware, compose } from 'redux';
import { routerMiddleware, push } from 'connected-react-router';
//import createLogger from 'redux-logger';
import persistState, { mergePersistedState } from 'redux-localstorage';
import createSagaMiddleware from 'redux-saga'

import thunk from 'redux-thunk';
import promise from 'redux-promise';
import reduxLocalStorageAdapter from "../main/reduxLocalStorageAdapter"
import {
  forwardToMain,
  forwardToRenderer,
  triggerAlias,
  replayActionMain,
  replayActionRenderer,
} from 'electron-redux';
import userActions from './actions/user';
import stateInitialization from './actions/stateInitialization';
import { getRootReducer } from './reducers';
import initChildWindowsSaga from "../main/initChildWindowsSaga"

export default function configureStore(scope = 'main', routerHistory = undefined) {
  // const logger = createLogger({
  //   level: scope === 'main' ? undefined : 'info',
  //   collapsed: true,
  // });
  if (scope === 'renderer' && !routerHistory) {
    throw Error("should have router history")
  }
  const router = routerHistory && routerMiddleware(routerHistory);

  const actionCreators = {
    ...userActions,
    ...stateInitialization,
    push,
  };



  let middlewares = [thunk, promise];

  const composeEnhancers = (() => {
    // eslint-disable-next-line no-undef
    const compose_ = scope === 'renderer' && window && window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__;
    if (process.env.NODE_ENV === 'development' && compose_) {
      return compose_({ actionCreators });
    }
    return compose;
  })();
  const loggingMiddleware = () => next => action => {
    console.log("main action : ", action)
    next(action);
  };
  if (scope === 'renderer') {
    middlewares = [
      loggingMiddleware,
      forwardToMain,
      router,
      ...middlewares,
    ];
  }
  let sagaMiddleware
  if (scope === 'main') {
    sagaMiddleware = createSagaMiddleware()

    middlewares = [
      loggingMiddleware,
      triggerAlias,
      sagaMiddleware,
      ...middlewares,
      forwardToRenderer,
    ];

  }

  const enhanced = applyMiddleware(...middlewares);
  const enhancer = (scope === 'renderer') ? enhanced : composeEnhancers(enhanced, persistState(reduxLocalStorageAdapter))



  const rootReducer = compose(mergePersistedState())(getRootReducer(routerHistory, scope));



  const store = createStore(rootReducer, rootReducer(void 0, {}), enhancer);
  if (scope === 'main') {
    sagaMiddleware.run(initChildWindowsSaga)
    replayActionMain(store);
  } else {
    replayActionRenderer(store);
  }
  return store;
}
