const signUp = async e => {
    e.preventDefault();
    let formData = new FormData(e.target);
    let imgFile = document.querySelector("input[type=file]").files[0];
    document.getElementById(
        "sUp"
    ).innerHTML = `<button class="btn btn-primary" type="button" disabled>
    <span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
    Loading...
  </button>`;
    // console.log('imgfile --->>',imgFile)
    try {
        let resp = await firebase
            .auth()
            .createUserWithEmailAndPassword(
                formData.get("email"),
                formData.get("pwd")
            );
        // console.log(' resp.user ------>>>>',resp.user)
        let { uid, email } = resp.user;
        let fileUploaded = await firebase
            .storage()
            .ref(`Users/${uid}`)
            .put(imgFile);
        let downloadURL = await fileUploaded.ref.getDownloadURL();
        resp.user.updateProfile({
            displayName: formData.get("name"),
            photoURL: downloadURL
        });
        firebase
            .database()
            .ref(`Users/${uid}/personalDetails`)
            .set({
                name: formData.get("name"),
                email,
                image: downloadURL,
                uid
            },
                _ => {
                    e.target.reset();
                    location.href = "signin.html";
                }
            );
    } catch (error) {
        console.log(error.message);
    }
};

const signIn = e => {
    e.preventDefault();
    let formData = new FormData(e.target);
    document.getElementById(
        "sIn"
    ).innerHTML = `<button class="btn btn-primary" type="button" disabled>
    <span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
    Loading...
  </button>`;
    firebase
        .auth()
        .signInWithEmailAndPassword(formData.get("email"), formData.get("pwd"))
        .then(res => {
            localStorage.setItem("uid", res.user.uid);
            location.href = "index.html";
        })
        .catch(error => {
            console.log(error.message);
        });
};

const signOut = async _ => {
    await firebase.auth().signOut();
    localStorage.removeItem("uid");
    // location.href = 'signIn.html'
};

const adPost = async e => {
    e.preventDefault();
    let formData = new FormData(e.target);
    let imgFile = document.querySelector("input[type=file]").files[0];

    document.getElementById(
        "postUp"
    ).innerHTML = `<button class="btn btn-success w-100" type="button" disabled>
<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
Loading...
</button>`;
    console.log();
    try {
        let fileUpload = await firebase
            .storage()
            .ref(`Ads/${localStorage.getItem("uid")}/${formData.get("adname")}`)
            .put(imgFile);
        let downloadAdURL = await fileUpload.ref.getDownloadURL();
        firebase
            .database()
            .ref(`Ads/${localStorage.getItem("uid")}/${formData.get("adname")}`)
            .set({
                name: formData.get("adname"),
                number: formData.get("numb"),
                model: formData.get("model"),
                State: formData.get("inputState"),
                description: formData.get("discpt"),
                photo: downloadAdURL,
                uid: localStorage.getItem("uid")
            });
        e.target.reset();
        document.getElementById(
            "postUp"
        ).innerHTML = `<button type="submit" class="btn btn-success w-100">Post</button>`;
    } catch (error) {
        console.log(error.message);
    }
};




