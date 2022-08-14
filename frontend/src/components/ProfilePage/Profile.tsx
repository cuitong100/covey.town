
import React, { useEffect, useState } from "react";
import {Button} from '@chakra-ui/react';
import TextField from "@material-ui/core/TextField";
import Paper from "@material-ui/core/Paper";
// import Box from "@material-ui/core/Box";
import Grid from "@material-ui/core/Grid";
import Typography from "@material-ui/core/Typography";
import { makeStyles,  ThemeProvider , createTheme } from "@material-ui/core/styles";
// import { useParams } from "react-router";

import axios from "../Welcome/api/axios";
import NavBar from "./NavBar";
import "./profile.css";
import townPerson from './img/townPerson.png';
import townImg from './img/CoveyTown.png';
import fadebg from './img/60fade.png';

// const theme = createTheme({
//   typography: {
//     fontFamily: [
//       'Chilanka',
//       'cursive',
//     ].join(','),
//   },});


const useStyles = makeStyles((theme) => ({
  root: {
    height: "90vh",
    backgroundImage: `url(${townImg})`,
    // backgroundImage: `url(${fadebg})`,
    // backgroundRepeat: "no-repeat",
    backgroundPosition: "center",
    backgroundSize: "cover",
    backgroundColor:
      theme.palette.type === "light"
        ? theme.palette.grey[50]
        : theme.palette.grey[900],
    display: "center",
    alignItems: "left",
    justifyContent: "center"
  },
}));


export default function UserProfile() {
  const classes = useStyles();
  const savedUsername = localStorage.getItem("username");
  const token = localStorage.getItem("x-access-token");
  const GETINFO_URL = `/users/${savedUsername}`;

  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [viewForm, setViewForm] = useState(false);
  
  const showUsername = async() => {
    try {
      const response = await axios.get(
        GETINFO_URL,
        {
          headers: { 'Content-Type': 'application/json', 
          'x-access-token':  token},
        }
      );
      setUsername(response.data.username);
      setEmail(response.data.email);
      setPassword(response.data.password);
      console.log(response.data);

    } catch (err) {
      console.log(err);
    }
  }

  useEffect(()=>{
    showUsername();
  }, []);

    function EditForm() {
      const [oldPwd, setOldPwd] = useState('');
      const [newEmail, setNewEmail] = useState('');
      const [newPwd, setNewPwd] = useState('');
      const PWD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%]).{8,24}$/;
      const EMAIL_REGEX = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
      const [validEmail, setValidEmail] = useState(false);
      const [validPwd, setValidPwd] = useState(false);
      const [errMsg, setErrMsg] = useState('');
  
      useEffect(() => {
        setValidEmail(EMAIL_REGEX.test(newEmail));
      }, [newEmail]);
    
      useEffect(() => {
        setValidPwd(PWD_REGEX.test(newPwd));
      }, [newPwd]);
    
      useEffect(() => {
        setErrMsg('');
      }, [newEmail, newPwd]);
    
    
      const handleSave = async(e: { preventDefault: () => void; })=>{
        e.preventDefault();
          console.log("do try catch");

          const v1 = EMAIL_REGEX.test(newEmail);
          const v2 = PWD_REGEX.test(newPwd);
          if (!v1){
            setErrMsg('Invalid new Email!');
            return;
          }
          if (!v2) {
            setErrMsg(' Invalid new Password! Password must include uppercase and lowercase letters, a number and a special character.');
            return;
          }

          try {
            const response = await axios.put(
              GETINFO_URL,
              JSON.stringify({originalPassword: oldPwd, password: newPwd , email : newEmail}),
              {
                headers: { 'Content-Type': 'application/json',
               'x-access-token' : token},
              }
            );
            setEmail(newEmail);
            setPassword(newPwd);
            setViewForm(false)
          } catch (err) {
            if (err instanceof Error) {
              console.log(err.message);
              if (err.message === "Request failed with status code 400") {
                setErrMsg(' Incorrect Old Password!');
              }
            }
          }
      }
    return (
      <form className="profileEditForm" onSubmit={handleSave}>
        {/* <label className="profileEditLabel" htmlFor="abc"> User Name:
          <input type="text" name="udername" />
        </label> */}
        <TextField
          variant="outlined"
          margin="normal"
          required
          fullWidth
          id="oldpwd"
          label="Old Password"
          name="oldpwd"
          autoFocus 
          autoComplete="current-password"
          onChange={(e) => setOldPwd(e.target.value)}
          />
        <TextField
          variant="outlined"
          margin="normal"
          required
          fullWidth
          name="email"
          label="New Email"
          type="email"
          id="email"
          onChange={(e) => setNewEmail(e.target.value)}
           />
        <TextField
          variant="outlined"
          margin="normal"
          required
          fullWidth
          id="email"
          label="New Password"
          name="password"
          type="password"
          autoFocus
          onChange={(e) => setNewPwd(e.target.value)} 
          />
        {/* <label className="profileEditLabel" htmlFor="abc">Email:
          <input type="text" name="Email" />
        </label> */}
        <button className="profileSubmitButton" type="submit"> Submit</button>
        <button className="profileCancelButton" type="button" onClick={() => setViewForm(false)}> Cancel </button>
        <p
            style = {{
              fontSize: '1.2rem',
              color: 'purple',
              width: 300,
            }}
					>
					    {errMsg}   
					</p>
      </form>
    )
  }
  

// // 弹窗
//   const deleteConfirm =(id) =>{
//     if(window.confirm('Are you sure you want to delete this account?')){
//       console.log('sure')
//       return true
//     }
//     console.log('cancel')
//     return false
//     }
  





  return (
    <><div>
      <NavBar />
    </div><Grid container component="main" className={classes.root}>
        {/* <div className="profile-container"> */}
          <div className="profile-info">
          <div className="profile-details">
            <h1 className="detailsTitle" > My Profile </h1>
            <div className="profile-header">
            <img
              className="profileUserImg"
              src={townPerson}
              alt="user profile img"
            />
            </div>
            <div className="detailsInfo">
                <h3 className="detailsInfoKey"> Username: {username} </h3>
            </div>
            <div className="detailsInfo">
                <h3 className="detailsInfoKey"> Email: {email} </h3>
            </div>
            <Button className="profileEditButton" type="submit" onClick={() => setViewForm(true)}>Edit</Button>
            <div className="formWrapper">
              {viewForm ?
                <EditForm /> : ''}
            </div>
          </div>
          </div>   
        {/* </div> */}
      </Grid></>
      );
  }
