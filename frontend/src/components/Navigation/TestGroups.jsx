import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getGroups } from "../../store/group";


function TestGroups() {
    const dispatch = useDispatch();
    const groupList = useSelector(state => state.groups)


    useEffect(() => {
        dispatch(getGroups())
    }, [dispatch])

    console.log('grouplist ', groupList)  // empty group list


    return (
        <>
            <h1>All Groups</h1>
            {groupList.map(group => {
                <dev className='group-card'>
                    <h3>{`${group.name}`}</h3>
                    <p>{`${group.city}, ${group.state}`}</p>
                    {/* <img src={group.previewImage ? `${group.previewImage}` : ''} /> */}
                    <p>{`${group.about}`}</p>
                </dev>
            })}
        </>
    )
}

export default TestGroups;
