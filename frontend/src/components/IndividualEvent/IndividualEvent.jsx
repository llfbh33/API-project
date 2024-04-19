import './IndividualEvent.css'
import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import * as eventByIdActions from '../../store/eventById';
import { Link } from 'react-router-dom';

function IndividualEvent() {
    const {eventId} = useParams();
    const dispatch = useDispatch();
    const [loaded, setLoaded] = useState(true);
    let event = useSelector(state => state.eventById)

    useEffect(() => {
        dispatch(eventByIdActions.getEventDetails(eventId))
        .then(() => {
            setLoaded(false)
    })

    }, [dispatch, eventId, loaded])

    console.log('event', event)

    return (
        <div className='individual'
            hidden={loaded}>
            <div className='headliner'>
                <Link to='/'>{`<-- Events`}</Link>
                <h1>{`${event.name}`}</h1>
                <h4>Event host - this is either the organizer or cohost</h4>
            </div>
            <div>
                <div className='img-info'>
                    <img src={event.EventImages ? `${event.EventImages[0].url}` : '' } />
                    <div className='event-info'>

                        <h3>{`Start Date: ${event.startDate}`}</h3>
                        <h3>{`End Date: ${event.endDate}`}</h3>
                        <h3>{`Price: $${event.price}`}</h3>
                        <h3>{`Location: ${event.Venue.address}`}</h3>
                        <h3>{`${event.Venue.city}, ${event.Venue.state}`}</h3>
                    </div>
                </div>

            </div>
        </div>
    )
}


export default IndividualEvent;
