import { useSelector } from 'react-redux';
import './IndividualGroup.css';
import { Link, useParams } from 'react-router-dom';
import { useState } from 'react';
import { useEffect } from 'react';


// need to fix the groups to come in as an object instead of an array for better time complexity

function IndividualGroup() {
    const {groupId} = useParams();
    const group = useSelector(state => state.groups[groupId])
    const user = useSelector(state => state.session.user);
    const events = useSelector(state => state.events)
    const currEvents = Object.values(events)
                .filter(event => event.groupId === parseInt(groupId))

    const [organizer, setOrganizer] = useState(false);

    useEffect(() => {
        if (user.id === group.organizerId) setOrganizer(true)

    }, [organizer, user, group.organizerId])

    return (
        <div className='individual'>
            individual info {`${groupId} ${group.name}`}
            <Link to='/groups'>Groups</Link>
            <img src={`${group.previewImage}`} />
            <h1>{`${group.name}`}</h1>
            <p>{`${group.city} ${group.state}`}</p>
            <p>{`Events: ${currEvents.length} `}{group.private ? 'Private' : 'Public'}</p>

            <p>Organized by: first name, last name</p>
            <button style={{backgroundColor: 'red'}}
                hidden={user && !organizer ? false : true}
                onClick={() => alert('Feature Coming Soon')}
                >Join This Group</button>
            <h2>{`What We're About`}</h2>
            <p>{`${group.about}`}</p>
            <button className='org-btn'
                hidden={!organizer}
                >Create Event
            </button>
            <div>
                {currEvents.map(event => (
                    <div key={`${event.id}`}>
                        <div>
                            <img src={`${event.previewImage}`} />
                        </div>
                        <div>
                            <p>{`${event.name}`}</p>
                            <p>{`${event.startDate}`}</p>
                            <p>{`Venue Id ${event.venueId}`}</p>
                        </div>
                        <button className='org-btn'
                            hidden={!organizer}
                            >Update
                        </button>
                        <button className='org-btn'
                            hidden={!organizer}
                            >Delete
                        </button>
                    </div>
                ))}
            </div>
        </div>
    )
}


export default IndividualGroup
