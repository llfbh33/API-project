import { csrfFetch } from "./csrf";


const LOAD = 'events/LOAD';

const load = list => ({
    type: LOAD,
    list
})


export const getEvents = () => async dispatch => {
    const response = await csrfFetch("/api/events");

    if (response.ok) {
        const list = await response.json();
        dispatch(load(list.Events))
        return list;
    }
}


const eventsReducer = (state = {}, action) => {
    switch (action.type) {
        case LOAD:
        {
            const theseEvents = {};
            action.list.forEach(event => {
                theseEvents[event.id] = event;
            });
            return {...state, ...theseEvents}
        }
        default:
            return state;
    }
}

export default eventsReducer;
