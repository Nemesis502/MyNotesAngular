import { ApplicationConfig, importProvidersFrom } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { getFirestore, provideFirestore } from '@angular/fire/firestore';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes), 
    importProvidersFrom(provideFirebaseApp(() => initializeApp({"projectId":"mynotes-eda96","appId":"1:688577643806:web:b0ab4477b24f11d441750f","storageBucket":"mynotes-eda96.firebasestorage.app","apiKey":"AIzaSyAFeup31nKLWDOMvGUBn3bNav65puJXSSw","authDomain":"mynotes-eda96.firebaseapp.com","messagingSenderId":"688577643806"}))), 
    importProvidersFrom(provideFirestore(() => getFirestore()))]
};
