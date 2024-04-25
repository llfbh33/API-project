import { useState, useEffect} from 'react';
import { useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';

import { TbClockHour4 } from "react-icons/tb";
import { AiOutlineDollar } from "react-icons/ai";
import { TfiLocationPin } from "react-icons/tfi";

import DestroyEvent from '../DestroyEvent/DestroyEvent';

import './IndividualEvent.css'


function IndividualEvent() {

    const navigate = useNavigate();

    const group = useSelector(state => state.groupById);
    const event = useSelector(state => state.eventById);
    const user = useSelector(state => state.session.user);

    const [organizer, setOrganizer] = useState(false);
    const [groupPic, setGroupPic] = useState('');
    const [eventPic, setEventPic] = useState('');


    useEffect(() => {
        if (user && user.id === parseInt(group.organizerId)) setOrganizer(true);
        else setOrganizer(false);
    }, [group, user, event])


    useEffect(() => {
        if (Object.values(group)) {
            let image = Object.values(group.GroupImages)
            let imageFind = image.find(pic => pic)
            setGroupPic(imageFind.url)
        }
        if (Object.values(event)) {
            let image = Object.values(event.EventImages)
            let imageFind = image.find(pic => pic)
            setEventPic(imageFind.url)
        }
    }, [group, event])


    return (
        <div className='individual'>
            {/* // hidden={!loaded}> */}
            <div className='headliner'>
                <Link to='/events'>{`<-- Events`}</Link>
                <h1>{`${event.name}`}</h1>
                <h4>{`Hosted by: ${group?.Organizer.firstName} ${group?.Organizer.lastName}`}</h4>
            </div>
            <div className='img-info'>
                <div>
                    {/* <img src={event? `${event?.EventImages[0].url}` : ''} /> */}
                    {eventPic && eventPic === '' ? (<h1>Loading...</h1>) : ( <img src={eventPic} />)}
                </div>
                <div>
                    <div className='group-section' onClick={() => navigate(`/groups/${group.id}`)}>
                        {/* <img src={group ? `${group.GroupImages[0].url}` : ''} /> */}
                        {groupPic && groupPic === '' ? (<h1>Loading...</h1>) : ( <img src={groupPic} />)}
                        <div>
                            <h2>{`${group?.name}`}</h2>
                            <h3>{`${group?.city}, ${group?.state}`}</h3>
                        </div>
                    </div>
                    <div className='event-info'>
                        <div className='clock'>
                            <TbClockHour4 style={{fontSize: '40px'}}/>
                            <div>
                                <h3>{event.startDate ? `Start: ${new Date(event.startDate).toDateString()} · ${event.startDate.slice(11, 16)}` : ''}</h3>
                                <h3>{event.endDate ? `End: ${new Date(event.endDate).toDateString()} · ${event.endDate.slice(11, 16)}` : ''}</h3>
                            </div>
                        </div>
                        <div className='clock' >
                            <AiOutlineDollar style={{fontSize: '40px'}}/>
                            <h3>{event.price === 0 ? 'FREE' : `$${event.price}`}</h3>
                        </div>
                        <div className='clock'>
                            <TfiLocationPin style={{fontSize: '40px'}} />
                            <div>
                                <h3>{`${event.type}`}</h3>
                            </div>
                        </div>
                        <div>
                            <h3>Description:</h3>
                            <p>{`${event.description}`}</p>
                            <div>
                                <button className='org-btn'
                                    hidden={!organizer}
                                    onClick={() => alert('Function coming soon')}
                                    >Update
                                </button>
                                <div
                                    hidden={!organizer}
                                    className={!organizer ? '' :'delete-event'}
                                    >
                                    {<DestroyEvent organizer={organizer} />}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}


export default IndividualEvent;
