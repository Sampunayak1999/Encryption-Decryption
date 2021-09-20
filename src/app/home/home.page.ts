import { Storage } from '@ionic/storage';
import { Component } from '@angular/core';
import * as $ from 'jquery';
import { FormGroup, FormControl } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastController, LoadingController } from '@ionic/angular';
import { AngularFirestore } from '@angular/fire/firestore';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {
  //Variable
  loginform = new FormGroup({
    userName: new FormControl(''),
    password: new FormControl('')
  });
  set=false;
  SignUpform=new FormGroup({
    name1:new FormControl(''),
    name2:new FormControl(''),
    pass1:new FormControl(''),
    pass2:new FormControl('')
  });
  loading: any;

  constructor(private router:Router,private toastController:ToastController,private firestore: AngularFirestore,private loadingController:LoadingController,private storage:Storage
    ) {
     
    }
    logchange(event)
    {
      if(event)
      {
        $('#logid').attr('type','text')
      }
      else
      {
        $('#logid').attr('type','password')
      }
    }

    signchange(event)
    {
      if(event)
      {
        $('#signpass').attr('type','text')
        $('#signconfirm').attr('type','text')
      }
      else
      {
        $('#signpass').attr('type','password')
        $('#signconfirm').attr('type','password')
      }
 
    }
    //Register
    register(){
      if($('.register').hasClass('set'))
      {
        this.presentLoading()
      var minm = 100; 
      var maxm = 999; 
      let id=this.SignUpform.controls['name1'].value+this.SignUpform.controls['name2'].value.substring(0,2)+'@'+(Math.floor(Math.random()*(maxm-minm+1))+minm);
      let addrecord = {}
      addrecord['first name'] = this.SignUpform.controls['name1'].value
      addrecord['last name'] = this.SignUpform.controls['name2'].value
      addrecord['password'] = this.SignUpform.controls['pass1'].value
      addrecord['id'] = id;
      this.firestore.collection('/Users/').add(addrecord).then(()=>{
        this.loading.dismiss();
        this.storage.set('name',id);
        this.storage.set('origin',this.SignUpform.controls['name1'].value+" "+this.SignUpform.controls['name2'].value)
        this.SignUpform.reset(); 
        this.router.navigate(['friends'])
      })
      }
    }
ngOnInit() {
 
}
async presentLoading() {
  this.loading = await this.loadingController.create({
   cssClass: 'my-custom-class',
   message: 'Please wait...',
   backdropDismiss: false
 });
 await this.loading.present();
}
  change(){
    if(!$('.register').hasClass('set'))
    {
      this.loginform.reset();
    $('#login').slideUp().removeClass('set');
    setTimeout(()=>{
      this.set=true;
      $('.register').slideDown().addClass('set')
    },500)
  }
}

  login(){
    if($('#login').hasClass('set'))
    {
      this.presentLoading();
      this.firestore.firestore.collection('Users').where('id', '==', this.loginform.controls['userName'].value).where('password','==',this.loginform.controls['password'].value).get().then(querySnapshot=>{
        if(!querySnapshot.empty)
        {
          this.loading.dismiss();
          this.storage.set('name',this.loginform.controls['userName'].value);
          querySnapshot.forEach((val)=>{
            this.storage.set('origin',val.data()['first name']+" "+val.data()['last name']);
            this.loginform.reset();
            this.router.navigate(['friends'])
          })
        }
        else
        {
          this.loading.dismiss();
          this.presentToast("Invalid Username or Password")
        }
      })
    }
    else
    {
      this.SignUpform.reset();
      this.set=false;
      $('.register').slideUp().removeClass('set')
      $('#login').slideDown().addClass('set');
    }  
  }

    async presentToast(msg) {
      const toast = await this.toastController.create({
        message: msg,
        duration: 2000
      });
      toast.present();
    }
}
