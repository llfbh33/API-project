import { useContext, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import * as groupActions from '../../store/group';
import { useNavigate } from "react-router-dom";
import { ApplicationContext } from "../../context/GroupContext";

import './UpdateGroup.css'



function UpdateGroup() {
    // const {groupId} = useParams();
    const user = useSelector(state => state.session.user)
    const dispatch = useDispatch();
    const navigate = useNavigate();
    let thisGroup = useSelector(state => state.groupById)
    const [location, setLocation] = useState(`${thisGroup.city}, ${thisGroup.state}`);
    const [name, setName] = useState(thisGroup.name);
    const [about, setAbout] = useState(thisGroup.about);
    const [type, setType] = useState(thisGroup.type);
    const [isPrivate, setIsPrivate] = useState(thisGroup.private);
    const [errors, setErrors] = useState('');
    const [loaded, setLoaded] = useState(false);


    const {setCurrGroupId} = useContext(ApplicationContext);

    let validationErrors = {};

    useEffect(() => {
        if (Object.keys(thisGroup).length) {
            setLoaded(true)
            if (loaded && !user || user.id !== thisGroup.organizerId) {
                navigate('/')
            }
        }

    }, [thisGroup, loaded, user])

    const handleSubmit = (e) => {
        e.preventDefault();

        const cityStateArr = location.split(',')

        dispatch(
            groupActions.editGroup(thisGroup.id, {
                name,
                about,
                type,
                isPrivate: isPrivate === 'private' ? true : false,
                city: cityStateArr[0],
                state: cityStateArr[1]
            })
        )
        .catch(async (res) => {
            const data = await res.json()
            if(data.errors) {
                validationErrors = data.errors;
                setErrors(validationErrors)
            }
        })
        .then(() => {
            dispatch(groupActions.getGroups())
        })
        .then(() => {

            if(!Object.values(validationErrors).length) {
                setCurrGroupId(thisGroup.id);
                setLoaded(false);
                navigate(`/groups/${thisGroup.id}`);
            }
        })
    }

    return (
        <div className="create-group">
            <form onSubmit={handleSubmit} >
                <h1>Update your Group</h1>
                <div>
                    <h2>{`Set your group's location`}</h2>
                    <div>
                        <label>Meet Dogs groups meet locally, in person, and online. Well connect you with people in your area</label>
                        <input
                            type='text'
                            value={location}
                            placeholder="City, STATE"
                            onChange={(e) => setLocation(e.target.value)}
                            required
                        />
                        <p style={{color: 'red'}}>{errors.city ? `${errors.city}` : ''}</p>
                        <p style={{color: 'red'}}>{errors.state ? `${errors.state}` : ''}</p>
                    </div>
                </div>
                <div>
                    <h2>{`What will your group's name be?`}</h2>
                    <div>
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
                        <label>{` 3. What will you do at your events?`}</label>
                        <div>
                            <p>{`People will see this when we promote your group, but you'll be able to add to it later, too.`}</p>
                            <ol>
                                <li>{`1. What's the purpose of the group?`}</li>
                                <li>2. Who should join?</li>
                                <li>3. What will you do at your events?</li>
                            </ol>
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
                <div>
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
                <div>
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
                <button type='submit' >Update Group</button>
            </form>

        </div>
    )
}

export default UpdateGroup;
