import { useSelector, useDispatch } from 'react-redux';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect, useContext } from 'react';
import * as groupActions from '../../store/groupById';
import * as eventActions from '../../store/events';
import * as singleEventActions from '../../store/eventById';
import DestroyGroup from '../DestroyGroup/DestroyGroup';

import './IndividualGroup.css';
import { ApplicationContext } from '../../context/GroupContext';



function IndividualGroup() {
    const {groupId} = useParams();
    const {setCurrGroupId, setCurrEventPrev} = useContext(ApplicationContext);
    const dispatch = useDispatch();
    const navigate = useNavigate();
    let group = useSelector(state => state.groupById)
    const user = useSelector(state => state.session.user);
    const events = useSelector(state => state.events)
    const currEvents = Object.values(events)
                .filter(event => event.groupId === parseInt(groupId))

    const [organizer, setOrganizer] = useState(false);
    const [loaded, setLoaded] = useState(false);
    const [eventLoaded, setEventLoaded] = useState(false)
    const [picture, setPicture] = useState('');
    const [eventId, setEventId] = useState('');



    useEffect(() => {
        dispatch(groupActions.getGroupDetails(groupId))
        .then(() => {
            localStorage.groupId = groupId;
        })
    }, [dispatch])

    useEffect(() => {
        if (group.GroupImages) {
            let image = Object.values(group.GroupImages)
            let imageFind = image.find(pic => pic)
            setPicture(imageFind.url)
        }
    }, [group])

    useEffect(() => {
        if (eventLoaded === true) {
            navToEvent();
        }
    }, [eventLoaded])

    useEffect(() => {
        if (user) {
            if (user.id === group.organizerId) setOrganizer(true);
            else setOrganizer(false)
        }
        if (group.id === parseInt(groupId)) setLoaded(true);
        else setLoaded(false)
    }, [loaded, group, groupId, user])


    const navToEvent = () => {
        setEventLoaded(false)
        setLoaded(false);
        setOrganizer(false);
        setPicture('');
        setCurrEventPrev(group?.GroupImages[0].url)
        navigate(`/loadingEvent/${eventId}/${groupId}`)
    }

    const seeEvent = (id) => {
        setEventId(id)
        localStorage.eventId = id;
        dispatch(groupActions.getGroupDetails(groupId))
        .then(() => {
            dispatch(singleEventActions.getEventDetails(id))
        })
        .then(() => {
            setEventLoaded(true)
        })
    }

    const createEvent = () => {

        dispatch(eventActions.getEvents())
        .then(() =>{
            setCurrGroupId(group.id)
        })
        .then(() => {
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
        })

    }

    const organizeEvents = () => {
        let dates = []
        let sorted = [];
        let expired = [];
        let events = [...currEvents]
        if(events) {
            events.forEach(event => dates.push(event.startDate))
            dates.sort()
            dates.forEach(date => {
                let currEvent = events.find(event => event.startDate === date)
                if(new Date(currEvent.startDate).getTime() < new Date().getTime()) expired.push(currEvent)
                else sorted.push(currEvent)
                events.splice(events.indexOf(currEvent), 1)
            })
        }
        if (expired) {
            expired.forEach(event => sorted.push(event));
        }
        return sorted;
    }

    return (

        <div className='individual-group-container'
            hidden={!loaded}>
            <div className='return-nav-link'>
                <Link to='/groups' className='groups-link'>{ `<--- Groups`}</Link>
            </div>
            <div className='top-section-container'>
                <div className='top-section-details'>
                    <div className='img-group'>
                        {picture && picture === '' ? (<h1>Loading...</h1>) : ( <img src={picture} />)}
                    </div>
                    <div className='top-group-details'>
                        <div className='group-details-container'>
                            <div >
                                <h1>{`${group.name}`}</h1>
                                <h3>{`${group?.city}, ${group.state}`}</h3>
                                <h3>{`Events: ${currEvents.length} · `}{group.private ? 'Private' : 'Public'}</h3>
                                <h3>{group.Organizer ? `Organized by: ${group.Organizer.firstName} ${group.Organizer.lastName}` : ''} </h3>
                            </div>
                            <div className={user && organizer ? '' : 'join-group-btn'}>
                                <button className='join-btn'
                                    hidden={user && !organizer ? false : true}
                                    onClick={() => alert('Feature Coming Soon')}
                                    >Join This Group</button>
                            </div>
                            <div>
                                <div className='btn-container'>
                                    <button className='org-btn'
                                        hidden={!organizer}
                                        onClick={() => createEvent()}
                                        >Create Event
                                    </button>
                                    <button className='org-btn'
                                        hidden={!organizer}
                                        onClick={() => navigate(`/groups/${groupId}/update`)}
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
                            <div className='about-section'>
                                <h2>{`What We're About`}</h2>
                                <p>{`${group.about}`}</p>
                            </div>
                        </div>

                    </div>
                </div>

            </div>
            <div className='all-events-container'>
                <h2>{`Events (${currEvents.length})`}</h2>
                    {organizeEvents().map(event => (
                        <div key={`${event.id}`} className='event-display-card-container'>
                            <div className='event-top-sec' >
                                <div className='event-display-img-container'>
                                    <img src={event.previewImage ? `${event.previewImage}` : 'https://t3.ftcdn.net/jpg/04/62/93/66/360_F_462936689_BpEEcxfgMuYPfTaIAOC1tCDurmsno7Sp.jpg'} onClick={() => seeEvent(event.id, event.previewImage)} className='event-display-img'/>
                                </div>
                                <div className='group-event-details-top-container'>
                                    <div onClick={() => seeEvent(event.id, event.previewImage)} className='group-event-details-container'>
                                        <p>{`${event.name}`}</p>
                                        <p>{event.startDate ? `Start Date: ${new Date(event.startDate).toDateString()} · ${new Date(event.startDate).toLocaleTimeString('en-US')}` : ''}</p>
                                        <p>{event.Venue ? `${event?.Venue.city}, ${event.Venue.state}` : ''}</p>
                                    </div>
                                </div>
                                <div>

                                </div>

                            </div>
                            <p>{event.description ? `${event.description}` : ''}</p>
                        </div>
                    ))}
            </div>
        </div>
    )
}

// need to pull in the whole event to get the description and venue address

export default IndividualGroup
