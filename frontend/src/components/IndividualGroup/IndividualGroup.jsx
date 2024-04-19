import { useSelector } from 'react-redux';
import './IndividualGroup.css';
import { Link, useParams } from 'react-router-dom';
import { useState } from 'react';
import { useEffect } from 'react';
import * as groupActions from '../../store/groupById';
// import * as venuesActions from '../../store/venues';
import { useDispatch } from "react-redux";
import { useNavigate } from 'react-router-dom';


// need to fix the groups to come in as an object instead of an array for better time complexity
// if we grab a group from the back by its id, we also have access to the events
// or creating the id of the events to be the group ID  easier to access


function IndividualGroup() {
    const {groupId} = useParams();
    const dispatch = useDispatch();
    const navigate = useNavigate();
    let group = useSelector(state => state.groupById)
    const user = useSelector(state => state.session.user);
    const events = useSelector(state => state.events)
    const currEvents = Object.values(events)
                .filter(event => event.groupId === parseInt(groupId))

    const [organizer, setOrganizer] = useState(false);
    const [loaded, setLoaded] = useState(true);

    useEffect(() => {
        dispatch(groupActions.getGroupDetails(groupId))
        .then(() => {
            setLoaded(false)

        })

    }, [dispatch, groupId, loaded])


    useEffect(() => {
        if (user && user.id === group.organizerId) setOrganizer(true)

    }, [organizer, user, group.organizerId])



     return (

        <div className='individual'
            hidden={loaded}
            >
            <div className='top-section'>
                <div className='img-groups'>
                    <Link to='/groups' className='groups-link'>{ `<--- Groups`}</Link>
                    <img src={group.GroupImages ? `${group.GroupImages[0].url}` : ''} />
                </div>
                <div className='bottom-section'>
                    <div>
                        <h1>{`${group.name}`}</h1>
                        <p>{`${group.city}, ${group.state}`}</p>
                        <p>{`Events: ${currEvents.length} - `}{group.private ? 'Private' : 'Public'}</p>
                        <p>{group.Organizer ? `Organized by: ${group.Organizer.firstName} ${group.Organizer.lastName}` : ''} </p>
                    </div>
                    <div className='join-group-btn'>
                        <button className='join-btn'
                            hidden={user && !organizer ? false : true}
                            onClick={() => alert('Feature Coming Soon')}
                            >Join This Group</button>
                    </div>
                </div>
            </div>
            <div className='about-section'>
                <h2>Organizer</h2>
                <h4>{group.Organizer ? `${group.Organizer.firstName} ${group.Organizer.lastName}` : ''}</h4>
                <h2>{`What We're About`}</h2>
                <p>{`${group.about}`}</p>
                <button className='org-btn'
                hidden={!organizer}
                >Create Event
                </button>
            </div>
            <div className='about-section'>
            <h2>{`Events (${currEvents.length})`}</h2>
                {currEvents.map(event => (
                    <div key={`${event.id}`}>
                        <div className='event-top-sec' onClick={() => navigate(`/events/${event.id}`)}>
                            <div>
                                <img src={`${event.previewImage}`} />
                            </div>
                            <div className='event-details'>
                                <div>
    `                               <p>{`${event.name}`}</p>
                                    <p>{`${event.startDate}`}</p>
                                    <p>{`${event.Venue.city}, ${event.Venue.state}`}</p>
                                </div>
                                <div>
                                    <button className='org-btn'
                                        hidden={!organizer}
                                        >Update
                                    </button>
                                    <button className='org-btn'
                                        hidden={!organizer}
                                        >Delete
                                    </button>
                                </div>
                            </div>

                        </div>
                        <p>{`Description: ${event.name}`}</p>
                    </div>
                ))}
            </div>
        </div>
    )
}

// need to pull in the whole event to get the description and venue address

export default IndividualGroup
