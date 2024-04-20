import { useContext, useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import * as eventActions from '../../store/events';
import * as eventImageActions from '../../store/imagesByEventId';
import * as groupActions from '../../store/groupById';
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { ApplicationContext } from "../../context/GroupContext";

import './CreateEvent.css';

function CreateEvent() {
    const {groupId} = useParams();
    const location = useLocation();
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [name, setName] = useState('');
    const [type, setType] = useState('');
    const [price, setPrice] = useState('0');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('')
    const [about, setAbout] = useState('');
    const [url, setUrl] = useState('');
    const {currGroupId, setCurrGroupId, setCurrEventPrev} = useContext(ApplicationContext);
    // const [groupId] = useState(location.state.gId)
    let group = useSelector(state => state.groupById);

    const [errors, setErrors] = useState('');
    const events = useSelector(state => state.events);

    const [eventId] = useState(Object.values(events).length + 1); // this will need to change before we set up delete

    let validationErrors = {};

    useEffect(() => {
        dispatch(groupActions.getGroupDetails(groupId))
        .then(() => {
            console.log('currGroup', currGroupId)
            setCurrGroupId(group.id)
            console.log('currGroup after', currGroupId)
        })
    }, [dispatch])

    const adjustStartTime = () => {
        let start = startDate.split(', ');
        let amPm = start[1].slice(6)
        let minutes = start[1].slice(3, 5)
        let hour = parseInt(start[1].slice(0, 2))
        if (amPm.toUpperCase() === 'PM') hour += 12;
        let adjustedTime = `${hour}:${minutes}`
        let startReturn = `${start[0]} ${adjustedTime}:00`
        console.log(startReturn)
        setStartDate(startReturn)
        return
    }

    const adjustEndTime = () => {
        let start = endDate.split(', ');
        let amPm = start[1].slice(6)
        let minutes = start[1].slice(3, 5)
        let hour = parseInt(start[1].slice(0, 2))
        if (amPm.toUpperCase() === 'PM') hour += 12;
        let adjustedTime = `${hour}:${minutes}`
        let startReturn = `${start[0]} ${adjustedTime}:00`
        console.log(startReturn)
        setEndDate(startReturn)
        return
    }

    const handleSubmit = (e) => {
        e.preventDefault();
        setErrors('');

        adjustStartTime()
        adjustEndTime()

        dispatch(

            eventActions.createEvent(currGroupId, eventId, {
                venueId: '1',
                name,
                type,
                capacity: 10,
                price: price || '0',
                description: about,
                startDate,
                endDate
            })
        )
        .then(() => {
            dispatch(
                eventImageActions.postEventImages(eventId,
                    {url, preview: true}))

        })
        .catch(async (res) => {
            const data = await res.json()
            console.log('data', data)
            if(data.errors) {
                validationErrors = data.errors;
                setErrors(validationErrors)
            }
        })
        .then(() => {
            dispatch(eventActions.getEvents())
        })
        .then(() => {
            console.log(location.state.id)
                if(!Object.values(validationErrors).length) {
                    setCurrEventPrev(url)
                    setName('');
                    setType('');
                    setPrice('');
                    setStartDate('');
                    setEndDate('');
                    setAbout('');
                    setUrl('');
                    navigate(`/events/${eventId}`, {state: {
                                                    id: group.organizerId,
                                                    firstName: location.state.firstName,
                                                    lastName: location.state.lastName,
                                                    name: group.name,
                                                    image: location.state.image,
                                                    city: location.state.city,
                                                    state: location.state.state,
                                                    groupId: location.state.gId
                                                    }});
                }
        })
    }

    return (
        <div className="create-event">
            <form onSubmit={handleSubmit} >
                <h1>Create a New Event for {`${group.name}`}</h1>
                <div className="combo">
                    <label>What is the name of your event?</label>
                    <input
                        type='text'
                        value={name}
                        placeholder="Event Name"
                        onChange={(e) => setName(e.target.value)}
                        required
                    />
                    <p style={{color: 'red'}}>{errors.name ? `${errors.name}` : ''}</p>
                </div>
                <div className="combo">
                    <label>Is this an in-person or online group?</label>
                    <select
                        value={type}
                        onChange={(e) => setType(e.target.value)}
                        >
                        <option value={''} disabled>Choose One</option>
                        <option>In person</option>
                        <option>Online</option>
                    </select>
                    <p style={{color: 'red'}}>{errors.type ? `${errors.type}` : ''}</p>
                </div>
                <div className="combo">
                    <label>What is the price for your event?</label>
                    <input
                        type='number'
                        value={price}
                        onChange={(e) => setPrice(e.target.value)}
                        required
                    />
                    <p style={{color: 'red'}}>{errors.name ? `${errors.name}` : ''}</p>
                </div>
                <div className="combo">
                    <label>When does your event start?</label>
                    <input
                        type='text'
                        value={startDate}
                        placeholder="MM/DD/YYYY, HH/mm AM"
                        onChange={(e) => setStartDate(e.target.value)}
                        required
                    />
                    <p style={{color: 'red'}}>{errors.name ? `${errors.name}` : ''}</p>
                </div>
                <div className="combo">
                    <label>When does your event end?</label>
                    <input
                        type='text'
                        value={endDate}
                        placeholder="MM/DD/YYYY, HH/mm PM"
                        onChange={(e) => setEndDate(e.target.value)}
                        required
                    />
                    <p style={{color: 'red'}}>{errors.name ? `${errors.name}` : ''}</p>
                </div>
                <div className="combo">
                    <label>Please add an image URL for your event below:</label>
                    <input
                        type='text'
                        value={url}
                        placeholder="Image Url"
                        onChange={(e) => setUrl(e.target.value)}
                        required
                    />
                </div>
                <div className="combo">
                    <label>Please describe your event</label>
                    <textarea
                        value={about}
                        placeholder="Please include at least 30 characters"
                        onChange={(e) => setAbout(e.target.value)}
                        required
                        rows='8'
                    />
                    <p style={{color: 'red'}}>{errors.about ? `${errors.about}` : ''}</p>
                </div>
                <div className="create-btn">
                    <button type='submit' >Create Event</button>
                </div>
            </form>

        </div>
    )
}

export default CreateEvent;
