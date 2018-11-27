import { createStore, applyMiddleware, compose } from 'redux';
import { routerMiddleware, push } from 'connected-react-router';
//import createLogger from 'redux-logger';
import persistState from 'redux-localstorage';
import thunk from 'redux-thunk';
import promise from 'redux-promise';
import {
  forwardToMain,
  forwardToRenderer,
  triggerAlias,
  replayActionMain,
  replayActionRenderer,
} from 'electron-redux';
import userActions from './actions/user';
import { getRootReducer } from './reducers';

export default function configureStore(initialState, routerHistory, scope = 'main') {
  // const logger = createLogger({
  //   level: scope === 'main' ? undefined : 'info',
  //   collapsed: true,
  // });
  const router = routerMiddleware(routerHistory);

  const actionCreators = {
    ...userActions,
    push,
  };



  let middlewares = [thunk, promise, router];

  const composeEnhancers = (() => {
    // eslint-disable-next-line no-undef
    const compose_ = window && window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__;
    if (process.env.NODE_ENV === 'development' && compose_) {
      return compose_({ actionCreators });
    }
    return compose;
  })();

  if (scope === 'renderer') {
    middlewares = [
      forwardToMain,
      router,
      ...middlewares,
    ];
  }
  if (scope === 'main') {
    middlewares = [
      triggerAlias,
      ...middlewares,
      forwardToRenderer,
    ];
  }

  const enhanced = applyMiddleware(...middlewares);
  const enhancer = composeEnhancers(enhanced, persistState());



  const rootReducer = getRootReducer(routerHistory, scope);



  const store = createStore(rootReducer, initialState, enhancer);
  if (scope === 'main') {
    replayActionMain(store);
  } else {
    replayActionRenderer(store);
  }
  return store;
}
