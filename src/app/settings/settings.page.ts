import { AngularFireStorage } from '@angular/fire/storage';
import { Router } from '@angular/router';
import { AngularFirestore } from '@angular/fire/firestore';
import { Storage } from '@ionic/storage';
import { ModalController, AlertController, ToastController, LoadingController } from '@ionic/angular';
import { FormGroup, FormControl } from '@angular/forms';
import { Component, OnInit } from '@angular/core';
import * as $ from 'jquery';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.page.html',
  styleUrls: ['./settings.page.scss'],
})
export class SettingsPage implements OnInit {
  myId;initial;name;
  entry;
  changeform = new FormGroup({
   curPass: new FormControl(''),
   newPass: new FormControl(''),
   conPass: new FormControl('')
 });
 constructor( private storage: Storage,private modalCtrl:ModalController,private alertController:AlertController,private toastController:ToastController,private firestore: AngularFirestore,private loadingController:LoadingController,private router:Router,private storageref: AngularFireStorage) { }
loading
 ngOnInit() {
   this.storage.get('name').then(async (val) => {
     this.myId=val;
     this.initial=val.charAt(0).toLowerCase()
   })
   this.storage.get('origin').then(async (val) => {
     this.name=val
   })
 }

 chg(value){
   this.entry=value
   if(!value)
   {
    $('.pass').val('')
    this.changeform.reset()
    if($('.pass').attr('type')=='text')
      this.pass()
  }
 }

 async presentLoading() {
  this.loading = await this.loadingController.create({
   cssClass: 'my-custom-class',
   message: 'Please wait...',
   backdropDismiss: false
 });
 await this.loading.present();
}

 changepass(){
   this.presentLoading()
   this.firestore.firestore.collection('Users').where('id','==',this.myId).where('password','==',this.changeform.controls['curPass'].value).get().then((res)=>{
     if (!res.empty)
   {
     res.forEach(document=>{
      this.firestore.collection('Users').doc(document.id).set({password:this.changeform.controls['conPass'].value},{merge:true}).then(()=>{
        this.loading.dismiss()
        this.presentToast("Password Changed Successfully")
        this.changeform.reset()
        $('#check').prop('checked', false)
      })
     })
    
   }
    else
    {
    this.loading.dismiss()
    this.presentToast("Current Password Is Incorrect")
    }
   })
   
 }

 async presentToast(val) {
  const toast = await this.toastController.create({
    message: val,
    duration: 2000
  });
  toast.present();
}

 pass(){
   if($('.pass').attr('type')=='text')
   {
     $('.pass').attr('type','password')
     $('.eye').attr('name','eye-off-outline')
   }
   else
   {
     $('.pass').attr('type','text')
     $('.eye').attr('name','eye-outline')
 
   }
 }

 close(){
   this.modalCtrl.dismiss({
     'dismissed': true
   });
 }
 
 async DeleteAccount() {
   const alert = await this.alertController.create({
     cssClass: 'my-custom-class',
     header: 'Delete Account',
     inputs: [
       {
         name: 'name1',
         type: 'password',
         placeholder: 'Enter Password'
       }
     ],
     buttons: [
       {
         text: 'Cancel',
         role: 'cancel',
         cssClass: 'secondary',
         handler: () => {
           console.log('Confirm Cancel');
         }
       }, {
         text: 'Ok',
         handler: (data) => {
          this.firestore.firestore.collection('Users').where('id','==',this.myId).where('password','==',data.name1).get().then((res)=>{
            if (!res.empty)
            {
              this.presentLoading()
              res.forEach((document)=>{
                this.firestore.firestore.collection('Users').doc(document.id).delete().then(()=>{
                  this.presentToast("Your Account Deleted Successfully")
                    this.storage.clear();
                    this.loading.dismiss()
                    this.router.navigate(['/'])
                    this.close()
                })
              })
            }
            else
            {
              this.presentToast("Invalid Password")
            }
          })
         }
       }
     ]
   });

   await alert.present();
 }
}
