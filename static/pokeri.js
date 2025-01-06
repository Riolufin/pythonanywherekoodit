//taulukoidaan eri käsien vetotodennäköisyydet
let postflop = {
        "neljä samaa": 0.0426/(1-0.0426),
        "värisuoran väliinveto": 0.0426/(1-0.0426),
        "värisuoran päihinveto": 0.0842/(1-0.0842),
        "kolme samaa": 0.0842/(1-0.0842),
        "korkeampi pari": 0.1249/(1-0.1249),
        "suoran väliinveto": 0.1647/(1-0.1647),
        "täyskäsi": 0.1647/(1-0.1647),
        "kolme samaa tai kaksi paria": 0.2035/(1-0.2035),
        "pari": 0.2414/(1-0.2414),
        "suoran väliinveto tai korkeampi pari": 0.2784/(1-0.2784),
        "suoran päihinveto": 0.3145/(1-0.3145),
        "väri": 0.3497/(1-0.3497),
        "suoran väliinveto tai pari": 0.3839/(1-0.3839),
        "suoran päihinveto tai korkeampi pari": 0.4172/(1-0.4172),
        "suoran väliinveto tai väri": 0.4496/(1-0.4496),
        "väri tai korkeampi pari": 0.4496/(1-0.4496),
        "suoran päihinveto tai pari": 0.5116/(1-0.5116),
        "suoran päihinveto tai väri": 0.5412/(1-0.5412),
        "väri tai pari": 0.5412/(1-0.5412),
        "suoran väliinveto, väri tai korkeampi pari": 0.5412/(1-0.5412),
        "suoran väliinveto, väri tai pari": 0.6244/(1-0.6244),
        "suoran päihinveto, väri tai korkeampi pari": 0.6244/(1-0.6244),
        "suoran päihinveto, väri tai pari": 0.6994/(1-0.6994)
    };
let river = {
        "neljä samaa": 0.0217/(1-0.0217),
        "värisuoran väliinveto": 0.0217/(1-0.0217),
        "värisuoran päihinveto": 0.0435/(1-0.0435),
        "kolme samaa": 0.0435/(1-0.0435),
        "korkeampi pari": 0.0652/(1-0.0652),
        "suoran väliinveto": 0.087/(1-0.087),
        "täyskäsi": 0.087/(1-0.087),
        "kolme samaa tai kaksi paria": 0.1087/(1-0.1087),
        "pari": 0.1304/(1-0.1304),
        "suoran väliinveto tai korkeampi pari": 0.1522/(1-0.1522),
        "suoran päihinveto": 0.1739/(1-0.1739),
        "väri": 0.1957/(1-0.1957),
        "suoran väliinveto tai pari": 0.2174/(1-0.2174),
        "suoran päihinveto tai korkeampi pari": 0.2391/(1-0.2391),
        "suoran väliinveto tai väri": 0.2609/(1-0.2609),
        "väri tai korkeampi pari": 0.2609/(1-0.2609),
        "suoran päihinveto tai pari": 0.3043/(1-0.3043),
        "suoran päihinveto tai väri": 0.3261/(1-0.3261),
        "väri tai pari": 0.3261/(1-0.3261),
        "suoran väliinveto, väri tai korkeampi pari": 0.3261/(1-0.3261),
        "suoran väliinveto, väri tai pari": 0.3913/(1-0.3913),
        "suoran päihinveto, väri tai korkeampi pari": 0.3913/(1-0.3913),
        "suoran päihinveto, väri tai pari": 0.4565/(1-0.4565)
    };

//käsitellään pottikerroinlaskurin toiminta
function pokeri() {
    //Haetaan potti- ja maksukentän sisältö
    var pottikentta = document.getElementById("potti").value;
    var maksukentta = document.getElementById("maksu").value;
    //Muutetaan desimaalipilkku desimaalipisteeksi potista ja maksusta sekä
    //poistetaan tyhjät
    pottikentta = pottikentta.replace(",",".");
    pottikentta = pottikentta.replaceAll(" ","");
    maksukentta = maksukentta.replace(",",".");
    maksukentta = maksukentta.replaceAll(" ","");
    //asetetaan virhe jos maksu tai potti eivät ole positiivisia lukuja
    var pottivirhe = document.getElementById("pottivirhe");
    var maksuvirhe = document.getElementById("maksuvirhe");
    var pvirhe = "";
    var mvirhe = "";
    var virhe = 0;
    if(isNaN(pottikentta) || pottikentta === "" || pottikentta <= 0){
        pvirhe = "Syötä luku";
        virhe = 1;
    }
    if(isNaN(maksukentta) || maksukentta === "" || maksukentta <= 0){
        mvirhe = "Syötä positiivinen luku";
        virhe = 1;
    }
    //haetaan tuloselementti
    var tulos = document.getElementById("tulos");
    var maksuflop = document.getElementById("maksuflop");
    maksuflop.innerHTML = ""
    var maksuriver = document.getElementById("maksuriver");
    maksuriver.innerHTML = ""
    //lasketaan pottikerroin ja asetetaan se sivulle jos ei ole virheitä
    //asetetaan virheet sivulle
    if(virhe == 0){
        pottikerroin = maksukentta / pottikentta;
        //listataan vedot, joilla saadulla kertoimella maksetaan
        for(var[kasi, todnak] of Object.entries(postflop)){
            todnak = parseFloat(`${todnak}`);
            if(todnak >= pottikerroin){
                maksuflop.innerHTML += `<li>${kasi}</a></li>`;
            }
        }
        for(var[kasi, todnak] of Object.entries(river)){
            todnak = parseFloat(`${todnak}`);
            if(todnak >= pottikerroin){
                maksuriver.innerHTML += `<li>${kasi}</a></li>`;
            }
        }
        tulos.innerHTML = "Pottikerroin on " +
        (Math.round((pottikerroin + Number.EPSILON) * 100) / 100).toString();
        pottivirhe.innerHTML = pvirhe;
        maksuvirhe.innerHTML = mvirhe;
    }
    else{
        pottivirhe.innerHTML = pvirhe;
        maksuvirhe.innerHTML = mvirhe;
        tulos.innerHTML = "";
    }

    //pythonilla käsiteltäväksi vietävät tiedot
    var server_data = [
    {
    "pottikentta": pottikentta
    }
    ];
    //tehdään ajax-kutsu
    $.ajax({
        type: "POST",
        url: "/poskeri",
        data: JSON.stringify(server_data),
        contentType: "application/json",
        dataType: 'json',
        success: function(poskerijutut) {
            console.log("Result:");
            console.log(poskerijutut);
        }
    });
}

