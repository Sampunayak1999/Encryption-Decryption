

import {
  messages
} from './data';
import {
  Storage
} from '@ionic/storage';
import {
  Component,
  ElementRef,
  OnInit,
  ViewChild
} from '@angular/core';
import {
  ActivatedRoute
} from '@angular/router';
import * as $ from 'jquery';
import {
  AngularFireStorage,
} from '@angular/fire/storage';
import {
  AngularFirestore
} from '@angular/fire/firestore';
import {
  LoadingController,
  Platform
} from '@ionic/angular';

@Component({
  selector: 'app-message',
  templateUrl: './message.page.html',
  styleUrls: ['./message.page.scss'],
})
export class MessagePage implements OnInit {
  @ViewChild('content') private content: any;
  @ViewChild('ImageCanvas')
  ImageCanvas: ElementRef < HTMLCanvasElement > ;
  @ViewChild('txtCanvas')
  txtCanvas: ElementRef < HTMLCanvasElement > ;
  @ViewChild('txtCanvas2')
  txtCanvas2: ElementRef < HTMLCanvasElement > ;
  @ViewChild('ImgCanvas')
  ImgCanvas: ElementRef < HTMLCanvasElement > ;
  Id; //Friends ID
  initial; //Initial Of Friend
  name; //Name Of Friend
  myId: any; //Myid
  messageselected; //Selected Image
  image = [1, 2, 3, 4, 5, 6, 7]
  originmessage;
  message = messages;
  visible = false;
  loading: HTMLIonLoadingElement;
  randomId: string;
  date: number;
  constructor(private activatedRoute: ActivatedRoute, private firestore: AngularFirestore, private storageref: AngularFireStorage, private storage: Storage, private loadingController: LoadingController) {}

  ngOnInit() {
    this.Id = this.activatedRoute.snapshot.paramMap.get('id');
    this.name = this.activatedRoute.snapshot.paramMap.get('name');
    this.initial = this.Id.charAt(0)
    this.storage.get('name').then(async (val) => {
      this.myId = val;
      this.firestore.collection("Message").doc(this.myId).collection(this.Id, ref => ref.orderBy('date')).snapshotChanges().subscribe(res => {
        if (res) {
          this.message = res.map(e => {
            return {
              state:true,
              date: e.payload.doc.data()['time'],
              dcpr:e.payload.doc.data()['decrypt'],
              link: e.payload.doc.data()['image_link'],
              from: e.payload.doc.data()['from'],
              msg: e.payload.doc.data()['message'],
            }
          })

        }
      })
      this.mouse()
    })
  }

  scrollToBottom() {
    this.content.scrollToBottom(500)
  }

  mouse() {
    $('html').on('mouseup', function (e) {
      if (!$(e.target).closest('#encryptimg').length! && !$(e.target).closest('.messagebox').length && !$(e.target).closest('.send').length) {
        if ($('#encryptimg').is(':visible')) {
          $('#encryptimg').slideUp();
          $('#caret').css('transform', 'rotate(-0deg)');
        }
      }
    })
  }

