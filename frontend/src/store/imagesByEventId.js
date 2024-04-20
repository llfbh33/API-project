import { csrfFetch } from "./csrf";


const LOAD = 'imagesByEventId/LOAD';

const CREATE = 'imagesByEventId/CREATE'

const load = list => ({
    type: LOAD,
    list
})

const create = image => ({
    type: CREATE,
    image
})


export const getEventImages = (id) => async dispatch => {
    const response = await csrfFetch(`/api/events/${id}/images`);

    if (response.ok) {
        const list = await response.json();
        dispatch(load(list))
        return list;
    }
}


export const postEventImages = (eventId, image) => async dispatch => {
    const { url, preview } = image;
    const response = await csrfFetch(`api/events/${eventId}/images`, {
        method: 'POST',
        body: JSON.stringify({
            url,
            preview
        })
    });
    const data = await response.json();
    dispatch(create(data.image));
    return response
}


const imagesByEventIdReducer = (state = {}, action) => {
    switch (action.type) {
        case LOAD:
            return {...state, ...action.list}
        case CREATE:
            return {...state, ...action.image}
        default:
            return state;
    }
}

export default imagesByEventIdReducer;
