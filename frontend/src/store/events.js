import { csrfFetch } from "./csrf";


const LOAD = 'events/LOAD';
const CREATE = 'events/CREATE';
const DESTROY = 'events/DESTROY';

const load = list => ({
    type: LOAD,
    list
})

const create = (event) => ({
    type: CREATE,
    event,
})

const destroy = (eventId) => ({
    type: DESTROY,
    eventId
})


export const getEvents = () => async dispatch => {
    const response = await csrfFetch("/api/events");

    if (response.ok) {
        const list = await response.json();
        dispatch(load(list.Events))
        return list;
    }
}

export const createEvent = (groupId, event) => async dispatch => {
    const { venueId, name, type, capacity, price, description, startDate, endDate } = event;
    const response = await csrfFetch(`/api/groups/${groupId}/events`, {
        method: 'POST',
        body: JSON.stringify({
            venueId,
            name,
            type,
            capacity,
            price,
            description,
            startDate,
            endDate

        })
    });
    const data = await response.json();
    console.log(data);
    dispatch(create(data));
    return response
}


export const destroyEvent = (eventId) => async dispatch => {
    const response = await csrfFetch(`/api/events/${eventId}`, {
        method: 'DELETE',
    });
    dispatch(destroy(eventId));
    return response;
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
        case CREATE: {
            const thisEvent = {};
            thisEvent[action.event.id] = action.event;
            return {...state, ...thisEvent}
        }
        case DESTROY: {
            const newState = {...state};
            delete newState[action.eventId];
            return newState;
        }
        default:
            return state;
    }
}

export default eventsReducer;
