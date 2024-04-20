import { useContext, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import * as eventActions from '../../store/events';
import * as eventImageActions from '../../store/imagesByEventId';
import { useLocation, useNavigate } from "react-router-dom";
import { ApplicationContext } from "../../context/GroupContext";

function CreateEvent() {
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
    const {groupId} = useContext(ApplicationContext);
    // const [groupId] = useState(location.state.gId)

    const [errors, setErrors] = useState('');
    const events = useSelector(state => state.events);

    const [eventId] = useState(Object.values(events).length + 1);
    let validationErrors = {};

    // console.log(location.state.id) // does have the id in it

    const handleSubmit = (e) => {
        e.preventDefault();
        // console.log(groupId, location.state.groupName)

        dispatch(
            eventActions.createEvent(groupId, eventId, {
                venueId: 1,
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
            setErrors('');
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
            console.log(location.state.id)
                if(!Object.values(validationErrors).length) {
                    setName('');
                    setType('');
                    setPrice('');
                    setStartDate('');
                    setEndDate('');
                    setAbout('');
                    setUrl('');
                    navigate(`/events/${eventId}`, {state: {
                                                    id: location.state.id,
                                                    firstName: location.state.firstName,
                                                    lastName: location.state.lastName,
                                                    name: location.state.name,
                                                    image: location.state.image,
                                                    city: location.state.city,
                                                    state: location.state.state,
                                                    groupId: location.state.gId
                                                    }});
                }
        })
    }

    return (
        <div>
            <form onSubmit={handleSubmit}>
                <h1>Create a New Event for {`${location.state.groupName}`}</h1>
                <div>
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
                <div>
                    <label>Is this an in-person or online group?</label>
                    <select
                        value={type}
                        onChange={(e) => setType(e.target.value)}
                        >
                        <option>In person</option>
                        <option>Online</option>
                    </select>
                    <p style={{color: 'red'}}>{errors.type ? `${errors.type}` : ''}</p>
                </div>
                <div>
                    <label>What is the price for your event?</label>
                    <input
                        type='number'
                        value={price}
                        onChange={(e) => setPrice(e.target.value)}
                        required
                    />
                    <p style={{color: 'red'}}>{errors.name ? `${errors.name}` : ''}</p>
                </div>
                <div>
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
                <div>
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
                <div>
                    <label>Please add an image URL for your event below:</label>
                    <input
                        type='text'
                        value={url}
                        placeholder="Image Url"
                        onChange={(e) => setUrl(e.target.value)}
                        required
                    />
                </div>
                <div>
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
                <button type='submit' >Create Event</button>
            </form>

        </div>
    )
}

export default CreateEvent;
