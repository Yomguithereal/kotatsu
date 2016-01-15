import {element} from 'deku';

const {message} = require('./data.json');

export default function() {
  return <div>{message}</div>;
}
