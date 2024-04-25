
import { csrfFetch } from './csrf.js';

const LOAD = 'group/LOAD';
const CREATE = 'group/CREATE'
const EDIT = 'group/EDIT';
const DESTROY = 'group/DESTROY'


// I need to load the groups into a state in order to access them

const load = list => ({
    type: LOAD,
    list
})

const create = (data) => ({
    type: CREATE,
    data
})

const edit = (group, id) => ({
    type: EDIT,
    group,
    id
})

const destroy = (groupId) => ({
    type: DESTROY,
    groupId
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

export const createGroup = (group) => async dispatch => {
    const { name, about, type, isPrivate, city, state } = group;
    const response = await csrfFetch('/api/groups', {
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
    console.log('data', data.group)
    console.log('group', group)
    dispatch(create(data));
    return response
}

export const editGroup = (groupId, group) => async dispatch => {
    const { name, about, type, isPrivate, city, state } = group;
    const response = await csrfFetch(`/api/groups/${groupId}`, {
        method: 'PUT',
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
    dispatch(edit(data.group, groupId));
    return response
}

export const destroyGroup = (groupId) => async dispatch => {
    const response = await csrfFetch(`/api/groups/${groupId}`, {
        method: 'DELETE',
    });
    dispatch(destroy(groupId));
    return response;
}


const groupsReducer = (state = {}, action) => {
    // console.log('reducer', action.data)
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
            thisGroup[action.data.id] = action.data;
            return {...state, ...thisGroup};
            }
        case EDIT: {
            const newState = {...state};
            newState[action.id] = action.group;
            return newState;
        }
        case DESTROY: {
            const newState = {...state};
            delete newState[action.groupId];
            return newState;
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