//käsitellään panoskokolaskurin toiminta
function pokeripanos(){
    //Haetaan pottikentän sisältö
    var pottikentta = document.getElementById("potti").value;
    //Muutetaan desimaalipilkku desimaalipisteeksi potista ja
    //poistetaan tyhjät
    pottikentta = pottikentta.replace(",",".");
    pottikentta = pottikentta.replaceAll(" ","");
    //asetetaan virhe jos potti ei ole positiivinen luku
    var pottivirhe = document.getElementById("pottivirhe");
    var maksuvirhe = document.getElementById("maksuvirhe");
    var pvirhe = "";
    var virhe = 0;
    if(isNaN(pottikentta) || pottikentta === "" || pottikentta <= 0){
        pvirhe = "Syötä positiivinen luku";
        virhe = 1;
    }
    //haetaan elementit joihin asetetaan tulokset
    var panosflop = document.getElementById("panosflop");
    panosflop.innerHTML = ""
    var panosriver = document.getElementById("panosriver");
    panosriver.innerHTML = ""
    //lasketaan panoksen suuruus eri vetoja vastaan
    //asetetaan virheet sivulle
    if(virhe == 0){
        //listataan vedot ja panos niitä vastaan
        for(var[kasi, todnak] of Object.entries(postflop)){
            todnak = parseFloat(`${todnak}`);
            panos = pottikentta/((1/todnak)-1);
            if(panos > 0 && todnak > 0.1){
                panos = (Math.round((panos + Number.EPSILON) * 10) / 10).toString();
                panosflop.innerHTML += `<li>${kasi}: <b>panos > ${panos}</b></a></li>`;
            }
        }
        for(var[kasi, todnak] of Object.entries(river)){
            todnak = parseFloat(`${todnak}`);
            panos = pottikentta/((1/todnak)-1);
            if(panos > 0 && todnak > 0.1){
                panos = (Math.round((panos + Number.EPSILON) * 10) / 10).toString();
                panosriver.innerHTML += `<li>${kasi}: <b>panos > ${panos}</b></a></li>`;
            }
        }
        pottivirhe.innerHTML = pvirhe;
        maksuvirhe.innerHTML = ""
    }
    else{
        pottivirhe.innerHTML = pvirhe;
        maksuvirhe.innerHTML = ""
    }
    //pythonilla käsiteltäväksi vietävät tiedot
    var server_data = [
    {
    "pottikentta": pottikentta
    }
    ];
    //tehdään ajax-kutsu
    $.ajax({
        type: "POST",
        url: "/poskeri",
        data: JSON.stringify(server_data),
        contentType: "application/json",
        dataType: 'json',
        success: function(result) {
            console.log("Result:");
            console.log(result);
        }
    });
}

//käsitellään uuden pelin lisäys
function lisaaPeli(){
    var lisayspaikka = document.getElementById("lisaapelikentat");
    lisayspaikka.innerHTML += '<p>Syötä pelin tiedot:<p>';
    lisayspaikka.innerHTML += `<label for="pelityypit">Pelityyppi</label>
            <select id="pelityypit">
            <option value="Turnaus">Turnaus</option>
            <option value="Spin &Gold"/>Spin & Gold</option>
            <option value="Mystery Battle Royale"/>Mystery Battle Royale</option>
            <option value="Rush & Cash"/>Rush & Cash</option></select>`;
    lisayspaikka.innerHTML += `<br><br><label for="tnimi">Nimi</label>
            <input type="text" id="tnimi"/>`;
    lisayspaikka.innerHTML += `<br><br><label for="sisaanosto">Sisäänosto</label>
            <input type="text" id="sisaanosto"><select id="valuutta">
            <option value="USD">USD</option>
            <option value="EUR">EUR</option>
            <option value="Lippu">Lippu</option></select>`;
    lisayspaikka.innerHTML += `<br><br><label for="sijoitus">Sijoitus</label>
            <input type="number" id="sijoitus"/><br><br><label for="osallistujat">
            Osallistujat</label><input type="number" id="osallistujat"/>`;
}