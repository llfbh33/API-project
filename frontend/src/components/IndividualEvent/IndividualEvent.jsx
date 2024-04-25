import { useState, useEffect, useContext } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams, useLocation, Link } from 'react-router-dom';

import { TbClockHour4 } from "react-icons/tb";
import { AiOutlineDollar } from "react-icons/ai";
import { TfiLocationPin } from "react-icons/tfi";
import * as groupActions from '../../store/groupById';
import * as eventActions from '../../store/eventById';



import './IndividualEvent.css'
import { ApplicationContext } from '../../context/GroupContext';


function IndividualEvent() {

    const location = useLocation();
    // const dispatch = useDispatch();
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const {eventId} = useParams();

    const group = useSelector(state => state.groupById);
    const event = useSelector(state => state.eventById);
    const user = useSelector(state => state.session.user);

    let [eventLoaded, setEventLoaded] = useState(false);
    let [groupLoaded, setGroupLoaded] = useState(false);

    const [loaded, setLoaded] = useState(false);
    const [organizer, setOrganizer] = useState(false);
    const [picture] = useState('');
    const {currGroupId, setCurrGroupId, setCurrGroupPrev} = useContext(ApplicationContext);


    useEffect(() =>{
        dispatch(eventActions.getEventDetails(eventId))
        .then(() => setEventLoaded(true))
    }, [eventId])

    useEffect(() => {
        if (eventLoaded = true) {
            dispatch(groupActions.getGroupDetails(event.groupId))
            .then(setGroupLoaded(true))
        }
    }, [eventLoaded])

    useEffect(() => {
        console.log(eventLoaded, groupLoaded)
        if (groupLoaded === true) setLoaded(true)
    }, [groupLoaded])

    useEffect(() => {
        if (user && user.id === parseInt(group.organizerId)) setOrganizer(true);
        else setOrganizer(false);

    //     // if (event.id === parseInt(eventId)) setLoaded(true);
    //     // else setLoaded(false)
    let arr = event.EventImages.map(images => images)
    console.log('array', arr)

    //     if(currEventPrev) setPicture(currEventPrev)
    //     else setPicture('https://t3.ftcdn.net/jpg/04/62/93/66/360_F_462936689_BpEEcxfgMuYPfTaIAOC1tCDurmsno7Sp.jpg');

    //     setCurrGroupPrev(location.state.image)
    }, [group, user])

    const groupDetails = () => {

        if (location.state.groupId) {
            setCurrGroupId(group.id)
            setCurrGroupPrev(location.state.image);
            setGroupLoaded(false);
            setEventLoaded(false);
            setLoaded(false)
            navigate(`/groups/${group.id}`)
        } else navigate(`/groups/${currGroupId}`)
    }

    return (
        <div className='individual'
            hidden={!loaded}>
            <div className='headliner'>
                <Link to='/events'>{`<-- Events`}</Link>
                <h1>{`${event.name}`}</h1>
                <h4>{`Hosted by: ${group?.Organizer.firstName} ${group?.Organizer.lastName}`}</h4>
            </div>
            <div className='img-info'>
                <div>
                    <img src={event ? `${event.EventImages}` : ''} />
                    {/* {picture && picture === '' ? (<h1>Loading...</h1>) : ( <img src={picture} />)} */}
                </div>
                <div>
                    <div className='group-section' onClick={() => groupDetails()}>
                        <img src={`${location.state.image}`} />
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
