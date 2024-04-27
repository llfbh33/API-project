// import { useEffect, useState } from 'react';
// import * as sessionActions from '../../store/session';
import { useDispatch, useSelector } from 'react-redux';
import { useModal } from '../../context/Modal';
import '../LoginFormModal/LoginForm.css';
// import { useRef } from 'react';
import * as groupActions from '../../store/group';
import * as eventActions from '../../store/events';
import { useNavigate } from 'react-router-dom';
// import { ApplicationContext } from '../../context/GroupContext';
// import { useContext } from 'react';
import './DestroyEvent.css'
import { useParams } from 'react-router-dom';



function DestroyEventModal() {
  const dispatch = useDispatch();
  const {eventId} = useParams();
  const { closeModal } = useModal();
  const navigate = useNavigate();
  const group = useSelector(state => state.groupById)
  const event = useSelector(state => state.event)

  const destroyEvent = (e) => {
    e.preventDefault();
    console.log(event)
    dispatch(eventActions.destroyEvent(eventId ? eventId : event.id))
    .then(closeModal)
    .then(() => {
        dispatch(eventActions.getEvents())
    })
    .then(() => {
        dispatch(groupActions.getGroups())
    })
    .then(() => {
        navigate(`/groups/${group.id}`)
    })
  };

  return (
    <div className='modal'>
      <h1>Confirm Delete</h1>
      <h3>Are you sure you want to remove this event?</h3>
        <div className='btn-container-destroy'>
            <div>
                <button className=' delete'
                    onClick={destroyEvent} >Yes (Delete Event)</button>
            </div>
            <div>
                <button className='keep'
                    onClick={closeModal} >No (Keep Event)</button>
            </div>
        </div>
    </div>
  );
}

export default DestroyEventModal;
