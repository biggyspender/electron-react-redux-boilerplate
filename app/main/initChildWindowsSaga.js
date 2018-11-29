import { put, take, select } from 'redux-saga/effects'
import { actionTypes } from 'redux-localstorage'

import stateInitialization from '../shared/actions/stateInitialization'
import { push } from 'connected-react-router';
export default function* () {
    const initAction = stateInitialization.initState().type
    for (; ;) {

        yield take(initAction);
        const state = yield select();
        yield put({ type: actionTypes.INIT, payload: state })
        if (state.user.loggedIn) {
            yield put(push("/loggedin"))
        }
    }
}