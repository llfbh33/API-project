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

    return (
        <div>
            <div>
                <div className='groups-title'>
                    <h1 style={{textDecoration: 'underline'}}>Events</h1>
                    <h1 style={{color: '#525151'}}>Groups</h1>
                </div>
                <h3>Events in Meet Dogs</h3>
            </div>
            <div>
                {organizeEvents().map(event => (
                    <div key={`${event?.id}`} className='event-list' onClick={() => navigate(`/loadingEvent/${event.id}/${event.groupId}`)}>
                    <div className='event-top-sec' >
                        <div>
                            <img src={event?.previewImage ? `${event.previewImage}` : 'https://t3.ftcdn.net/jpg/04/62/93/66/360_F_462936689_BpEEcxfgMuYPfTaIAOC1tCDurmsno7Sp.jpg'} />
                        </div>
                        <div className='event-details'>
                            <div>
`                               <p>{`${event?.name}`}</p>
                                <p>{event?.startDate ? `Start Date: ${new Date(event.startDate).toDateString()} · ${event.startDate.slice(11, 16)}` : ''}</p>
                                <p>{`${event?.Venue.city}, ${event?.Venue.state}`}</p>
                            </div>
                        </div>
                    </div>
                    <p>{event.description ? `${event.description}` : ''}</p>
                </div>
                ))}
            </div>
        </div>
    )
}

export default Events;
