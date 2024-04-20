import { createStore, applyMiddleware, compose, combineReducers } from 'redux';
import thunk from 'redux-thunk';
import sessionReducer from './session';
import groupsReducer from './group';
import eventsReducer from './events';
import membersReducer from './members';
import groupByIdReducer from './groupById';
import eventByIdReducer from './eventById';
import imagesByGroupIdReducer from './imageByGroupId';
import imagesByEventIdReducer from './imagesByEventId';

const rootReducer = combineReducers({
  session: sessionReducer,
  groups: groupsReducer,
  events: eventsReducer,
  members: membersReducer,
  groupById: groupByIdReducer,
  eventById: eventByIdReducer,
  groupPrevImage: imagesByGroupIdReducer,
  eventPrevImage: imagesByEventIdReducer
});

let enhancer;
if (import.meta.env.MODE === "production") {
  enhancer = applyMiddleware(thunk);
} else {
  const logger = (await import("redux-logger")).default;
  const composeEnhancers =
    window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;
  enhancer = composeEnhancers(applyMiddleware(thunk, logger));
}

const configureStore = (preloadedState) => {
  return createStore(rootReducer, preloadedState, enhancer);
};

export default configureStore;
