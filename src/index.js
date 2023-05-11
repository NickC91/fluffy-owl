import React from 'react';
import ReactDOM from 'react-dom';
import Phaser from 'phaser'

new Phaser.Game()

function App() {
  return <h1>Hello Game!</h1>;
}

ReactDOM.render(<App />, document.getElementById('root'));