const categoryAdShow = async _ => {
    let b = await firebase
        .database()
        .ref(`Ads`)
        .once("value");
    document.getElementById("AdCard").innerHTML = "";

    let currentCategory = localStorage.getItem("category");

    for (let a in b.val()) {
        for (let c in b.val()[a]) {
            if (b.val()[a][c].State === currentCategory) {
                // console.log(b.val()[a][c])
                if (a === localStorage.getItem("uid")) {
                    document.getElementById(
                        "AdCard"
                    ).innerHTML += `<div class="card col-lg-4 col-sm-12 col-md-6 p-5">
            <img class="card-img-top" src="${
                        b.val()[a][c].photo
                        }" width="200" height="200" alt="Card image cap">
            <div class="card-body">
                <h5 class="card-title">${b.val()[a][c].name}</h5>
                <p class="card-text">${b.val()[a][c].model} <br> ${
                        b.val()[a][c].State
                        } </p>
                <p class="card-text">${b.val()[a][c].number}</p>
                <a class="btn btn-success" onclick="product('${b.val()[a][c].name}')">Purchase</a>
                <a href="#" class="btn btn-danger">Delete</a>
                </div>
                </div>`;
                } else {
                    let f = await firebase.database().ref(`Users/${localStorage.getItem('uid')}/fav/${c}`).once('value');
                    if (!!f.val()) {
                        document.getElementById(
                            "AdCard"
                        ).innerHTML += `<div class="card col-lg-4 col-sm-12 col-md-6 p-5">
                    <img class="card-img-top" src="${
                            b.val()[a][c].photo
                            }" width="200" height="200" alt="Card image cap">
                    <div class="card-body">
                        <h5 class="card-title">${b.val()[a][c].name}</h5>
                        <p class="card-text">${b.val()[a][c].model} <br> ${
                            b.val()[a][c].State
                            } </p>
                        <p class="card-text">${b.val()[a][c].number}</p>
                        <a class="btn btn-success " onclick="product('${b.val()[a][c].name}')">Purchase</a>
                        <button class="btn btn-warning" disabled>Already Favourite</button>
                        </div>
                        </div>`
                    } else {
                        document.getElementById(
                            "AdCard"
                        ).innerHTML += `<div class="card col-lg-4 col-sm-12 col-md-6 p-5">
                    <img class="card-img-top" src="${
                            b.val()[a][c].photo
                            }" width="200" height="200" alt="Card image cap">
                    <div class="card-body">
                        <h5 class="card-title">${b.val()[a][c].name}</h5>
                        <p class="card-text">${b.val()[a][c].model} <br> ${
                            b.val()[a][c].State
                            } </p>
                        <p class="card-text">${b.val()[a][c].number}</p>
                        <a class="btn btn-success" onclick="product('${b.val()[a][c].name}')">Purchase</a>
                        <a href="#" class="btn btn-warning" onclick='fav(event)'>Add to Fav</a>
                        </div>
                        </div>`
                    }


                }

            } else if (currentCategory === null) {
                if (a === localStorage.getItem("uid")) {
                    document.getElementById(
                        "AdCard"
                    ).innerHTML += `<div class="card col-lg-4 col-sm-12 col-md-6 p-5">
        <img class="card-img-top" src="${
                        b.val()[a][c].photo
                        }" width="200" height="200" alt="Card image cap">
        <div class="card-body">
            <h5 class="card-title">${b.val()[a][c].name}</h5>
            <p class="card-text">${b.val()[a][c].model} <br> ${
                        b.val()[a][c].State
                        } </p>
            <p class="card-text">${b.val()[a][c].number}</p>
            <a class="btn btn-success" onclick="product('${b.val()[a][c].name}')">Purchase</a>
            <a href="#" class="btn btn-danger" onclick='deleted(event)'>Delete</a>
            </div>
            </div>`;
                } else {

                    let f = await firebase.database().ref(`Users/${localStorage.getItem('uid')}/fav/${c}`).once('value');
                    if (!!f.val()) {
                        document.getElementById(
                            "AdCard"
                        ).innerHTML += `<div class="card col-lg-4 col-sm-12 col-md-6 p-5">
                    <img class="card-img-top" src="${
                            b.val()[a][c].photo
                            }" width="200" height="200" alt="Card image cap">
                    <div class="card-body">
                        <h5 class="card-title">${b.val()[a][c].name}</h5>
                        <p class="card-text">${b.val()[a][c].model} <br> ${
                            b.val()[a][c].State
                            } </p>
                        <p class="card-text">${b.val()[a][c].number}</p>
                        <a class="btn btn-success" onclick="product('${b.val()[a][c].name}')">Purchase</a>
                        <button class="btn btn-warning" disabled>Already Favourite</button>
                        </div>
                        </div>`
                    } else {
                        document.getElementById(
                            "AdCard"
                        ).innerHTML += `<div class="card col-lg-4 col-sm-12 col-md-6 p-5">
                    <img class="card-img-top" src="${
                            b.val()[a][c].photo
                            }" width="200" height="200" alt="Card image cap">
                    <div class="card-body">
                        <h5 class="card-title">${b.val()[a][c].name}</h5>
                        <p class="card-text">${b.val()[a][c].model} <br> ${
                            b.val()[a][c].State
                            } </p>
                        <p class="card-text">${b.val()[a][c].number}</p>
                        <a class="btn btn-success" onclick="product('${b.val()[a][c].name}')">Purchase</a>
                        <a href="#" class="btn btn-warning" onclick='fav(event)'>Add to Fav</a>
                        </div>
                        </div>`
                    }
                }
            }
        }
        // b.val()[a]
    }
};

