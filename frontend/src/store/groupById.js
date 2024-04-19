import { csrfFetch } from "./csrf";


const LOAD = 'groupsById/LOAD';

const load = list => ({
    type: LOAD,
    list
})


export const getGroupDetails = (id) => async dispatch => {
    const response = await csrfFetch(`/api/groups/${id}`);

    if (response.ok) {
        const list = await response.json();
        dispatch(load(list))
        return list;
    }
}


const groupByIdReducer = (state = {}, action) => {
    switch (action.type) {
        case LOAD:
            return {...state, ...action.list}
        default:
            return state;
    }
}

export default groupByIdReducer;
