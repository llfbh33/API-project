import { useSelector, useDispatch } from 'react-redux';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect, useContext } from 'react';
import * as groupActions from '../../store/groupById';
import DestroyGroup from '../Destroy/DestroyGroup';

import './IndividualGroup.css';
import { ApplicationContext } from '../../context/GroupContext';



function IndividualGroup() {
    const {groupId} = useParams();
    const {setCurrGroupId, currGroupPrev, setCurrEventPrev, currGroupId} = useContext(ApplicationContext);
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
        .then(() => {
            console.log('currGroup', currGroupId)
            setCurrGroupId(group.id)
            console.log('currGroup after', currGroupId)
        })
    }, [dispatch])

    useEffect(() => {
        setPicture(currGroupPrev);
    }, [currGroupPrev])

    useEffect(() => {
        if (user) {
            if (user.id === group.organizerId) setOrganizer(true);
            else setOrganizer(false)
        }
        if (group.id === parseInt(groupId)) setLoaded(true);
        else setLoaded(false)
    }, [loaded, group, groupId, user])

    const seeEvent = (id, image) => {
        setLoaded(false);
        setOrganizer(false);
        setPicture('');
        setCurrEventPrev(image)
        navigate(`/events/${id}`,
            {state: {
                id: group.organizerId,
                firstName: group.Organizer.firstName,
                lastName: group.Organizer.lastName,
                name: group.name,
                image: group?.GroupImages[0].url || '',
                city: group?.city,
                state: group.state}})
    }

    const createEvent = () => {

        setCurrGroupId(group.id)

        navigate(`/groups/${groupId}/events`, {state: {gId: group.id,
            groupName: group.name,
            id: group.organizerId,
            firstName: group.Organizer.firstName,
            lastName: group.Organizer.lastName,
            name: group.name,
            image: group?.GroupImages[0].url || '',
            city: group?.city,
            state: group.state
            }})
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
                        <p>{`${group?.city}, ${group.state}`}</p>
                        <p>{`Events: ${currEvents.length} · `}{group.private ? 'Private' : 'Public'}</p>
                        <p>{group.Organizer ? `Organized by: ${group.Organizer.firstName} ${group.Organizer.lastName}` : ''} </p>
                    </div>
                    <div className='join-group-btn'>
                        <button className='join-btn'
                            hidden={user && !organizer ? false : true}
                            onClick={() => alert('Feature Coming Soon')}
                            >Join This Group</button>
                    </div>
                    <div className='btn-container'>
                        <button className='org-btn'
                            hidden={!organizer}
                            onClick={() => navigate('/updateGroup')}
                            >Update
                        </button>
                        <div
                            hidden={!organizer}
                            className={!organizer ? '' :'delete-group'}
                            >
                            {<DestroyGroup organizer={organizer} />}
                        </div>

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
                onClick={() => createEvent()}
                >Create Event
                </button>
            </div>
            <div className='about-section'>
            <h2>{`Events (${currEvents.length})`}</h2>
                {currEvents.map(event => (
                    <div key={`${event.id}`}>
                        <div className='event-top-sec' >
                            <div>
                                <img src={`${event.previewImage}`} onClick={() => seeEvent(event.id, event.previewImage)}/>
                            </div>
                            <div className='event-details'>
                                <div onClick={() => seeEvent(event.id, event.previewImage)}>
    `                               <p>{`${event.name}`}</p>
                                    <p>{event.startDate ? `Start Date: ${event.startDate.slice(0, 10)} · ${event.startDate.slice(11)}` : ''}</p>
                                    <p>{event.Venue ? `${event?.Venue.city}, ${event.Venue.state}` : ''}</p>
                                </div>
                                <div>
                                    <button className='org-btn'
                                        hidden={!organizer}
                                        onClick={() => alert('feature coming soon')}
                                        >Update
                                    </button>
                                    <button className='org-btn'
                                        hidden={!organizer}
                                        onClick={() => alert('feature coming soon')}
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
