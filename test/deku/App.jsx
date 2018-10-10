import {element} from 'deku';
import './main.css';

const {message} = require('./data.json');

export default function() {
  return <div>{message}</div>;
}
