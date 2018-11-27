import { combineReducers } from 'redux';
import { connectRouter } from 'connected-react-router';

import user from './user';




export function getRootReducer(routerHistory, scope = "main") {
    const baseReducers = {

        user,
    };
    const allReducers = scope === 'renderer' ?
        {
            ...baseReducers,
            router: connectRouter(routerHistory),
        } :
        baseReducers;
    return combineReducers(allReducers)
}

