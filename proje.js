var oyunAlani = {
    canvas : document.createElement("canvas"),
    mermiler: [], 
    rakipler: [],
    start : function(){
        this.canvas.width = 1536;
        this.canvas.height = 729;
        this.context = this.canvas.getContext("2d");
        document.body.insertBefore(this.canvas, document.body.childNodes[0]);
        this.interval = setInterval(oyunAlaniGuncelle,20); 
        window.addEventListener("keydown",function(event){
            oyunAlani.keys = (oyunAlani.keys || []);
            oyunAlani.keys[event.keyCode] = true;
        })
        window.addEventListener("keyup",function(event){
            oyunAlani.keys[event.keyCode] = false;
        })
    },
    clear : function(){
        this.context.clearRect(0,0,this.canvas.width,this.canvas.height);
    },
    clearScreen: function() {
        this.context.fillStyle = "rgba(0, 0, 0, 0.1)"; // Şeffaf siyah renk
        this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);
    },
}

function startGame(){
    oyunAlani.start();
    nesne = new nesneOlustur(30,30,"white",300,300);
    nesne2 = new nesneOlustur(30,30,"white",1200,300);
    nesne2.sayac = 100;
    bariyer = new nesneOlustur(5,729,"blue",1100,0);
    puan = 0;
    // Rastgele ateş etme zamanlayıcısı oluşturma
    mermiAtisHizi = setInterval(function() {
        ateşEt(nesne2);
    }, 4000); // Her 4 saniyede bir ateş et

    // Yeni rakip oluşturma zamanlayıcısı
    rakipUretmeHizi = setInterval(function() {
        yeniRakip();
    }, 15000); // Her 15 saniyede bir yeni rakip oluştur
}  

function nesneOlustur(width,height,color,x,y){
    this.width = width;
    this.height = height;
    this.x = x;
    this.y = y;
    this.speedX = 0;
    this.speedY = 0;
    this.update = function(){
        ctx = oyunAlani.context;
        ctx.fillStyle = color;
        ctx.fillRect(this.x,this.y,this.width,this.height);
    }
    this.yeniPozisyon = function(){
        // Yeni pozisyonu hesapla
        var newX = this.x + this.speedX;
        var newY = this.y + this.speedY;
    
        // Canvas sınırlarını kontrol et
        if (newX >= 0 && newX + this.width <= oyunAlani.canvas.width) {
            this.x = newX;
        }
        if (newY >= 0 && newY + this.height <= oyunAlani.canvas.height) {
            this.y = newY;
        }
    }
    
}

function oyunAlaniGuncelle(){
    oyunAlani.clear();

    //Oyuncunun nesneyi kontrol etmesi
    nesne.speedX = 0;
    nesne.speedY = 0;
    if (oyunAlani.keys && (oyunAlani.keys[37] || oyunAlani.keys[65])){nesne.speedX -= 6};
    if (oyunAlani.keys && (oyunAlani.keys[38] || oyunAlani.keys[87])){nesne.speedY -= 6};
    if (oyunAlani.keys && (oyunAlani.keys[39] || oyunAlani.keys[68])){nesne.speedX += 6};
    if (oyunAlani.keys && (oyunAlani.keys[40] || oyunAlani.keys[83])){nesne.speedY += 6};
    // Oyuncunun, bariyerin ve ilk rakibin konumunun güncellenmesi
    nesne.yeniPozisyon();
    nesne.update();
    nesne2.sayac --;
    if (nesne2.sayac <=0){
        rakipHareket(nesne2);
        nesne2.sayac = 20;
    }
    nesne2.yeniPozisyon();
    nesne2.update();
    bariyer.update();

    // Mermilerin konumunu güncelle
    for (var i = 0; i < oyunAlani.mermiler.length; i++) {
        var mermi = oyunAlani.mermiler[i];
        mermi.hareket();
        mermi.update();
    }

    // Rakip nesnelerin konumunu güncelle ve ateş et
    for (var i = 0; i < oyunAlani.rakipler.length; i++) {
        var rakip = oyunAlani.rakipler[i];
        rakip.yeniPozisyon();
        rakip.update();
        rakip.sayac--;
        if (rakip.sayac <= 0) {
            ateşEt(rakip);
            rakipHareket(rakip);
            rakip.sayac = 100;
        }
    }
    carpismaKontrol();
    puan += 1;
    puanHesapla();
}

