import {deku, element} from 'deku';
import InitialApp from './App.jsx';

const mountNode = document.getElementById('deku');

const render = deku.dom.createRenderer(mountNode);

function refresh(Component) {
  render(<Component />);
}

refresh(InitialApp);

if (module.hot) {
  module.hot.accept('./App.jsx', () => {
    var NextApp = require('./App.jsx');
    render(NextApp);
  });
}
