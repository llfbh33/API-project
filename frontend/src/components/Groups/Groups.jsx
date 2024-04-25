import { useDispatch, useSelector }  from "react-redux";
import { useNavigate } from "react-router-dom";
import { useContext, useEffect } from "react";
import * as groupActions from '../../store/group';
import * as groupAction from '../../store/groupById';
import { ApplicationContext } from "../../context/GroupContext";

import './Group.css'

function Groups() {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const groupList = useSelector(state => state.groups);
    const list = Object.values(groupList)
    const eventsList = useSelector(state => state.events)
    const events = Object.values(eventsList)
    const {setCurrGroupId, setCurrGroupPrev} = useContext(ApplicationContext);

    useEffect(() => {
        dispatch(groupActions.getGroups())
    }, [dispatch])

    const eventCount = (id) => {
        let eventArr = [];
        events.forEach(event => {
            if (event?.groupId === id) eventArr.push(event)
        });
        let count = eventArr.length
        eventArr = [];
        return count;
    }

    const toGroupDetails = (id, image) => {
        dispatch(groupAction.getGroupDetails(id))
        .then(() => {
            setCurrGroupId(id);
            setCurrGroupPrev(image);
            navigate(`/groups/${id}`);
        })

    }

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
            {list.map(group =>  (
                <div key={group?.id} className='group-card' onClick={() => toGroupDetails(group.id, group.previewImage)}>
                    <div className="activate">
                        <p>{`${group?.name}`}</p>
                        <p>{`${group?.city}, ${group?.state}`}</p>
                        <img src={group?.previewImage ? `${group?.previewImage}` : 'https://t3.ftcdn.net/jpg/04/62/93/66/360_F_462936689_BpEEcxfgMuYPfTaIAOC1tCDurmsno7Sp.jpg'} />
                        <p>{`${group?.about}`}</p>
                        <p>{eventCount(group?.id)} Events · {group?.private ? 'Private' : 'Public' }</p>
                    </div>
                </div>

            ))}
            </div>
        </div>
    )
}

export default Groups;
