import React, {Component} from 'react';

export default class App extends Component {
  static defaultProps = {
    message: 'Hello World!'
  };

  render() {

    return <div>{this.props.message}</div>;
  }
}
