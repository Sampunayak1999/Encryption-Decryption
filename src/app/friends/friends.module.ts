import { FriendsPipe } from '../pipe/friends.pipe';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { FriendsPageRoutingModule } from './friends-routing.module';
import { FriendsPage } from './friends.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,ReactiveFormsModule,
    FriendsPageRoutingModule
  ],
  declarations: [FriendsPipe,FriendsPage]
})
export class FriendsPageModule {}
