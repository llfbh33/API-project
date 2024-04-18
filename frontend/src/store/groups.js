import { csrfFetch } from './csrf.js';

const LOAD = 'group/LOAD';

// load groups to a slice of state
const load = list => ({
    type: LOAD,
    list
})


//create a thunk to grab all groups
export const getGroups = () => async dispatch => {
    const response = await csrfFetch("/api/groups");

    if (response.ok) {
        const list = await response.json();
        dispatch(load(list.Groups))
        return list
    }
}

const groupsReducer = (state = {}, action) => {
    switch (action.type) {
        case LOAD: {
            const loadGroups = {};
            action.list.forEach(group => {
                loadGroups[group.id] = group
            })
            return loadGroups
        }
        default:
            return state;
    }
}

export default groupsReducer;
