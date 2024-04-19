import './IndividualEvent.css'
import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import * as eventByIdActions from '../../store/eventById';
import { Link } from 'react-router-dom';
import { TbClockHour4 } from "react-icons/tb";
import { AiOutlineDollar } from "react-icons/ai";
import { TfiLocationPin } from "react-icons/tfi";
// import { getGroupDetails } from '../../store/groupById';
import { useLocation } from 'react-router-dom';

function IndividualEvent() {
    const {eventId} = useParams();
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const location = useLocation();
    const [loaded, setLoaded] = useState(false);
    let event = useSelector(state => state.eventById);
    let user = useSelector(state => state.session.user);
    const [organizer, setOrganizer] = useState(false);

    useEffect(() => {
        dispatch(eventByIdActions.getEventDetails(eventId))
    }, [dispatch, eventId])


    useEffect(() => {
        if (user.id === parseInt(location.state.id)) setOrganizer(true);
        else setOrganizer(false);

        if (event.id === parseInt(eventId)) setLoaded(true);
        else setLoaded(false)

    }, [organizer, user.id, loaded, eventId, event, location.state])

    return (
        <div className='individual'
            hidden={!loaded}>
            <div className='headliner'>
                <Link to='/events'>{`<-- Events`}</Link>
                <h1>{`${event.name}`}</h1>
                <h4>Hosted by: {`${location.state.firstName} ${location.state.lastName}`}</h4>
            </div>
            <div className='img-info'>
                <div>
                    <img src={event.EventImages ? `${event.EventImages[0].url}` : '' } />
                </div>
                <div>
                    <div className='group-section' onClick={() => navigate(`/groups/${event.groupId}`)}>
                        <img src={`${location.state.image}`} />
                        <div>
                            <h2>{`${location.state.name}`}</h2>
                            <h3>{`${location.state.city}, ${location.state.state}`}</h3>
                        </div>
                    </div>
                    <div className='event-info'>
                        <div className='clock'>
                            <TbClockHour4 style={{fontSize: '40px'}}/>
                            <div>
                                <h3>{event.startDate ? `Start Date: ${event.startDate.slice(0, 10)} · ${event.startDate.slice(11)}` : ''}</h3>
                                <h3>{event.endDate ? `End Date: ${event.endDate.slice(0, 10)} · ${event.endDate.slice(11)}` : ''}</h3>
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
                                        >Update
                                    </button>
                                    <button className='org-btn'
                                        hidden={!organizer}
                                        >Delete
                                    </button>
                                </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    )
}


export default IndividualEvent;
