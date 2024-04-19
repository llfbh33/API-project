// import { useEffect } from "react";
import { useSelector } from "react-redux";
// import { getGroups } from "../../store/group";
import './Group.css'
import { useNavigate } from "react-router-dom";

// in order to pull in event we will need to make an event reducer
// need to create a users reducer as well

function TestGroups() {
    const navigate = useNavigate();
    const groupList = useSelector(state => state.groups);


    console.log('grouplist ', groupList[1])


    return (
        <div className='container'>
            <div>
                <div className='groups-title'>
                    <h1 style={{color: '#525151'}}>Events</h1>
                    <h1 style={{textDecoration: 'underline'}}>Groups</h1>
                </div>
                <h3>Groups in Meet Dogs</h3>
            </div>
            <div className='group-container'>
            {groupList.map(group => (

                <div key={group.id} className='group-card' onClick={() => navigate(`/groups/${group.id}`)}>
                    <div className="activate">
                        <p>{`${group.name}`}</p>
                        <p>{`${group.city}, ${group.state}`}</p>
                        <img src={`${group.previewImage}`} />
                        <p>{`${group.about}`}</p>
                        <p>{`${group.type}`}</p>
                        <p>x Events - {group.private ? 'Private' : 'Public' }</p>
                    </div>
                </div>

            ))}
            </div>
        </div>
    )
}

export default TestGroups;