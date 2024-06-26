import { useEffect, useState } from "react"
import { useNavigate, useParams} from "react-router-dom";
import { useDispatch } from "react-redux";

import * as singleGroupAction from '../../store/groupById';
import * as singleEventAction from '../../store/eventById';


const EventsMediator = () => {

    const {eventId, groupId} = useParams();
    console.log('on mediator', eventId, groupId)

    const navigate = useNavigate();
    const dispatch = useDispatch();
    const [loaded, setLoaded] = useState(false);
    const [testLoad, setTestLoad] = useState(false)


    useEffect(() => {
        localStorage.groupId = groupId;
        dispatch(singleEventAction.getEventDetails(eventId))
        .then(() => {
            setTestLoad(true)
        })
        dispatch(singleGroupAction.getGroupDetails(groupId))
        .then(() => {
            setLoaded(true)
        })
    }, [dispatch])

    useEffect(() => {
        if(loaded && testLoad) toEvent();
    }, [loaded, testLoad, groupId, eventId])

    const toEvent = () => {
        setTestLoad(false);
        setLoaded(false);

        navigate(`/events/${eventId}`)
    }

    return (
        <>
            <h1>...loading</h1>
        </>
    )
}

export default EventsMediator
