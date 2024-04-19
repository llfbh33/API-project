// import { useEffect } from "react";
import { useSelector } from "react-redux";
// import { getGroups } from "../../store/group";
import './Group.css'
import { useNavigate } from "react-router-dom";

function TestGroups() {
    const navigate = useNavigate();
    const groupList = useSelector(state => state.groups)


    console.log('grouplist ', groupList[1].name)


    return (
        <div className='container'>
            <h1 className="main-page">All Groups</h1>
            <dev className='group-container'>
            {groupList.map(group => (

                <dev key={group.id} className='group-card' onClick={() => navigate(`/groups/${group.id}`)}>
                    <dev >
                        <p>{`${group.name}`}</p>
                        <p>{`${group.about}`}</p>
                        <p>{`${group.type}`}</p>
                        <p>{`${group.city}, ${group.state}`}</p>
                    </dev>
                </dev>

            ))}
            </dev>
        </div>
    )
}

export default TestGroups;
