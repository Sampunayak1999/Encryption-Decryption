import { Storage } from '@ionic/storage';
import { Component } from '@angular/core';

import { Platform } from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';
import { Router } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss']
})
export class AppComponent {
  constructor(
    private platform: Platform,
    private splashScreen: SplashScreen,
    private statusBar: StatusBar,
    private router:Router,private storage:Storage
  ) {
    
  
    this.initializeApp();
  }

  initializeApp() {
  
    this.platform.ready().then(() => {
      this.storage.get('name').then((val)=>{
        if(val!=null)
          this.router.navigate(['friends'])
      })
      this.statusBar.styleDefault();
      this.splashScreen.hide();
    
    });
  }
}
