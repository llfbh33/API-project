import { csrfFetch } from "./csrf";


const LOAD = 'members/LOAD';

const load = list => ({
    type: LOAD,
    list
})


export const getMemberships = (id) => async dispatch => {
    const response = await csrfFetch(`/api/groups/${id}/members`);

    if (response.ok) {
        const list = await response.json();
        dispatch(load(list.Members))
        return list;
    }
}


const membersReducer = (state = {}, action) => {
    switch (action.type) {
        case LOAD:
        {
            const theseMembers = {};
            action.list.forEach(member => {
                theseMembers[member.id] = member;
            });
            return {...state, ...theseMembers}
        }
        default:
            return state;
    }
}

export default membersReducer;