const deleted = async e => {
    let adName =
        e.target.previousElementSibling.previousElementSibling
            .previousElementSibling.previousElementSibling.textContent;
    await firebase
        .storage()
        .ref(`Ads/${localStorage.getItem("uid")}/${adName}`)
        .delete();
    firebase
        .database()
        .ref(`Ads/${localStorage.getItem("uid")}/${adName}`)
        .set({});

    location.reload();
};

const fav = e => {
    let adName =
        e.target.previousElementSibling.previousElementSibling
            .previousElementSibling.previousElementSibling.textContent;
    firebase
        .database()
        .ref(`Users/${localStorage.getItem("uid")}/fav/${adName}`)
        .set({ fav: true });
};

const favload = async _ => {
    let prom = await firebase
        .database()
        .ref(`Users/${localStorage.getItem("uid")}/fav`)
        .once("value");
    document.getElementById("favCard").innerHTML = "";
    for (let a in prom.val()) {
        let help = await firebase
            .database()
            .ref(`Ads`)
            .once("value");
        for (let h in help.val()) {
            let favAds = await firebase
                .database()
                .ref(`Ads/${h}/${a}`)
                .once("value");
            if (favAds.val() !== null) {
                document.getElementById(
                    "favCard"
                ).innerHTML += `<div class="card col-lg-4 col-sm-12 col-md-6 p-5">
<img class="card-img-top" src="${
                    favAds.val().photo
                    }" width="200" height="200" alt="Card image cap">
<div class="card-body">
    <h5 class="card-title">${favAds.val().name}</h5>
    <p class="card-text">${favAds.val().model} <br> ${favAds.val().State} </p>
    <p class="card-text">${favAds.val().number}</p>
    <a href="product.html" class="btn btn-success" onclick="product(${favAds.val().name})">Purchase</a>
    <a href="#" class="btn btn-warning" onclick='fdd(event)'>remove from Fav</a>
    </div>
    </div>`
            };
            //   console.log(favAds.val());
        }
    }
};


const fdd = async e => {
    let nn = e.target.previousElementSibling.previousElementSibling.previousElementSibling.previousElementSibling.textContent;
    await firebase.database().ref(`Users/${localStorage.getItem('uid')}/${nn}`).set({})
    e.target.parentElementNode.remove();
}

const product = async naam => {
    // console.log("chal", naam);
    // localStorage.setItem('productName', naam);
    location.href = `product.html?productName=${naam}`;

}

const chat = async _ => {

    let chts = await firebase.database().ref(`chats`).once('value');



    for (let q in chts.val()) {
        for (let w in chts.val()[q]) {
            let userNaam = await firebase.database().ref(`Users/${chts.val()[q][w].ownerUid}/personalDetails`).once('value');

            if (localStorage.getItem('uid') === chts.val()[q][w].ownerUid) {

                let ads = await firebase.database().ref(`Ads/${chts.val()[q][w].ownerUid}/${q}`).once('value');
                // let userNaam = await firebase.database().ref(`Users/${chts.val()[q][w].ownerUid}/personalDetails`).once('value');

                console.log(ads.val())
                document.querySelector('li.mine').innerHTML += `
                <div class="d-flex bd-highlight btn" onclick="focused('${q}','${ads.val().photo}','${userNaam.val().name}','${userNaam.val().uid}', '${w}')">
                    <div class="img_cont">
                        <img src="${ads.val().photo}"
                            class="rounded-circle user_img">
                           
                            </div>
                            <div class="user_info">
                                <span>${q}</span>
                                <p>chat with ${ userNaam.val().name}</p>
                                </div>
                                </div>`


            } else if (localStorage.getItem('uid') === w) {
                let ads = await firebase.database().ref(`Ads/${chts.val()[q][w].ownerUid}/${q}`).once('value');

                document.querySelector('li.other').innerHTML += `
                <div class="d-flex bd-highlight btn" onclick="focused('${q}','${ads.val().photo}','${userNaam.val().name}','${userNaam.val().uid}', '${w}')">
                    <div class="img_cont">
                        <img src="${ads.val().photo}"
                            class="rounded-circle user_img">
                            
                            </div>
                            <div class="user_info">
                                <span>${q}</span>
                                <p>chat with ${ userNaam.val().name}</p>
                                </div>
                                </div>`

            }
        }
    }
}

