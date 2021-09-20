import { SettingsPage } from './../settings/settings.page';
import { Router } from '@angular/router';
import { AlertController, ModalController } from '@ionic/angular';
import { Storage } from '@ionic/storage';
import { Component, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';

@Component({
  selector: 'app-friends',
  templateUrl: './friends.page.html',
  styleUrls: ['./friends.page.scss'],
})
export class FriendsPage implements OnInit {
  records: { initial:string,id: string; name: string;}[]=[];
  search1;
  constructor(public modalController: ModalController,private firestore:AngularFirestore,private storage:Storage,private router:Router,private alertController:AlertController) { }

  ngOnInit() {  
    this.storage.get('name').then((val)=>{

      this.firestore.collection("Users",ref=>ref.where('id','!=',val)).snapshotChanges().subscribe(res=>{
        if(res)
          this.records = res.map(e=>{
            return{
              initial:e.payload.doc.data()['id'].charAt(0),
              id:e.payload.doc.data()['id'],
              name:e.payload.doc.data()['first name']+" "+e.payload.doc.data()['last name']
            }
          })
      })
  });
  }

  async logout() {
    const alert = await this.alertController.create({
      cssClass: 'my-custom-class',
      header: 'Logout',
      message: 'Do you want to logout ?',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          cssClass: 'secondary',
          handler: (blah) => {
          }
        }, {
          text: 'Okay',
          handler: () => {
            this.storage.clear();
            this.router.navigate(['/'])
          }
        }
      ]
    });

    await alert.present();
  }

  async presentModal() {
    const modal = await this.modalController.create({
      component: SettingsPage,
      cssClass: 'my-custom-class'
    });
    return await modal.present();
  }
}