function yeniRakip() {
    // İlk rakip nesnesi ile aynı konumda yeni bir rakip oluştur
    var yeniRakip = new nesneOlustur(30, 30, "white", 1200, 300);
    yeniRakip.sayac = 100;

    // Rastgele yukarı veya aşağı hareket et
    if (Math.random() < 0.5) {
        yeniRakip.speedY = -3;
    } else {
        yeniRakip.speedY = 3;
    }

    oyunAlani.rakipler.push(yeniRakip);
}
//Rakibin hareket fonksiyonu
function rastgeleHareket(){
    var array = [38,40];
    var rastgele = Math.floor(Math.random()*array.length);
    return array[rastgele];
}

//Ateş eden nesnelerin hareketini ayarlar.
function rakipHareket(rakip){
    var yon = rastgeleHareket();
    switch(yon){
        case 38:
            rakip.speedX = 0;
            rakip.speedY = -3;
            break;
        case 40:
            rakip.speedX = 0;
            rakip.speedY = 3;
            break;
    }
}

function ateşEt(nesne) {
    var ateş = new nesneOlustur(10, 10, "red", nesne.x, nesne.y);
    ateş.hareket = function() {
        this.x -= 5; // Örneğin, ateşin sola doğru hareket etmesi
    }
    // Ateşi mermiler dizisine ekle
    oyunAlani.mermiler.push(ateş);
}

//Oyuncunun mermi ile veya bariyer ile çarpışmasını kontrol eder.
function carpismaKontrol() {
    // Her mermiyi kontrol eder.
    for (var i = 0; i < oyunAlani.mermiler.length; i++) {
        var mermi = oyunAlani.mermiler[i];
        //Oyuncuya mermi isabet edince oyunun bittiği senaryo
        if (mermi.x < nesne.x + nesne.width &&
            mermi.x + mermi.width > nesne.x &&
            mermi.y < nesne.y + nesne.height &&
            mermi.y + mermi.height > nesne.y) {
            // Oyunu bitirme mesajı gösterme veya başka bir işlem yapma
            var oyunSonKontrol = confirm("Oyun bitti! Puanınız: " + puan + "\nYeniden başlamak ister misiniz?");
            if (oyunSonKontrol){
                resetGame();
            }
            return;
        }
        //Oyuncunun bariyere çarpması sonucu
        if (nesne.x < bariyer.x + bariyer.width &&
            nesne.x + nesne.width > bariyer.x &&
            nesne.y < bariyer.y + bariyer.height &&
            nesne .y + nesne.height > bariyer.y){
            var oyunSonKontrol = confirm("Oyun bitti! Puanınız: " + puan + "\nYeniden başlamak ister misiniz?");
            if (oyunSonKontrol){
                resetGame();
            }
            return;
        }
    }
}
//Oyunda elde edilen puanı hesaplar
function puanHesapla() {
    var ctx = oyunAlani.context;
    ctx.font = "30px Arial";
    ctx.fillStyle = "white";
    ctx.fillText("Puan: " + puan, 20, 40); // Puanı (20, 40) konumuna yazdır
}
//Oyunu yeniden başlatır.
function resetGame(){
    puan = 0;
    oyunAlani.mermiler = [];
    oyunAlani.rakipler = [];
    clearInterval(oyunAlani.interval)
    clearInterval(mermiAtisHizi);
    clearInterval(rakipUretmeHizi);
    startGame();
}