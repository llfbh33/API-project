import { useSelector, useDispatch } from 'react-redux';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect, useMemo } from 'react';
import * as groupActions from '../../store/groupById';
import * as singleEventActions from '../../store/eventById';
import DestroyGroup from '../DestroyGroup/DestroyGroup';
import LoadingScreen from '../LoadingScreen/LoadingScreen';

import './IndividualGroup.css';




function IndividualGroup() {
    const {groupId} = useParams();
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const group = useSelector(state => state.groupById);
    const user = useSelector(state => state.session.user);
    const events = useSelector(state => state.events);

    const [organizer, setOrganizer] = useState(false);
    const [groupLoading, setGroupLoading] = useState(true);
    const [image, setImage] = useState('');

    const currEvents = Object.values(events)
    .filter(event => event.groupId === parseInt(groupId))

// Effect loading group by id and setting main image
    useEffect(() => {
        const loadData = async () => {
            await dispatch(groupActions.getGroupDetails(groupId));
            setGroupLoading(false);
        }

        loadData();
    }, [dispatch, groupId])

// Effect to set value of the main display image
    useEffect(() => {
        if (!groupLoading && group.GroupImages.length) {
            setImage(group.GroupImages.find(image => image.preview === true).url)
        }
    }, [groupLoading])


// Effect to check if the current user is the organizer of the current group
    useEffect(() => {
         setOrganizer(user && user.id === group.organizerId)
    }, [group, user])


 // Function to navigate the user to an event by id
    const seeEvent = async (id) => {
        await dispatch(singleEventActions.getEventDetails(id));
        setGroupLoading(true);
        localStorage.eventId = id;
        localStorage.groupId = groupId;
        navigate(`/events/${id}`);
    }


// function to navigate the user to the create event page
    const createEvent = () => {
        setGroupLoading(true);
        navigate(`/groups/${groupId}/events`)
    }


    // const organizeEvents = (isExpired) => {
    //     const now = new Date().getTime();
    //     return currEvents.filter(event => (new Date(event.startDate).getTime() < now) === isExpired)
    //                      .sort((a, b) => new Date(a.startDate) - new Date(b.startDate));
    // };

// function to organize a groups events which have not expired
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
        return sorted;
    }

// function to organize a groups events which have expired
    const organizeExpiredEvents = () => {
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
        return expired
    }

    // Replace loading screen with an actual loading screen
    if (groupLoading) {
        return <LoadingScreen />;
    }

    return (
        <div className='individual-group-container'>
            <div className='return-nav-link'>
                <Link to='/groups' className='groups-link'>{ `<--- Groups`}</Link>
            </div>
            <div className='top-section-container'>
                <div className='top-section-details'>
                    <div className='img-group'>
                         <img src={image} />
                         <div className='img-group-small-images'>
                            {group.GroupImages.map((image, idx)=> (
                                <div key={idx}>
                                    <img src={image.url} onClick={() => setImage(image.url)}/>
                                </div>
                            ))}
                         </div>
                    </div>

                    <div className='top-group-details'>
                        <div className='group-details-container'>
                            <div >
                                <h1>{`${group.name}`}</h1>
                                <h3>{`${group.city}, ${group.state}`}</h3>
                                <h3>{`Events: ${currEvents.length} · `}{group.private ? 'Private' : 'Public'}</h3>
                                <h3>{group.Organizer ? `Organized by: ${group.Organizer.firstName} ${group.Organizer.lastName}` : ''} </h3>
                            </div>
                            {/* If there is no logged in user, or the user is the organizer, you will not see this button */}
                            {!user || organizer ? null : (
                                <div className='join-group-btn'>
                                    <button className='join-btn'
                                        onClick={() => alert('Feature Coming Soon')}
                                        >Join This Group</button>
                                </div>
                            )}
                            {organizer && (
                                <div>
                                    <div className='btn-container'>
                                        <div className='create-update-btns'>
                                            <button className='org-btn-group'
                                                onClick={() => createEvent()}
                                                >Create Event
                                            </button>
                                            <button className='org-btn-group'
                                                onClick={() => navigate(`/groups/${groupId}/update`)}
                                                >Update
                                            </button>
                                        </div>
                                        <div className='delete-group'>
                                            <DestroyGroup organizer={organizer} />
                                        </div>
                                    </div>
                                </div>
                            )}
                            <div className='about-section'>
                                <h2>{`What We're About`}</h2>
                                <p>{`${group.about}`}</p>
                            </div>
                        </div>

                    </div>
                </div>

            </div>
            <div className='all-events-container'>
                <h2 className='events-count'>{organizeEvents().length === 0 ? `No Upcoming Events` :`Upcoming Events: (${organizeEvents().length})`}</h2>
                    {organizeEvents().map(event => (
                        <div key={`${event.id}`} className='event-display-card-container' onClick={() => seeEvent(event.id, event.previewImage)}>
                            <div className='event-top-sec' >
                                <div className='event-display-img-container'>
                                    <img src={event.previewImage ? `${event.previewImage}` : 'https://t3.ftcdn.net/jpg/04/62/93/66/360_F_462936689_BpEEcxfgMuYPfTaIAOC1tCDurmsno7Sp.jpg'} className='event-display-img'/>
                                </div>
                                <div className='group-event-details-top-container'>
                                    <div  className='group-event-details-container'>
                                        <h4>{`${event.name}`}</h4>
                                        <p>{event.startDate ? `Start Date: ${new Date(event.startDate).toDateString()} · ${new Date(event.startDate).toLocaleTimeString('en-US')}` : ''}</p>
                                        <p>{event.Venue ? `${event?.Venue.city}, ${event.Venue.state}` : ''}</p>
                                    </div>
                                </div>
                                <div>

                                </div>

                            </div>
                            <p className='group-event-description'>{event.description ? `${event.description}` : ''}</p>
                        </div>
                    ))}
            </div>
            <div className='all-events-container'>
            <h2 className='events-count' hidden={!organizeExpiredEvents().length}>{organizeExpiredEvents().length === 0 ? '' :`Expired Events: (${organizeExpiredEvents().length})`}</h2>
                    {organizeExpiredEvents().map(event => (
                        <div key={`${event.id}`} className='event-display-card-container' >
                            <div className='event-top-sec' >
                                <div className='event-display-img-container'>
                                    <img src={event.previewImage ? `${event.previewImage}` : 'https://t3.ftcdn.net/jpg/04/62/93/66/360_F_462936689_BpEEcxfgMuYPfTaIAOC1tCDurmsno7Sp.jpg'} onClick={() => seeEvent(event.id, event.previewImage)} className='event-display-img'/>
                                </div>
                                <div className='group-event-details-top-container'>
                                    <div className='group-event-details-container'>
                                        <h4>{`${event.name}`}</h4>
                                        <p>{event.startDate ? `Start Date: ${new Date(event.startDate).toDateString()} · ${new Date(event.startDate).toLocaleTimeString('en-US')}` : ''}</p>
                                        <p>{event.Venue ? `${event?.Venue.city}, ${event.Venue.state}` : ''}</p>
                                    </div>
                                </div>
                                <div>

                                </div>

                            </div>
                            <p className='group-event-description'>{event.description ? `${event.description}` : ''}</p>
                        </div>
                    ))}
            </div>
        </div>
    )
}


export default IndividualGroup
