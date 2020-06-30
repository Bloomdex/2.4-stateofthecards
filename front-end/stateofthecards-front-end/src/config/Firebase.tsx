import * as firebase from "firebase/app";
import "firebase/auth";
import "firebase/database";
import "firebase/storage";

const firebaseConfig = {
	apiKey: "AIzaSyD_u1ozbKLMyXzT38Qh4NchtT-8AjTd2nM",
	authDomain: "bloomdex-stateofthecards.firebaseapp.com",
	databaseURL: "https://bloomdex-stateofthecards.firebaseio.com",
	projectId: "bloomdex-stateofthecards",
	storageBucket: "bloomdex-stateofthecards.appspot.com",
	messagingSenderId: "202268709744",
	appId: "1:202268709744:web:b84d2c9f83ce933c3df5b5",
};

const FirebaseApp = firebase.initializeApp(firebaseConfig);

export default FirebaseApp;
