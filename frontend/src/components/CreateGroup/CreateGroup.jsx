import { useState } from "react";



function CreateGroup() {

    const [location, setLocation] = useState('');
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');

    return (
        <div>
            <form>
                <h1>Start a new Group</h1>
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
                    </div>
                </div>
                <div>
                    <h2>{`"Describe the purpose of your group."`}</h2>
                    <div>
                        <label>{`People will see this when we promote your group, but you'll be able to add to it later, too. 1. What's the purpose of the group? 2. Who should join? 3. What will you do at your events?`}</label>
                        <textarea
                            value={description}
                            placeholder="Please write at least 30 characters"
                            onChange={(e) => setDescription(e.target.value)}
                            required
                        />
                    </div>
                </div>
                <button type='submit' >Create Group</button>
            </form>

        </div>
    )
}

export default CreateGroup;


// I may want to set this up more like the login and signup forms  it will make it easier to clear when navigating away
