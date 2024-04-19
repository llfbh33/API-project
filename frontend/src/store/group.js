import { csrfFetch } from './csrf.js';

const LOAD = 'group/LOAD';


// I need to load the groups into a state in order to access them

const load = list => ({
    type: LOAD,
    list
})



//thunk to grab all groups
export const getGroups = () => async dispatch => {
    const response = await csrfFetch("/api/groups");

    if (response.ok) {
        const list = await response.json();
        dispatch(load(list.Groups))
        return list;
    }
}


// thunk to grab all groups joinged or organized by current user
// should only be able to access this thunk from the users page
export const getCurrUserGroups = () => async dispatch => {
    const response = await csrfFetch("api/groups/current");

    if (response.ok) {
        const theirGroups = await response.json();
        dispatch(load(theirGroups.Groups))
        return theirGroups;
    }
}



const groupsReducer = (state = {}, action) => {
    switch (action.type) {
        case LOAD:
        {
            const theseGroups = {};
            action.list.forEach(group => {
                theseGroups[group.id] = group;
            });
            return {...state, ...theseGroups}
        }
        default:
            return state;
    }
}

export default groupsReducer;


// this works with a statw of an empty array, but i am unable to pull the
// information out of the received array

/*
        {
            const allGroups = [];
            action.list.forEach(group => {
                allGroups.push(group)
            })
            return allGroups;
        }
        */
