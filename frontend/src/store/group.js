
import { csrfFetch } from './csrf.js';

const LOAD = 'group/LOAD';

const CREATE = 'group/CREATE'


// I need to load the groups into a state in order to access them

const load = list => ({
    type: LOAD,
    list
})

const create = (group, id) => ({
    type: CREATE,
    group,
    id
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

export const createGroup = (groupId, group) => async dispatch => {
    const { name, about, type, isPrivate, city, state } = group;
    const response = await csrfFetch('api/groups', {
        method: 'POST',
        body: JSON.stringify({
            name,
            about,
            type,
            private: isPrivate,
            city,
            state
        })
    });
    const data = await response.json();
    dispatch(create(data.group, groupId));
    return response
}

const groupsReducer = (state = {}, action) => {
    switch (action.type) {
        case LOAD: {
            const theseGroups = {};
            action.list.forEach(group => {
                theseGroups[group.id] = group;
            });
            return {...state, ...theseGroups}
        }
        case CREATE: {
            const thisGroup = {};
            thisGroup[action.id] = action.group;
            return {...state, ...thisGroup};
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
