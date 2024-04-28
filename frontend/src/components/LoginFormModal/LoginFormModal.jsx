import { useEffect, useState } from 'react';
import * as sessionActions from '../../store/session';
import { useDispatch } from 'react-redux';
import { useModal } from '../../context/Modal';
import './LoginForm.css';

function LoginFormModal() {
  const dispatch = useDispatch();
  const [credential, setCredential] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState('');
  const { closeModal } = useModal();
  const [isDisabled, setIsDisabled] = useState(true);

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsDisabled(true);
    setErrors('');
    return dispatch(sessionActions.login({ credential, password }))
      .then(closeModal)
      .catch(async (res) => {
        const data = await res.json();
        if (data && data.message) {
          setErrors(data.message);
        }
      });
  };

  const demoLogin = (e) => {
    e.preventDefault();
    return dispatch(sessionActions.login({ credential: 'Second-Test-User', password: 'password2' }))
      .then(closeModal)
  }

  useEffect(() => {
    if (credential.length >= 4 && password.length >= 6) setIsDisabled(false);
    if (credential.length < 4 || password.length < 6) setIsDisabled(true)
  }, [credential, password, isDisabled])

  return (
    <div className='modal'>
      <h1>Log In</h1>
      <form onSubmit={handleSubmit} >
        <div style={{color: 'red'}}>
          {errors ? "The provided credentials were invalid" : ''}
        </div>
        <label>
          Username or Email
          <input
            type="text"
            value={credential}
            onChange={(e) => setCredential(e.target.value)}
            required
          />
        </label>
        <label>
          Password
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </label>
        {errors.credential && <p>{errors.credential}</p>}
        <button
          className={isDisabled ? 'login-btn-disabled' : 'login-btn-modal'}
          type="submit"
          disabled={isDisabled}
          >Log In</button>
        <button className='login-btn-modal' onClick={demoLogin}>Log in as Demo User</button>
      </form>
    </div>
  );
}

export default LoginFormModal;
