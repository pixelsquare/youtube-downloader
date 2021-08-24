import Root from './navigation/Root';
import InputUrl from './components/InputUrl';

import './css/App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.min.js';

function App() {
  return (
    <div className="App">
      <Root>
        <InputUrl/>
      </Root>
    </div>
  );
}

export default App;
