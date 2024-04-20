import { useDispatch, useSelector } from "react-redux";
import './Events.css';
// import groupsReducer from "../../store/group";
import { useNavigate } from "react-router-dom";
// import { useEffect } from "react";
import * as groupActions from '../../store/groupById';
import { useContext } from "react";
import { ApplicationContext } from "../../context/GroupContext";

function Events() {

    const navigate = useNavigate();
    const dispatch = useDispatch();

    const eventsList = useSelector(state => state.events)
    const events = Object.values(eventsList)
    const groupList = useSelector(state => state.groups);
    const groups = Object.values(groupList);

    const groupDetails = useSelector(state => state.groupById);
    const {setCurrEventPrev} = useContext(ApplicationContext);



    const eventPage = (event) => {
        const thisGroup = groups.find(group => group.id === event.groupId)

        dispatch(groupActions.getGroupDetails(thisGroup.id))
        .then(() => {
            setCurrEventPrev(event.previewImage)
            navigate(`/events/${event.id}`, {state: {id: thisGroup.organizerId,
                firstName: groupDetails.Organizer.firstName,
                lastName: groupDetails.Organizer.lastName,
                name: thisGroup.name,
                image: thisGroup.previewImage,
                city: thisGroup.city,
                state: thisGroup.state}})
        })
    }

    return (
        <div>
            <div>
                <div className='groups-title'>
                    <h1 style={{textDecoration: 'underline'}}>Events</h1>
                    <h1 style={{color: '#525151'}}>Groups</h1>
                </div>
                <h3>Events in Meet Dogs</h3>
            </div>
            <div>
                {events.map(event => (
                    <div key={`${event.id}`} className='event-list' onClick={() => eventPage(event)}>
                    <div className='event-top-sec' >
                        <div>
                            <img src={event?.previewImage ? `${event.previewImage}` : 'https://t3.ftcdn.net/jpg/04/62/93/66/360_F_462936689_BpEEcxfgMuYPfTaIAOC1tCDurmsno7Sp.jpg'} />
                        </div>
                        <div className='event-details'>
                            <div>
`                               <p>{`${event.name}`}</p>
                                <p>{event.startDate ? `Start Date: ${event.startDate.slice(0, 10)} · ${event.startDate.slice(11)}` : ''}</p>
                                <p>{`${event.Venue.city}, ${event.Venue.state}`}</p>
                            </div>
                        </div>
                        <h4>Enjoy a good time at this event</h4>
                    </div>
                </div>
                ))}
            </div>
        </div>
    )
}

export default Events;
