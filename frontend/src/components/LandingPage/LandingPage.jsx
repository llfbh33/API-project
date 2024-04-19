import { useNavigate } from "react-router-dom";

const LandingPage = () => {
    const navigate = useNavigate();

    return (
        <div style={{backgroundColor: 'white'}}>
            <h1>landing page</h1>
            <h2> This page will have four vertically allinged sections</h2>
            <p> It looks like the sections are:</p>
            <ul>
                <li>Title and intro text left, infographic right(changing pics of dogs and activities?)</li>
                <li>Subtitle and caption centered on the page</li>
                <li>Three columns with links for see all groups, find an event, and start a group</li>
                <li>And a join button</li>
            </ul>
            <p> layout and positioning should be equivalent to the wireframes</p>
            <button>Join Meet Dogs</button>
            <button onClick={() => navigate('/groups')}>All Groups</button>
        </div>
    )
}

export default LandingPage;
