import { csrfFetch } from "./csrf";


const LOAD = 'eventsById/LOAD';

const load = list => ({
    type: LOAD,
    list
})


export const getEventDetails = (id) => async dispatch => {
    const response = await csrfFetch(`/api/events/${id}`);

    if (response.ok) {
        const list = await response.json();
        dispatch(load(list))
        return list;
    }
}


const eventByIdReducer = (state = {}, action) => {
    switch (action.type) {
        case LOAD:
            return {...state, ...action.list}
        default:
            return state;
    }
}

export default eventByIdReducer;
