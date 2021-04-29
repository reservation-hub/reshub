import logo from './logo.svg';
import axios from 'axios'
import './App.css';

// const fetchData = () => {
  
// }

let data
axios
  .get('http://localhost:8090')
  .then(val => {
    console.log('val: ', val)
    data = val.data
  })
  .catch(e => console.log(e))

function App() {
  console.log('data : ', data)
  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          Edit <code>src/App.js</code> and save to reload.
        </p>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>
      </header>
    </div>
  );
}

export default App;
