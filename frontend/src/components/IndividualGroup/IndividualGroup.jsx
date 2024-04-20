import { useSelector } from 'react-redux';
import './IndividualGroup.css';
import { Link, useParams } from 'react-router-dom';
import { useState } from 'react';
import { useEffect } from 'react';
import * as groupActions from '../../store/groupById';
import { useDispatch } from "react-redux";
import { useNavigate } from 'react-router-dom';

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
    const [loaded, setLoaded] = useState(false);
    const [picture, setPicture] = useState('');

    useEffect(() => {
        dispatch(groupActions.getGroupDetails(groupId))
    }, [dispatch])

    useEffect(() => {
        if(group.GroupImages) setPicture(group.GroupImages[0].url)
        else setPicture('');
    }, [group])


    useEffect(() => {
        if (user) {
            if (user.id === group.organizerId) setOrganizer(true);
            else setOrganizer(false)
        }

        if (group.id === parseInt(groupId)) {
            setLoaded(true);
        }else setLoaded(false)
    }, [loaded, group, groupId, user])

    const seeEvent = (id) => {
        setLoaded(false);
        setOrganizer(false);
        setPicture('');
        navigate(`/events/${id}`, {state: {id: group.organizerId,
                                            firstName: group.Organizer.firstName,
                                            lastName: group.Organizer.lastName,
                                            name: group.name,
                                            image: group?.GroupImages[0].url || '',
                                            city: group.city,
                                            state: group.state}})
    }

    return (

        <div className='individual'
            hidden={!loaded}
            >
            <div className='top-section'>
                <div className='img-groups'>
                    <Link to='/groups' className='groups-link'>{ `<--- Groups`}</Link>
                    {picture && picture === '' ? (<h1>Loading...</h1>) : ( <img src={picture} />)}
                </div>
                <div className='bottom-section'>
                    <div>
                        <h1>{`${group.name}`}</h1>
                        <p>{`${group.city}, ${group.state}`}</p>
                        <p>{`Events: ${currEvents.length} · `}{group.private ? 'Private' : 'Public'}</p>
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
                        <div className='event-top-sec' onClick={() => seeEvent(event.id)}>
                            <div>
                                <img src={`${event.previewImage}`} />
                            </div>
                            <div className='event-details'>
                                <div>
    `                               <p>{`${event.name}`}</p>
                                    <p>{event.startDate ? `Start Date: ${event.startDate.slice(0, 10)} · ${event.startDate.slice(11)}` : ''}</p>
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
                        <h4>Enjoy a good time at this event</h4>
                    </div>
                ))}
            </div>
        </div>
    )
}

// need to pull in the whole event to get the description and venue address

export default IndividualGroup
