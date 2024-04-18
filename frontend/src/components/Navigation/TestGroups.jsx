// import { useEffect } from "react";
import { useSelector } from "react-redux";
// import { getGroups } from "../../store/group";
import './Group.css'


function TestGroups() {
    // const dispatch = useDispatch();
    const groupList = useSelector(state => state.groups)


    // useEffect(() => {
    //     dispatch(getGroups())
    // }, [dispatch])


    // list comes through but does not want to display at all
    console.log('grouplist ', groupList[1].name)


    return (
        <>
            <h1>All Groups</h1>
            <h2>{`${groupList[1].name}`}</h2>
            <dev className='group-location'>
            {groupList.map(group => {
            return (
                <dev key={group.id} className='group-card'>
                    <dev >
                        <p>{`${group.name}`}</p>
                        <p>{`${group.about}`}</p>
                        <p>{`${group.type}`}</p>
                        <p>{`${group.city}, ${group.state}`}</p>
                    </dev>
                </dev>
                )
            })}
            </dev>
        </>
    )
}

export default TestGroups;
