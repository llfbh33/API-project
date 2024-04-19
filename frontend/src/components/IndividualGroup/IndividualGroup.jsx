import { useSelector } from 'react-redux';
import './IndividualGroup.css';
import { Link, useParams } from 'react-router-dom';
import { useState } from 'react';
import { useEffect } from 'react';

// need to fix the groups to come in as an object instead of an array for better time complexity

function IndividualGroup() {
    const {groupId} = useParams();
    const group = useSelector(state => state.groups[parseInt(groupId) -1])
    const user = useSelector(state => state.session.user);

    const [organizer, setOrganizer] = useState(false);

    useEffect(() => {
        if (user.id === group.organizerId) setOrganizer(true)

    }, [organizer, user, group.organizerId])

    return (
        <div>
            individual info {`${groupId} ${group.name}`}
            <Link to='/groups'>Groups</Link>
            <img src={`${group.previewImage}`} />
            <h1>{`${group.name}`}</h1>
            <p>{`${group.city} ${group.state}`}</p>
            <p>number of events</p>
            <p>{group.private ? 'Private' : 'Public'}</p>
            <p>Organized by: first name, last name</p>
            <button style={{backgroundColor: 'red'}}
                hidden={user && !organizer ? false : true}
                onClick={() => alert('Feature Coming Soon')}
                >Join This Group</button>
            <h2>{`What We're About`}</h2>
            <p>{`${group.about}`}</p>
            <p>List Groups Events</p>
            <button className='org-btn'
                hidden={!organizer}
                >Create Event
            </button>
            <button className='org-btn'
                hidden={!organizer}
                >Update
            </button>
            <button className='org-btn'
                hidden={!organizer}
                >Delete
            </button>
        </div>
    )
}


export default IndividualGroup
