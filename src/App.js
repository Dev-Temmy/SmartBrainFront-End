import React, { Component} from 'react';
import Particles from 'react-particles-js';
//import Clarifai from 'clarifai';
import FaceRecognition from './components/FaceRecognition/FaceRecognition';
import './App.css';
import Navigation from './components/Navigation/Navigation';
import Register from './components/Register/Register';
import SignIn from './components/SignIn/SignIn';
import Logo from './components/Logo/Logo';
import ImageLinkForm from './components/ImageLinkForm/ImageLinkForm';
import Rank from './components/Rank/Rank';

// const Clarifai = require('clarifai');
// const app = new Clarifai.App({
// apiKey: 'be52b48c98db41f8929d9dd47e10a291'
// });
//const app = new Clarifai.App({apiKey: 'be52b48c98db41f8929d9dd47e10a291'});

const particlesOptions = {
        particles: {
          value:30,
          density: {
            enabled:true,
            value_area: 800
          }
              }
            }
//to initialize the state for different users
const initialState = {
      input: '',
      imageUrl: '',
      box: {},
      route: 'signin',
      isSignedIn: false,
      user:{
          id: '',
          name:'',
          email: ' ',
          entries: 0,
          joined: ''
      }
    }


class App extends Component {
  //to get information from Detect button
  constructor(){
    super();
    this.state= initialState;
  }

  loadUser=(data)=> {
    this.setState({user:{
          id: data.id,
          name: data.name,
          email: data.email,
          entries: data.entries,
          joined: data.joined
      }})
  }

  /*componentDidMount() { //for testing the connection between frontend and backend
    fetch('http://localhost:3000')
    .then(response => response.json())
    .then(console.log) 
} */

  calculateFaceLocation= (data)=> {
    const clarifaiFace = data.outputs[0].data.regions[0].region_info.bounding_box;
    const image = document.getElementById('inputImage');
    const width = Number(image.width);
    const height = Number(image.height);
    console.log(width, height);
    return {
      leftCol: clarifaiFace.left_col * width,
      topRow: clarifaiFace.top_row * height,
      rightCol: width - (clarifaiFace.right_col * width),
      bottomRow: height - (clarifaiFace.bottom_row * height)
    }
  }
  displayFaceBox=(box)=> {
    console.log(box);
    this.setState({box: box});
  }

  onInputChange = (event)=> {
    this.setState({input: event.target.value}); //to get value from input
  }

  onButtonSubmit = ()=> {
    this.setState({imageurl:this.state.input})
      fetch('http://localhost:3000/imageurl' , {
          method: 'post', //this is 'get' by default
          headers: {'Content-Type': 'application/json'},
          body:JSON.stringify({
          input: this.state.input
        }) } )
      .then(response=> response.json())

    // app.models.predict(
    // Clarifai.FACE_DETECT_MODEL, 
    // this.state.input)
    .then(response => {
      if (response) {
        fetch('http://localhost:3000/image' , {
          method: 'put', //this is 'get' by default
          headers: {'Content-Type': 'application/json'},
          body:JSON.stringify({
          id: this.state.user.id
        }) } )
        .then (response => response.json())
        .then(count => {
          this.setState(Object.assign(this.state.user, {entries:count}))
        })
        .catch(console.log) //for error handling
      }
    this.displayFaceBox(this.calculateFaceLocation(response))}) 
   // do something with response
  .catch(err=> console.log(err)); // there was an error
  }

  onRouteChange = (route)=> {
    if(route === 'signout') { this.setState(initialState)}
    else if(route==='home') {this.setState({isSignedIn:true})}
    this.setState({route: route}); //changes route to home when sign in and sign out
  }
render() {
  return (
    <div className="App">
          <Particles className= 'particles' 
          params = {particlesOptions}/>
        <Navigation isSignedIn= {this.state.isSignedIn} 
        onRouteChange= {this.onRouteChange}  />
        {this.state.route=== 'home'
          ? <div>
          <Logo/> 
          <Rank name= {this.state.user.name} entries={this.state.user.entries}/>
          <ImageLinkForm 
          onInputChange={this.onInputChange} 
          onButtonSubmit={this.onButtonSubmit}/>
          <FaceRecognition box ={this.state.box} imageUrl={this.state.input} />
          </div>
          : (this.state.route === 'signin' 
          ? <SignIn loadUser={this.loadUser} onRouteChange = {this.onRouteChange}/>
          : <Register loadUser= {this.loadUser} onRouteChange = {this.onRouteChange}/>
          ) // a function to redirect when signed in
        }
    </div>
    );
  }
}
export default App;