  //Encrypt
  encrypt(msg) {
    var imgsize = document.getElementById(this.messageselected + 'img');
    var img = new Image()
    img.src = imgsize.getAttribute('src')
    var tcxtx = this.txtCanvas.nativeElement.getContext('2d')
    var ctx = this.ImageCanvas.nativeElement.getContext('2d')
    //Setting Size for canvas
    this.ImageCanvas.nativeElement.width = img.width;
    this.ImageCanvas.nativeElement.height = img.height;
    this.txtCanvas.nativeElement.width = img.width;
    this.txtCanvas.nativeElement.height = img.height;
    //Font Size
    tcxtx.fillStyle="white"
    tcxtx.font = "60px Arial";
    var messageText = msg;
    tcxtx.fillText(messageText, 10, 50);
    ctx.drawImage(img, 0, 0);
    var imgData = ctx.getImageData(0, 0, this.ImageCanvas.nativeElement.width, this.ImageCanvas.nativeElement.height);
    var textData = tcxtx.getImageData(0, 0, this.ImageCanvas.nativeElement.width, this.ImageCanvas.nativeElement.height);
    var pixelsInMsg = 0;
    var pixelsOutMsg = 0;
    for (var i = 0; i < textData.data.length; i += 4) {
      if (textData.data[i + 3] !== 0) {
        if (imgData.data[i + 1] % 10 == 7) {
          //do nothing, we're good
        } else if (imgData.data[i + 1] > 247) {
          imgData.data[i + 1] = 247;
        } else {
          while (imgData.data[i + 1] % 10 != 7) {
            imgData.data[i + 1]++;
          }
        }
        pixelsInMsg++;
      } else {
        if (imgData.data[i + 1] % 10 == 7) {
          imgData.data[i + 1]--;
        }
        pixelsOutMsg++;
      }
    }
    ctx.putImageData(imgData, 0, 0);
    //Decrypt
    var dctx = this.txtCanvas2.nativeElement.getContext('2d')
    this.txtCanvas2.nativeElement.width = this.ImageCanvas.nativeElement.width
    this.txtCanvas2.nativeElement.height = this.ImageCanvas.nativeElement.height
    var decodeData = ctx.getImageData(0, 0, this.ImageCanvas.nativeElement.width, this.ImageCanvas.nativeElement.height);
    for (var i = 0; i < decodeData.data.length; i += 4) {
      if (decodeData.data[i + 1] % 10 == 7) {
        decodeData.data[i] = 0;
        decodeData.data[i + 1] = 0;
        decodeData.data[i + 2] = 0;
        decodeData.data[i + 3] = 255;
      } else {
        decodeData.data[i + 3] = 0;
      }
    }
    dctx.putImageData(decodeData, 0, 0);
    this.txtCanvas2.nativeElement.toBlob((blob) => {
      this.randomId = Math.random()
        .toString(36)
        .substring(2, 8);
      this.date = new Date().getTime()
      this.storageref.upload(`decrypt/` + this.myId + `/` + this.Id + `/` + this.date + '_' + this.randomId + `.jpg`, blob).then((result) => {
        this.storageref.storage.ref(result.metadata.fullPath).getDownloadURL().then(async decryptresult => {
          //To Blob
          this.ImageCanvas.nativeElement.toBlob((blob) => {
            this.uploadfile(blob, decryptresult)
          })
        })
      })
    })
  }

  decrypt(msg,dlink)
  {
    this.presentLoading()
    setTimeout(()=>{
      msg.state=!msg.state
      this.loading.dismiss()
      var temp=msg.link
      msg.link=dlink
      msg.dcpr=temp
    },3000)
  }

  async presentLoading() {
    this.loading = await this.loadingController.create({
      cssClass: 'my-custom-class',
      message: 'Please wait...',
      backdropDismiss: false
    });
    await this.loading.present();
  }

  //Upload File to Firestore Storage
  async uploadfile(blob, decryptans) {
    this.presentLoading()
    const uploadtask = this.storageref.upload(this.myId + `/` + this.Id + `/` + this.date + '_' + this.randomId + `.jpg`, blob).then((result) => {
      let addrecord = {}
      addrecord['date'] = new Date();
      addrecord['time'] = new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute:'numeric',hour12: true });
      addrecord['from'] = this.myId;
      addrecord['decrypt'] = decryptans;
      //Databases
      this.storageref.storage.ref(result.metadata.fullPath).getDownloadURL().then(async result2 => {
        addrecord['image_link'] = await result2
        addrecord['message'] = this.originmessage
        this.firestore.collection("Message").doc(this.myId).collection(this.Id).add(addrecord).then(() => {
          this.firestore.collection("Message").doc(this.Id).collection(this.myId).add(addrecord).then(() => {
            this.loading.dismiss()
            $('.messagebox').val('')
            if ($('#encryptimg').is(':visible'))
              this.slide()
          })
        })
      })
    })
  }

  //Text Detection
  input(event) {
    if (event.detail.value.toString().localeCompare("")) {
      if (!$('#encryptimg').is(':visible'))
        this.slide()
    } else {
      if ($('#encryptimg').is(':visible'))
        this.slide()
    }
  }

  //Send Message
  send(message) {
    if (message.toString().localeCompare("") && this.messageselected != null) {
      this.originmessage = message
      this.encrypt(message)
    }
  }

  //Selected Image
  select(check) {
    this.messageselected = check + 1
    $('.encryptimg').removeClass('border-primary').addClass('border-gray');
    $('#' + check).addClass('border-primary').removeClass('border-gray');
  }

  //Slide Up or Slide Down
  slide() {
    if ($('#encryptimg').is(':visible')) {
      this.messageselected = null;
      $('.encryptimg').removeClass('border-primary').addClass('border-gray');
      $('#encryptimg').slideUp();
      $('#caret').css('transform', 'rotate(0deg)');
    } else {
      $('#encryptimg').slideDown();
      $('#caret').css('transform', 'rotate(180deg)');
    }
  }
}