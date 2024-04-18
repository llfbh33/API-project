import { csrfFetch } from './csrf.js';

const LOAD = 'group/LOAD';


// I need to load the groups into a state in order to access them

const load = list => ({
    type: LOAD,
    list
})


//create a thunk to grab all groups
export const getGroups = () => async dispatch => {
    const response = await csrfFetch("/api");

    if (response.ok) {
        const list = await response.json();
        dispatch(load(list))
    }
}



const groupsReducer = (state = [], action) => {
    switch (action.type) {
        case LOAD:
        {
            const allGroups = [];
            action.list.Groups.forEach(group => {
                allGroups.push(group)
            })
            return allGroups;
        }
        default:
            return state;
    }
}

export default groupsReducer;
