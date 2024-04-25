import { csrfFetch } from "./csrf";


const LOAD = 'imagesByGroupId/LOAD';

const CREATE = 'imagesByGroupId/CREATE'

const load = list => ({
    type: LOAD,
    list
})

const create = image => ({
    type: CREATE,
    image
})


export const getGroupImages = (id) => async dispatch => {
    const response = await csrfFetch(`/api/groups/${id}/images`);

    if (response.ok) {
        const list = await response.json();
        dispatch(load(list))
        return list;
    }
}


export const postGroupImages = (groupId, image) => async dispatch => {
    const { url, preview } = image;
    const response = await csrfFetch(`/api/groups/${groupId}/images`, {
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


const imagesByGroupIdReducer = (state = {}, action) => {
    switch (action.type) {
        case LOAD:
            return {...state, ...action.list}
        case CREATE:
            return {...state, ...action.image}
        default:
            return state;
    }
}

export default imagesByGroupIdReducer;
