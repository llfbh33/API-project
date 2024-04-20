import { csrfFetch } from "./csrf";


const LOAD = 'events/LOAD';
const CREATE = 'events/CREATE';

const load = list => ({
    type: LOAD,
    list
})

const create = (event, id) => ({
    type: CREATE,
    event,
    id
})


export const getEvents = () => async dispatch => {
    const response = await csrfFetch("/api/events");

    if (response.ok) {
        const list = await response.json();
        dispatch(load(list.Events))
        return list;
    }
}

export const createEvent = (groupId, eventId, event) => async dispatch => {
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
    dispatch(create(data.event, eventId));
    return response
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
            thisEvent[action.id] = action.event;
            return {...state, ...thisEvent};
        }
        default:
            return state;
    }
}

export default eventsReducer;