const focused = async (a, b, c, d, e) => {
    console.log(a, b, c, d, e)
    document.querySelector('div.chatting').innerHTML = `
                <div class="card-header msg_head">
                        <div class="d-flex bd-highlight">
                            <div class="img_cont">
                                <img src="${b}" class="rounded-circle user_img">
                                <span class=""></span>
                            </div>
                            <div class="user_info">
                                <span>Chat with ${c}</span>
                              
                            </div>
                            <button class='btn btn-danger ml-auto' onclick='signOut()'>Sign Out</button>
                            </div>
            `
    document.querySelector('div.snd-area').innerHTML = `<div class="input-group ">

        <textarea class="form-control type_msg" placeholder="Type your message..." id="msg"></textarea>
        <div class="input-group-append" onclick="sendMsg('${a}','${d}', '${e}')">
            <span class="input-group-text send_btn">&#8674;</span>
        </div>
    </div>`
    document.querySelector('div.msg_card_body').innerHTML = '';



}


const sendMsg = async (a, d, buyerId) => {
    // console.log(document.getElementById('msg').value)
    console.log(d, buyerId)
    let res = await firebase.database().ref(`Users/${localStorage.getItem('uid')}/personalDetails`).once('value')

    currUserPic = res.val().image;

    firebase.database().ref(`chats/${a}/${buyerId}`).off();
    if (!document.getElementById('msg').value) {

        return alert('write something first')
    }

    let msg = {
        msg: document.getElementById('msg').value,
        time: new Date().toLocaleTimeString(),
        image: currUserPic,
        from: localStorage.getItem('uid'),
    }

    if (localStorage.getItem('uid') === buyerId) {

        firebase.database().ref(`chats/${a}/${buyerId}`).push(msg);
    } else {

        firebase.database().ref(`chats/${a}/${buyerId}`).push(msg);
    }
    // firebase.database().ref(``).push(msg);

    document.getElementById('msg').value = '';

    firebase.database().ref(`chats/${a}/${buyerId}`).on('child_added', message => {

        if (message.val().from === localStorage.getItem('uid')) {
            document.querySelector('div.msg_card_body').innerHTML += `

<div class="d-flex justify-content-end mb-4">
<div class="msg_cotainer_send">
    ${message.val().msg}
    </div>
    <div class="img_cont_msg">
        <img src="${message.val().image}" class="rounded-circle user_img_msg">
        </div>
        </div>
        `
        } else {
            document.querySelector('div.msg_card_body').innerHTML += `
<div>
<div class="d-flex justify-content-start mb-4">
<div class="img_cont_msg">
    <img src=""
    class="rounded-circle user_img_msg">
    </div>
    <div class="msg_cotainer">
        ${message.val().msg}
        </div>
        </div>  </div>`
        }

    })

}





















firebase.messaging()
    .requestPermission()
    .then(async function () {
        token = await messaging.getToken();
        console.log("Token =======>", token);
    })
    .catch(function (err) {
        console.log("Unable to get permission to notify.", err);
    });


fetch('https://fcm.googleapis.com/fcm/send', {
    'method': 'POST',
    'headers': {
        'Authorization': 'key=' + key,
        'Content-Type': 'application/json'
    },
    'body': JSON.stringify({
        'notification': notification,
        'to': to
    })
})
// document.querySelector('div.chatting').innerHTML = `
// <div class="card-header msg_head">
//         <div class="d-flex bd-highlight">
//             <div class="img_cont">
//                 <img src="" class="rounded-circle user_img">
//                 <span class=""></span>
//             </div>
//             <div class="user_info">
//                 <span>Chat with ${a}</span>

//             </div>
//             <button class='btn btn-danger m-auto' onclick='signOut()'>Sign Out</button>
//             </div>
// `


{ /* <span class="${res.val()[i].personalDetails.status ? 'online_icon' : 'offline_icon'}"></span>  */ }