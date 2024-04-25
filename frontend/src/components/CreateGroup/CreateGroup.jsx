import { useContext, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import * as groupActions from '../../store/group';
import * as groupImageActions from '../../store/imageByGroupId';
import { useNavigate } from "react-router-dom";
import { ApplicationContext } from "../../context/GroupContext";

import './CreateGroup.css';


function CreateGroup() {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [location, setLocation] = useState('');
    const [name, setName] = useState('');
    const [about, setAbout] = useState('');
    const [url, setUrl] = useState('');
    const [type, setType] = useState('');
    const [isPrivate, setIsPrivate] = useState('');
    const [errors, setErrors] = useState('');
    const [loaded, setLoaded] = useState(false)

    let getGroups = useSelector(state => state.groups)
    let groups = Object.keys(getGroups)
    let thisIsIt = groups[groups.length - 1]


    const {setCurrGroupId, setCurrGroupPrev} = useContext(ApplicationContext);

    let validationErrors = {};


    useEffect(() => {
        if (loaded === true) completeSubmit()
    }, [loaded])

    const completeSubmit= () => {

        setErrors('');
        setCurrGroupId(thisIsIt);
        dispatch(
            groupImageActions.postGroupImages(thisIsIt,
                {url, preview: true}))
        .then(() => {
            setCurrGroupPrev(url);
            setLocation('');
            setName('');
            setAbout('');
            setUrl('');
            setType('');
            setIsPrivate('');
            navigate(`/groups/${thisIsIt}`);
        })
    }

    const handleSubmit = (e) => {
        e.preventDefault();

        const cityStateArr = location.split(',')

        dispatch(
            groupActions.createGroup({
                name,
                about,
                type,
                isPrivate: isPrivate === 'private' ? true : false,
                city: cityStateArr[0],
                state: cityStateArr[1]
            })
        )
        .then(() => {
            dispatch(groupActions.getGroups())  // still loaded without this but may still need it
        })
        .then(() => {
            setLoaded(true);
        })
    }

    return (
        <div className="create-group">
            <form onSubmit={handleSubmit} >
                <h1>Start a new Group</h1>
                <div className="sec-one">
                    <h2>{`Set your group's location`}</h2>
                    {/* <div  > */}
                        <label>Meet Dogs groups meet locally, in person, and online. Well connect you with people in your area</label>
                        <input
                            type='text'
                            value={location}
                            placeholder="City, STATE"
                            onChange={(e) => setLocation(e.target.value)}
                            required
                        />
                        {/* <p style={{color: 'red'}}>{errors.city ? `${errors.city}` : ''}</p> */}
                        <p style={{color: 'red'}}>{errors.state ? `${errors.state}` : ''}</p>
                    {/* </div> */}
                </div>
                <div>
                    <h2>{`What will your group's name be?`}</h2>
                    <div className="sec-one">
                        <label>Choose a name that will give people a clear idea of what the group is about. Feel free to get creative! You can edit this later if you change your mind.</label>
                        <input
                            type='text'
                            value={name}
                            placeholder="What is your group name?"
                            onChange={(e) => setName(e.target.value)}
                            required
                        />
                        <p style={{color: 'red'}}>{errors.name ? `${errors.name}` : ''}</p>
                    </div>
                </div>
                <div>
                    <h2>{`"Describe the purpose of your group."`}</h2>
                    <div>
                        <div>
                            <p>{`People will see this when we promote your group, but you'll be able to add to it later, too.`}</p>
                            <div>
                                <p>{`1. What's the purpose of the group?`}</p>
                                <p>2. Who should join?</p>
                                <p>3. What will you do at your events?</p>
                            </div>
                        </div>
                        <textarea
                            value={about}
                            placeholder="Please write at least 30 characters"
                            onChange={(e) => setAbout(e.target.value)}
                            required
                            rows='5'
                        />
                        <p style={{color: 'red'}}>{errors.about ? `${errors.about}` : ''}</p>
                    </div>
                </div>
                <div className="sec-one">
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
                <div className="sec-one">
                    <label>Is this group private or public?</label>
                    <select
                        value={isPrivate}
                        onChange={(e) => setIsPrivate(e.target.value)}
                        >
                        <option value={''} disabled>Choose One</option>
                        <option>Private</option>
                        <option>Public</option>
                    </select>
                    <p style={{color: 'red'}}>{errors.private ? `${errors.private}` : ''}</p>
                </div>
                <div className="sec-one">
                    <label>Please add an image URL for your group below:</label>
                    <input
                        type='text'
                        value={url}
                        placeholder="Image Url"
                        onChange={(e) => setUrl(e.target.value)}
                        required
                    />
                </div>
                <button type='submit' className="sub-btn">Create Group</button>
            </form>

        </div>
    )
}

export default CreateGroup;
