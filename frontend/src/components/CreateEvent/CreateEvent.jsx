import { useContext, useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import * as eventActions from '../../store/events';
import * as eventImageActions from '../../store/imagesByEventId';
import * as groupActions from '../../store/groupById';
import * as groupsActions from '../../store/group';
import { useNavigate, useParams } from "react-router-dom";
import { ApplicationContext } from "../../context/GroupContext";

import './CreateEvent.css';

function CreateEvent() {
    const {groupId} = useParams();
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [name, setName] = useState('');
    const [type, setType] = useState('');
    const [price, setPrice] = useState('0');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('')
    const [about, setAbout] = useState('');
    const [url, setUrl] = useState('');
    const [hasSubmitted, setHasSubmitted] = useState(false);
    const {setCurrGroupId, setCurrEventPrev} = useContext(ApplicationContext);

    let group = useSelector(state => state.groupById);

    const [errors, setErrors] = useState('');

    const [loaded, setLoaded] = useState(false);
    let getEvents = useSelector(state => state.events)
    let eventKeys = Object.keys(getEvents)
    let thisIsIt = eventKeys[eventKeys.length - 1]

    useEffect(() => {
        const validationErrors = {};
        if (name.length < 5) validationErrors.name = "Name must be atleast 5 characters";
        if (about.length < 50) validationErrors.about = "Description is required";
        if (!type) validationErrors.type = "Type must be 'Online' or 'In person'";
        if (price < 0) validationErrors.price = "Price is invalid";
        if (startDate < 10) validationErrors.startDate = 'Provide a start date in the indicated format';
        if (endDate < 10) validationErrors.endDate = "Provide an end date in the indicated format"
        if (!url.includes('https:')) validationErrors.url = "Provide a valid url"
        setErrors(validationErrors);
    }, [name, price, type, about, startDate, endDate])


    useEffect(() => {
        dispatch(groupActions.getGroupDetails(parseInt(groupId)))
        .then(() => {
            setCurrGroupId(group.id)
        })
    }, [dispatch])

    useEffect(() => {
        if (hasSubmitted) {
            let thisTime = startDate
            let newTime = new Date(thisTime)
            console.log(newTime)
        }
    }, [hasSubmitted])

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

    useEffect(() => {
        if (loaded === true) completeSubmit()
    }, [loaded])

    const completeSubmit = () => {

        setErrors({})

        dispatch(
            eventImageActions.postEventImages(thisIsIt,
                {url, preview: true}))

        .then(() => {
            dispatch(eventActions.getEvents())
        })
        .then(() => {
            dispatch(groupsActions.getGroups())
        })
        .then(() => {

                if(!Object.values(errors).length) {
                    setCurrEventPrev(url)
                    setName('');
                    setType('');
                    setPrice('');
                    setStartDate('');
                    setEndDate('');
                    setAbout('');
                    setUrl('');
                    navigate(`/loadingEvent/${thisIsIt}/${groupId}`)
                }
        })
    }

    const handleSubmit = (e) => {
        e.preventDefault();

        if(Object.values(errors).length) {
            return;
        } else {
            setHasSubmitted(false)
            dispatch(

                eventActions.createEvent(groupId, {
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
                dispatch(eventActions.getEvents())
            })
            .then(() => {
                setLoaded(true)
            })
        }
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
                    <p style={{color: 'red'}}>{hasSubmitted && errors.name ? `${errors.name}` : ''}</p>
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
                    <p style={{color: 'red'}}>{hasSubmitted && errors.type ? `${errors.type}` : ''}</p>
                </div>
                <div className="combo">
                    <label>What is the price for your event?</label>
                    <input
                        type='number'
                        value={price}
                        onChange={(e) => setPrice(e.target.value)}
                        required
                    />
                    <p style={{color: 'red'}}>{hasSubmitted && errors.price ? `${errors.price}` : ''}</p>
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
                    <p style={{color: 'red'}}>{hasSubmitted && errors.name ? `${errors.name}` : ''}</p>
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
                    <p style={{color: 'red'}}>{hasSubmitted && errors.name ? `${errors.name}` : ''}</p>
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
                    <p style={{color: 'red'}}>{hasSubmitted && errors.url ? `${errors.url}` : ''}</p>
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
                    <p style={{color: 'red'}}>{hasSubmitted && errors.about ? `${errors.about}` : ''}</p>
                </div>
                <div className="create-btn">
                    <button type='submit' onClick={() => setHasSubmitted(true)} >Create Event</button>
                </div>
            </form>

        </div>
    )
}

export default CreateEvent;
