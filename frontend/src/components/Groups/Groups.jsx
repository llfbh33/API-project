import { useDispatch, useSelector }  from "react-redux";
import { useNavigate } from "react-router-dom";
import { useContext, useEffect, useState } from "react";
import * as groupActions from '../../store/group';
import * as groupAction from '../../store/groupById';
import * as eventActions from '../../store/events';
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
    const [loaded, setLoaded] = useState(false);

    useEffect(() => {
        dispatch(groupActions.getGroups())
        dispatch(eventActions.getEvents())
        .then(() => {
            setLoaded(true)
        })
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
            setLoaded(false)
            navigate(`/groups/${id}`);
        })

    }

    if (loaded) return (
        <div className='main-container'>
            <div>
                <div className='groups-title'>
                    <h2>Events</h2>
                    <h3> · </h3>
                    <h1>Groups</h1>
                </div>
                <h1 className="groups-title-caption" >Groups in Meet Dogs</h1>
            </div>
            <div className='group-container'>
            {list.map(group =>  (
                <div key={group?.id} className='group-card-container' onClick={() => toGroupDetails(group.id, group.previewImage)}>
                    <div className="group-details">
                        <div className="group-img-container">
                            <img src={group?.previewImage ? `${group?.previewImage}` : 'https://t3.ftcdn.net/jpg/04/62/93/66/360_F_462936689_BpEEcxfgMuYPfTaIAOC1tCDurmsno7Sp.jpg'} />
                        </div>
                        <div className="details-top-container">
                            <div className="details-container">
                                <h3>{`${group?.name}`}</h3>
                                <h4>{`${group?.city}, ${group?.state}`}</h4>
                                <h4>{eventCount(group?.id)} Events · {group?.private ? 'Private' : 'Public' }</h4>
                            </div>
                        </div>
                    </div>
                    <p className="group-description">{`${group?.about}`}</p>
                </div>
            ))}
            </div>
        </div>
    )
}

export default Groups;
