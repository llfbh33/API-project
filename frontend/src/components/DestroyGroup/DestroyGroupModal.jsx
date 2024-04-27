// import { useEffect, useState } from 'react';
// import * as sessionActions from '../../store/session';
import { useDispatch } from 'react-redux';
import { useModal } from '../../context/Modal';
import '../LoginFormModal/LoginForm.css';
// import { useRef } from 'react';
import * as groupActions from '../../store/group';
import * as eventActions from '../../store/events';
import { useNavigate } from 'react-router-dom';
// import { ApplicationContext } from '../../context/GroupContext';
// import { useContext } from 'react';
import './DestroyGroup.css'
import { useParams } from 'react-router-dom';


function DestroyGroupModal() {
  const dispatch = useDispatch();
  const {groupId} = useParams();
//   const [credential, setCredential] = useState("");
//   const [password, setPassword] = useState("");
//   const [errors, setErrors] = useState('');
  const { closeModal } = useModal();
  const navigate = useNavigate();
//   const { currGroupId, setCurrGroupId } = useContext(ApplicationContext)


  const destroyGroup = (e) => {
    e.preventDefault();
    dispatch(groupActions.destroyGroup(groupId))
    .then(closeModal)
    .then(() => {
        dispatch(groupActions.getGroups())
    })
    .then(() => {
        dispatch(eventActions.getEvents())
    })
    .then(() => {
        navigate('/groups')
    })
  };

  return (
    <div className='modal'>
      <h1>Confirm Delete</h1>
      <h3>Are you sure you want to remove this group?</h3>
        <div className='btn-container-destroy'>
            <div>
                <button className=' delete'
                    onClick={destroyGroup} >Yes (Delete Group)</button>
            </div>
            <div>
                <button className='keep'
                    onClick={closeModal} >No (Keep Group)</button>
            </div>
        </div>
    </div>
  );
}

export default DestroyGroupModal;
