import { useSelector } from "react-redux";
import './Events.css';

import { useNavigate } from "react-router-dom";



function Events() {

    const navigate = useNavigate();

    const eventsList = useSelector(state => state.events)
    const events = Object.values(eventsList)

    const organizeEvents = () => {
        let dates = []
        let sorted = [];
        let expired = [];
        let curr = [...events]
        if(curr) {
            curr.forEach(event => dates.push(event.startDate))
            dates.sort()
            dates.forEach(date => {
                let currEvent = curr.find(event => event.startDate === date)
                if(new Date(currEvent.startDate).getTime() < new Date().getTime()) expired.push(currEvent)
                else sorted.push(currEvent)
                curr.splice(curr.indexOf(currEvent), 1)
            })
        }
        if (expired) {
            expired.forEach(event => sorted.push(event));
        }
        return sorted;
    }

    const seeEvent = (eventId, groupId) => {
        localStorage.eventId = eventId
        localStorage.groupId = groupId
        navigate(`/loadingEvent/${eventId}/${groupId}`)
    }

    return (
        <div className="main-container">
            <div >
                <div className='events-title'>
                    <h1>Events</h1>
                    <h3> · </h3>
                    <h2 onClick={() => navigate('/groups')}>Groups</h2>
                </div>
                <h1 className="events-title-caption">Events in Meet Dogs</h1>
                </div>
                <div className="events-container">
                {organizeEvents().map(event => (
                    <div key={`${event?.id}`} className='event-card-container' onClick={() => seeEvent(event.id, event.groupId)}>
                        <div className='event-details-main-container' >
                            <div className='event-img-container'>
                                <img  src={event?.previewImage ? `${event.previewImage}` : 'https://t3.ftcdn.net/jpg/04/62/93/66/360_F_462936689_BpEEcxfgMuYPfTaIAOC1tCDurmsno7Sp.jpg'}/>
                            </div>
                            <div className='top-event-details-container'>
                                <div  className='event-details-container'>
                                    <h3>{`${event?.name}`}</h3>
                                    <h4 className="dates">{event?.startDate ? `Start Date: ${new Date(event.startDate).toDateString()} · ${new Date(event.startDate).toLocaleTimeString('en-US')}` : ''}</h4>
                                    <h4 className="city-state">{event ?`${event?.Venue.city}, ${event?.Venue.state}` : ''}</h4>
                                </div>
                            </div>
                        </div>
                    <p className="description">{event.description ? `${event.description}` : ''}</p>
                    </div>
                ))}
            </div>
        </div>
    )
}

export default Events;
