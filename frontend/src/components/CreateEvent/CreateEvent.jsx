import { useContext, useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import * as eventActions from '../../store/events';
import * as eventImageActions from '../../store/imagesByEventId';
import * as groupActions from '../../store/groupById';
import * as groupsActions from '../../store/group';
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

    let group = useSelector(state => state.groupById);

    const [errors, setErrors] = useState('');
    const events = useSelector(state => state.events);

    let validationErrors = {};
    const [eventId, setEventId] = useState('');

    useEffect(() => {
        let lastEvent = Object.values(events)
        console.log('lastEvent:', lastEvent)
        let again = lastEvent.length - 1
        console.log('again:', again)
        let lastEventEle = Object.values(events)[again]
        console.log('lastEventEle:', lastEventEle)
        let identity = lastEventEle.id + 1;
        console.log('identity', identity)
        setEventId(identity)
    }, [])

    useEffect(() => {
        dispatch(groupActions.getGroupDetails(groupId))
        .then(() => {
            setCurrGroupId(group.id)
        })
    }, [dispatch])

    // const adjustStartTime = () => {
    //     let thisDate = startDate;

    //     setEventId(identity);

    //     let start = thisDate.split(', ');
    //     let dateArr = start[0].split('/')
    //     let date = `${dateArr[2]}-${dateArr[0]}-${dateArr[1]}`;
    //     let amPm = start[1].slice(6)
    //     let minutes = start[1].slice(3, 5)
    //     let hour = parseInt(start[1].slice(0, 2))
    //     if (hour.length < 2) hour = `0${hour}`
    //     if (amPm.toUpperCase() === 'PM') hour += 12;
    //     let adjustedTime = `${hour}:${minutes}`
    //     let startReturn = `${date} ${adjustedTime}:00`
    //     console.log('start', startReturn)
    //     setStartDate(startReturn)
    //     return adjustEndTime()
    // }

    // const adjustEndTime = () => {
    //     let thisDate = endDate;

    //     let start = thisDate.split(', ');
    //     let dateArr = start[0].split('/')
    //     let date = `${dateArr[2]}-${dateArr[0]}-${dateArr[1]}`;
    //     let amPm = start[1].slice(6)
    //     let minutes = start[1].slice(3, 5)
    //     let hour = parseInt(start[1].slice(0, 2))
    //     if (amPm.toUpperCase() === 'PM') hour += 12;
    //     let adjustedTime = `${hour}:${minutes}`
    //     let startReturn = `${date} ${adjustedTime}:00`
    //     console.log('end', startReturn)
    //     setEndDate(startReturn)
    //     console.log(endDate)
    //     return handleSubmit()

    // }

    const handleSubmit = (e) => {
        e.preventDefault();
        setErrors('');

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
            dispatch(groupsActions.getGroups())
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
