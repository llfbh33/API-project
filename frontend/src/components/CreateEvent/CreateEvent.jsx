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
        if (name.length < 1) validationErrors.name = "Name is required";
        if (about.length < 30) validationErrors.about = "Description must be at least 30 characters long";
        if (!type) validationErrors.type = "Event Type is required";
        if (price < 0) validationErrors.price = "Price is invalid";
        if (price.length < 0) validationErrors.price = "Price is Required"
        if (startDate.split('/').length !== 4
            || startDate.split(',').length !== 2
            || startDate.length !== 20
            || (!startDate.toUpperCase().endsWith('AM')
                && !startDate.toUpperCase().endsWith('PM'))) {
                    validationErrors.startDate = 'Provide a start date with the indicated format';
                }
        if (startDate.length < 1) validationErrors.startDate = "Event start is required"
        if (endDate.includes (',')) {
            if (!checkStartDate(startDate)) validationErrors.startDate = 'Start date must be in the future'
        }
        if (endDate.split('/').length !== 4
            || endDate.split(',').length !== 2
            || endDate.length !== 20
            || (!endDate.toUpperCase().endsWith('AM')
                && !endDate.toUpperCase().endsWith('PM'))) {
                    validationErrors.endDate = 'Provide a start date with the indicated format';
                }
        if (endDate.includes (',')) {
            if (!checkEndDate(endDate, startDate)) validationErrors.endDate = 'End date must be after start date'
        }
        if (endDate.length < 1) validationErrors.startDate = "Event end is required"
        if (!url.includes('.png') && !url.includes('.jpg') && !url.includes('.jpeg')) {
            validationErrors.url = "Image URL must end in .png, .jpg, or .jpeg"
        }
        setErrors(validationErrors);
    }, [name, price, type, about, startDate, endDate, url])


    useEffect(() => {
        dispatch(groupActions.getGroupDetails(parseInt(groupId)))
        .then(() => {
            setCurrGroupId(group.id)
            console.log(group)
        })
    }, [dispatch])

    const checkStartDate = (givenTime) => {
        let resDate = givenTime;
        let dateArr = resDate.split(',');
        let date = dateArr[0].replaceAll('/', '-')

        const curr = new Date().getTime();
        const given = new Date(date).getTime();
        if (given < curr) {
            return false
        }
        return true
    }

    const checkEndDate = (givenTime, givenStartTime) => {

        let resDate = givenTime;
        let dateArr = resDate.split(',');
        let date = dateArr[0].replaceAll('/', '-')
        let time = dateArr[1].replaceAll('/', ':')

        let resStartDate = givenStartTime;
        let startArr = resStartDate.split(',');
        let startDate = startArr[0].replaceAll('/', '-')
        let startTime = startArr[1].replaceAll('/', ':')

        let start = new Date(startDate + startTime).getTime();
        let end = new Date(`${date} ${time}`).getTime();
        if (end <= start ) {
            return false
        }
        return true
    }

    const adjustTime = (givenTime) => {
        let resDate = givenTime;
        let dateArr = resDate.split(',');
        let date = dateArr[0].replaceAll('/', '-')
        let time = dateArr[1].replaceAll('/', ':')

        console.log('after adjust function', `${date} ${time}`)
        return `${date} ${time}`
    }

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
            console.log('included events', getEvents)
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

                eventActions.createEvent(group.id, {
                    venueId: 1,
                    name,
                    type,
                    capacity: 10,
                    price: price || '0',
                    description: about,
                    startDate: adjustTime(startDate),
                    endDate: adjustTime(endDate)
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
            <div className="create-group-inner">
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
                        <p style={{color: 'red'}}>{hasSubmitted && errors.startDate ? `${errors.startDate}` : ''}</p>
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
                        <p style={{color: 'red'}}>{hasSubmitted && errors.endDate ? `${errors.endDate}` : ''}</p>
                    </div>
                    <div className="combo">
                        <label>Please add an image URL for your event below:</label>
                        <input
                            type='url'
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
        </div>
    )
}

export default CreateEvent;
